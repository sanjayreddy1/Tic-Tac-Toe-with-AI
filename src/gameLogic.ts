
export type Player = 'X' | 'O' | 'Draw' | null;

export function checkWinner(board: Player[]): { winner: Player; line: number[] | null } {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every(cell => cell !== null)) {
    return { winner: 'Draw', line: null };
  }

  return { winner: null, line: null };
}

export function minimax(board: Player[], depth: number, isMaximizing: boolean, aiPlayer: Player): number {
  const result = checkWinner(board);
  if (result.winner === aiPlayer) return 10 - depth;
  if (result.winner === (aiPlayer === 'X' ? 'O' : 'X')) return depth - 10;
  if (result.winner === 'Draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

export function getBestMove(board: Player[], aiPlayer: Player, difficulty: 'easy' | 'intermediate' | 'hard' | 'master'): number {
  const availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
  
  if (difficulty === 'easy') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === 'intermediate') {
    // 40% chance of random move, 60% chance of best move
    if (Math.random() < 0.4) return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === 'hard') {
    // 10% chance of random move
    if (Math.random() < 0.1) return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}
