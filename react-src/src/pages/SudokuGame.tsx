import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Volume2, Sparkles, HelpCircle, Eraser, CheckCircle2, Play, Lightbulb } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

type SudokuGrid = number[][];

// 经典数独初始题库模板 (0 为空位)
const PUZZLES: Record<string, number[][]> = {
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  medium: [
    [0, 0, 0, 6, 0, 0, 4, 0, 0],
    [7, 0, 0, 0, 0, 3, 6, 0, 0],
    [0, 0, 0, 0, 9, 1, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 1, 8, 0, 0, 0, 3],
    [0, 0, 0, 3, 0, 6, 0, 4, 5],
    [0, 4, 0, 2, 0, 0, 0, 6, 0],
    [9, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 1, 0, 0],
  ],
};

// 回溯求解算法 (来自 project/toolbox)
function solveSudoku(board: SudokuGrid): SudokuGrid | null {
  const clone: SudokuGrid = board.map((row) => [...row]);

  function isValid(r: number, c: number, num: number) {
    for (let i = 0; i < 9; i++) {
      if (clone[r][i] === num || clone[i][c] === num) return false;
      const boxR = 3 * Math.floor(r / 3) + Math.floor(i / 3);
      const boxC = 3 * Math.floor(c / 3) + (i % 3);
      if (clone[boxR][boxC] === num) return false;
    }
    return true;
  }

  function solve(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (clone[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(r, c, num)) {
              clone[r][c] = num;
              if (solve()) return true;
              clone[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  return solve() ? clone : null;
}

export default function SudokuGame() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [board, setBoard] = useState<SudokuGrid>(() => PUZZLES.easy.map((r) => [...r]));
  const [initialMask, setInitialMask] = useState<boolean[][]>(() =>
    PUZZLES.easy.map((row) => row.map((val) => val !== 0))
  );

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [timerSec, setTimerSec] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // 重新开始指定难度的游戏
  const startNewGame = useCallback((diff: 'easy' | 'medium') => {
    const raw = PUZZLES[diff].map((r) => [...r]);
    setBoard(raw);
    setInitialMask(raw.map((row) => row.map((val) => val !== 0)));
    setTimerSec(0);
    setCompleted(false);
    setSelectedCell([0, 0]);
  }, []);

  // 计时器
  useEffect(() => {
    if (completed) return;
    const interval = setInterval(() => {
      setTimerSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [completed]);

  // 检查是否冲突
  const hasConflict = (r: number, c: number, val: number): boolean => {
    if (val === 0) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== c && board[r][i] === val) return true;
      if (i !== r && board[i][c] === val) return true;
      const boxR = 3 * Math.floor(r / 3) + Math.floor(i / 3);
      const boxC = 3 * Math.floor(c / 3) + (i % 3);
      if ((boxR !== r || boxC !== c) && board[boxR][boxC] === val) return true;
    }
    return false;
  };

  // 检查是否获胜
  const checkWin = (currBoard: SudokuGrid) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currBoard[r][c] === 0 || hasConflict(r, c, currBoard[r][c])) return false;
      }
    }
    return true;
  };

  // 填数
  const handleInputNumber = (num: number) => {
    if (!selectedCell || completed) return;
    const [r, c] = selectedCell;
    if (initialMask[r][c]) return; // 初始题目不可修改

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setCompleted(true);
      speakText('太棒了！数独挑战全部完成！');
    }
  };

  // 擦除
  const handleErase = () => {
    if (!selectedCell || completed) return;
    const [r, c] = selectedCell;
    if (initialMask[r][c]) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  };

  // 智能提示当前格正确答案
  const handleHint = () => {
    if (!selectedCell || completed) return;
    const [r, c] = selectedCell;
    if (initialMask[r][c]) return;

    const solved = solveSudoku(PUZZLES[difficulty]);
    if (solved) {
      const correctVal = solved[r][c];
      handleInputNumber(correctVal);
      speakText(`提示：该格填入 ${correctVal}`);
    }
  };

  // 格式化时间
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none pb-12">
      <AppPageHeader title="趣味数独挑战" onBack={() => navigate(-1)} />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {/* 顶部控制栏 */}
        <div className="flex items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setDifficulty('easy');
                startNewGame('easy');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                difficulty === 'easy' ? 'bg-amber-400 text-amber-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              入门模式
            </button>
            <button
              onClick={() => {
                setDifficulty('medium');
                startNewGame('medium');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                difficulty === 'medium' ? 'bg-amber-400 text-amber-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              进阶挑战
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 shadow-sm">
              ⏱️ {formatTime(timerSec)}
            </div>
            <button
              onClick={() => startNewGame(difficulty)}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              title="重开本局"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 9x9 数独棋盘 */}
        <div className="bg-white p-2.5 rounded-3xl shadow-sm border-2 border-slate-300 w-full max-w-xs md:max-w-sm mx-auto">
          <div className="grid grid-cols-9 gap-0.5 border border-slate-400 rounded-xl overflow-hidden bg-slate-300">
            {board.map((row, r) =>
              row.map((val, c) => {
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isFixed = initialMask[r][c];
                const conflict = val > 0 && hasConflict(r, c, val);

                // 3x3 粗边框区分
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-600' : '';
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-600' : '';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => setSelectedCell([r, c])}
                    className={`aspect-square flex items-center justify-center text-sm md:text-base font-black transition-all ${borderBottom} ${borderRight} ${
                      isSelected
                        ? 'bg-amber-200 text-amber-950'
                        : isFixed
                        ? 'bg-slate-100 text-slate-800 font-extrabold'
                        : val > 0
                        ? 'bg-white text-indigo-600'
                        : 'bg-white text-transparent'
                    } ${conflict ? 'text-red-500 bg-red-50' : ''}`}
                  >
                    {val > 0 ? val : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 完成祝贺横幅 */}
        {completed && (
          <div className="bg-emerald-500 text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-md animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>恭喜通关！耗时 {formatTime(timerSec)}！</span>
          </div>
        )}

        {/* 底部 1~9 数字填数按键 + 工具 */}
        <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100 space-y-2">
          <div className="grid grid-cols-9 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleInputNumber(num)}
                className="py-2.5 bg-slate-50 hover:bg-amber-100 rounded-xl text-base font-black text-slate-800 active:scale-90 transition-all shadow-sm border border-slate-200"
              >
                {num}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleErase}
              className="py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Eraser className="w-3.5 h-3.5" />
              擦除
            </button>
            <button
              onClick={handleHint}
              className="py-2 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold text-amber-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              智能提示
            </button>
          </div>
        </div>

        {/* 说明 */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 justify-center">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>点击棋盘格子，再点击下方数字填入，保证每行每列每宫数字不重复</span>
        </div>
      </main>
    </div>
  );
}
