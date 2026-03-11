import React, { useState } from 'react';
import { Trophy, Users, Settings as SettingsIcon, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface MenuProps {
  onStartAI: (difficulty: 'easy' | 'intermediate' | 'hard' | 'master') => void;
  onStartFriend: (names: { X: string; O: string }) => void;
  onOpenSettings: () => void;
}

export function Menu({ onStartAI, onStartFriend, onOpenSettings }: MenuProps) {
  const [mode, setMode] = useState<'main' | 'ai-diff' | 'friend-names'>('main');
  const [names, setNames] = useState({ X: '', O: '' });

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* Background GIF */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4ZzZ4ZzZ4ZzZ4ZzZ4ZzZ4ZzZ4ZzZ4ZzZ4ZzZ4ZzZ4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxfG9I1I9G/giphy.gif" 
          alt="background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <h1 className="text-6xl font-black text-center mb-12 tracking-tighter italic">
          <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">RADIUM</span>
          <br />
          <span className="text-white">TIC TAC TOE</span>
        </h1>

        {mode === 'main' && (
          <div className="space-y-4">
            <MenuButton 
              icon={<Cpu className="w-6 h-6" />} 
              label="Play with AI" 
              onClick={() => setMode('ai-diff')}
              color="emerald"
            />
            <MenuButton 
              icon={<Users className="w-6 h-6" />} 
              label="Play with Friend" 
              onClick={() => setMode('friend-names')}
              color="pink"
            />
            <MenuButton 
              icon={<SettingsIcon className="w-6 h-6" />} 
              label="Settings" 
              onClick={onOpenSettings}
              color="white"
            />
          </div>
        )}

        {mode === 'ai-diff' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4 text-emerald-400 uppercase tracking-widest">Select Difficulty</h2>
            {(['easy', 'intermediate', 'hard', 'master'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => onStartAI(diff)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-black transition-all font-bold uppercase tracking-widest"
              >
                {diff}
              </button>
            ))}
            <button onClick={() => setMode('main')} className="w-full py-2 text-white/50 hover:text-white transition-all text-sm uppercase font-bold tracking-widest mt-4">Back</button>
          </div>
        )}

        {mode === 'friend-names' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center mb-4 text-pink-400 uppercase tracking-widest">Enter Names</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Player X</label>
                <input 
                  type="text" 
                  value={names.X} 
                  onChange={(e) => setNames({ ...names, X: e.target.value })}
                  placeholder="Name for X"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Player O</label>
                <input 
                  type="text" 
                  value={names.O} 
                  onChange={(e) => setNames({ ...names, O: e.target.value })}
                  placeholder="Name for O"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                />
              </div>
            </div>
            <button
              onClick={() => onStartFriend({ X: names.X || 'Player 1', O: names.O || 'Player 2' })}
              className="w-full py-4 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 transition-all font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(236,72,153,0.4)]"
            >
              Start Game
            </button>
            <button onClick={() => setMode('main')} className="w-full py-2 text-white/50 hover:text-white transition-all text-sm uppercase font-bold tracking-widest">Back</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: 'emerald' | 'pink' | 'white' }) {
  const colors = {
    emerald: "hover:bg-emerald-500 hover:text-black border-emerald-500/20 text-emerald-400",
    pink: "hover:bg-pink-500 hover:text-white border-pink-500/20 text-pink-400",
    white: "hover:bg-white hover:text-black border-white/20 text-white"
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl bg-white/5 border transition-all group ${colors[color]}`}
    >
      <div className="p-2 rounded-xl bg-white/5 group-hover:bg-black/10 transition-all">
        {icon}
      </div>
      <span className="text-lg font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
