import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Text, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Player, checkWinner, getBestMove } from './gameLogic';
import { Settings } from './components/Settings';
import { Menu } from './components/Menu';
import { Footer } from './components/Footer';
import confetti from 'canvas-confetti';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'game' | 'settings'>('home');
  const [gameMode, setGameMode] = useState<'ai' | 'friend' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'hard' | 'master'>('intermediate');
  const [playerNames, setPlayerNames] = useState({ X: 'Player 1', O: 'Player 2' });
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [settings, setSettings] = useState({ sound: true, vibration: true });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (settings.sound) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(() => console.log("Audio play blocked"));
    } else {
      audioRef.current?.pause();
    }
  }, [settings.sound, screen]);

  const handleMove = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    if (settings.vibration) {
      if (navigator.vibrate) navigator.vibrate(50);
    }

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner !== 'Draw') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const move = getBestMove(board, 'O', difficulty);
        handleMove(move);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, board, difficulty]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
      {screen === 'home' && (
        <Menu 
          onStartAI={(diff) => {
            setGameMode('ai');
            setDifficulty(diff);
            setScreen('game');
            resetGame();
          }}
          onStartFriend={(names) => {
            setGameMode('friend');
            setPlayerNames(names);
            setScreen('game');
            resetGame();
          }}
          onOpenSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'game' && (
        <div className="flex-1 relative flex flex-col items-center justify-center">
          <div className="absolute top-8 text-center z-10 pointer-events-none">
            <motion.h2 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black tracking-tighter uppercase italic text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]"
            >
              {winner ? (winner === 'Draw' ? "It's a Draw!" : `${winner === 'X' ? playerNames.X : playerNames.O} Wins!`) : `${currentPlayer === 'X' ? playerNames.X : playerNames.O}'s Turn`}
            </motion.h2>
          </div>

          <div className="w-full h-[70vh]">
            <Canvas shadows gl={{ antialias: false }}>
              <PerspectiveCamera makeDefault position={[0, 5, 10]} />
              <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
              <ambientLight intensity={0.2} />
              <pointLight position={[10, 10, 10]} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88" />
              
              <GameBoard 
                board={board} 
                onMove={handleMove} 
                winningLine={winningLine}
              />
              
              <Stars />
              
              <EffectComposer>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
              </EffectComposer>
            </Canvas>
          </div>

          <div className="flex gap-4 mt-8 z-10">
            <button 
              onClick={resetGame}
              className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(52,211,153,0.2)]"
            >
              Reset
            </button>
            <button 
              onClick={() => setScreen('home')}
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white/70 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Home
            </button>
          </div>
        </div>
      )}

      {screen === 'settings' && (
        <Settings 
          settings={settings} 
          setSettings={setSettings} 
          onBack={() => setScreen('home')} 
        />
      )}

      <Footer />
    </div>
  );
}

function GameBoard({ board, onMove, winningLine }: { board: Player[], onMove: (i: number) => void, winningLine: number[] | null }) {
  return (
    <group position={[0, 0, 0]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* Grid Lines - The "Difference between background and x box" */}
      <mesh position={[1.5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 9, 0.05]} />
        <meshStandardMaterial color="#111" emissive="#333" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1.5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 9, 0.05]} />
        <meshStandardMaterial color="#111" emissive="#333" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 9, 0.05]} />
        <meshStandardMaterial color="#111" emissive="#333" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 9, 0.05]} />
        <meshStandardMaterial color="#111" emissive="#333" emissiveIntensity={0.5} />
      </mesh>

      {/* Cells */}
      {board.map((cell, i) => {
        const x = (i % 3) - 1;
        const y = 1 - Math.floor(i / 3);
        const isWinning = winningLine?.includes(i);
        
        return (
          <group key={i} position={[x * 3, y * 3, 0]}>
            <mesh 
              onClick={() => onMove(i)} 
              onPointerOver={(e) => (document.body.style.cursor = 'pointer')} 
              onPointerOut={(e) => (document.body.style.cursor = 'auto')}
            >
              <planeGeometry args={[2.8, 2.8]} />
              <meshBasicMaterial transparent opacity={0.05} color="#fff" />
            </mesh>
            
            {cell === 'X' && <XMesh isWinning={isWinning} />}
            {cell === 'O' && <OMesh isWinning={isWinning} />}
          </group>
        );
      })}
    </group>
  );
}

function XMesh({ isWinning }: { isWinning?: boolean }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh castShadow>
          <boxGeometry args={[2, 0.2, 0.2]} />
          <meshStandardMaterial 
            color={isWinning ? "#fff" : "#ff0088"} 
            emissive={isWinning ? "#fff" : "#ff0088"} 
            emissiveIntensity={isWinning ? 20 : 5} 
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[2, 0.2, 0.2]} />
          <meshStandardMaterial 
            color={isWinning ? "#fff" : "#ff0088"} 
            emissive={isWinning ? "#fff" : "#ff0088"} 
            emissiveIntensity={isWinning ? 20 : 5} 
          />
        </mesh>
      </group>
    </Float>
  );
}

function OMesh({ isWinning }: { isWinning?: boolean }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh castShadow>
        <torusGeometry args={[0.7, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color={isWinning ? "#fff" : "#00ff88"} 
          emissive={isWinning ? "#fff" : "#00ff88"} 
          emissiveIntensity={isWinning ? 20 : 5} 
        />
      </mesh>
    </Float>
  );
}

function Stars() {
  const points = useRef<THREE.Points>(null!);
  const [coords] = useState(() => {
    const data = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      data[i] = (Math.random() - 0.5) * 50;
    }
    return data;
  });

  useFrame((state) => {
    points.current.rotation.y += 0.0005;
    points.current.rotation.x += 0.0002;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={coords.length / 3}
          array={coords}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#fff" transparent opacity={0.3} />
    </points>
  );
}

