'use client';

import { useEffect, useState } from 'react';

type Cell = { value: number; given: boolean };
type Board = Cell[][];

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ value: 0, given: false })));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function solve(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const n of nums) {
        if (!isValid(board, r, c, n)) continue;
        board[r][c] = n;
        if (solve(board)) return true;
        board[r][c] = 0;
      }
      return false;
    }
  }
  return true;
}

function isValid(board: number[][], r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === n || board[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[br + i][bc + j] === n) return false;
    }
  }
  return true;
}

function generatePuzzle(difficulty: number): Board {
  const sol: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(sol);
  const cells = Array.from({ length: 81 }, (_, i) => i);
  for (const i of shuffle(cells).slice(0, difficulty)) {
    sol[Math.floor(i / 9)][i % 9] = 0;
  }
  const board = emptyBoard();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = sol[r][c];
      board[r][c] = { value: v, given: v !== 0 };
    }
  }
  return board;
}

const DIFFICULTIES = [
  { label: 'Easy', holes: 36 },
  { label: 'Medium', holes: 46 },
  { label: 'Hard', holes: 54 },
];

export function SudokuGame() {
  const [board, setBoard] = useState<Board>(() => generatePuzzle(46));
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const complete = board.every((row) => row.every((cell) => cell.value !== 0));
    if (!complete) return;
    const nums = board.map((row) => row.map((cell) => cell.value));
    const correct = board.every((row, r) => row.every((cell, c) => cell.given || isValid(nums, r, c, cell.value)));
    if (correct) setGameOver(true);
  }, [board]);

  function newGame(difficulty: number) {
    setBoard(generatePuzzle(difficulty));
    setSelected(null);
    setGameOver(false);
  }

  function place(n: number) {
    if (!selected || gameOver) return;
    const { r, c } = selected;
    if (board[r][c].given) return;
    const prev = board[r][c].value;
    if (prev === n) return;
    const next = board.map((row) => row.map((cell) => ({ ...cell })));
    next[r][c].value = n;
    setBoard(next);
  }

  function isConflict(r: number, c: number): boolean {
    const v = board[r][c].value;
    if (v === 0) return false;
    return !isValid(board.map((row) => row.map((cell) => cell.value)), r, c, v);
  }

  function sameGroup(r1: number, c1: number, r2: number, c2: number): boolean {
    return r1 === r2 || c1 === c2 || (Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3));
  }

  return (
    <div className="sudoku">
      <div className="sudoku-top">
        <div className="sudoku-diffs">
          {DIFFICULTIES.map((d) => (
            <button key={d.label} type="button" className="sudoku-diff" onClick={() => newGame(d.holes)}>{d.label}</button>
          ))}
        </div>
        <div className="sudoku-stats">
          {gameOver && <span className="sudoku-win">✓ Solved!</span>}
        </div>
      </div>
      <div className="sudoku-board" role="grid" aria-label="Sudoku board">
        {board.map((row, r) => (
          <div key={r} className="sudoku-row">
            {row.map((cell, c) => {
              const conflict = isConflict(r, c);
              const selectedCell = selected && selected.r === r && selected.c === c;
              const same = selected && sameGroup(selected.r, selected.c, r, c);
              return (
                <button
                  key={c}
                  type="button"
                  className={`sudoku-cell${cell.given ? ' given' : ''}${conflict ? ' conflict' : ''}${selectedCell ? ' selected' : ''}${same && !selectedCell ? ' related' : ''}`}
                  onClick={() => setSelected({ r, c })}
                  aria-label={`Row ${r + 1} column ${c + 1} value ${cell.value || 'empty'}`}
                >
                  {cell.value || ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sudoku-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} type="button" className="sudoku-num" onClick={() => place(n)}>{n}</button>
        ))}
        <button type="button" className="sudoku-num clear" onClick={() => place(0)}>✕</button>
      </div>
    </div>
  );
}
