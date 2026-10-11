import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

// 标准三阶幻方（和 = 15）
const GOAL_3X3 = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export default function MagicSquareGame() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 初始空缺题目
  const [board, setBoard] = useState<(number | null)[]>(() => [
    4, null, 2,
    null, 5, null,
    8, 1, null,
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isWon, setIsWon] = useState<boolean>(false);

  // 检查每行、每列、对角线和
  const rowSums = useMemo(() => {
    return [0, 1, 2].map(r => {
      const vals = [board[r * 3], board[r * 3 + 1], board[r * 3 + 2]];
      if (vals.some(v => v === null)) return null;
      return (vals[0]! + vals[1]! + vals[2]!);
    });
  }, [board]);

  const colSums = useMemo(() => {
    return [0, 1, 2].map(c => {
      const vals = [board[c], board[c + 3], board[c + 6]];
      if (vals.some(v => v === null)) return null;
      return (vals[0]! + vals[1]! + vals[2]!);
    });
  }, [board]);

  const diagSums = useMemo(() => {
    const d1 = [board[0], board[4], board[8]];
    const d2 = [board[2], board[4], board[6]];
    return [
      d1.some(v => v === null) ? null : d1[0]! + d1[1]! + d1[2]!,
      d2.some(v => v === null) ? null : d2[0]! + d2[1]! + d2[2]!,
    ];
  }, [board]);

  // 已使用的数字集合
  const usedNumbers = useMemo(() => {
    const set = new Set<number>();
    board.forEach(v => {
      if (v !== null) set.add(v);
    });
    return set;
  }, [board]);

  // 填入数字
  const handleInputNumber = (num: number) => {
    if (selectedIdx === null) return;
    const nextBoard = [...board];
    nextBoard[selectedIdx] = num;
    setBoard(nextBoard);

    // 检查是否全满且和全部等于 15
    const isFull = nextBoard.every(v => v !== null);
    if (isFull) {
      const rOk = [0, 1, 2].every(r => (nextBoard[r * 3]! + nextBoard[r * 3 + 1]! + nextBoard[r * 3 + 2]!) === 15);
      const cOk = [0, 1, 2].every(c => (nextBoard[c]! + nextBoard[c + 3]! + nextBoard[c + 6]!) === 15);
      const d1 = nextBoard[0]! + nextBoard[4]! + nextBoard[8]! === 15;
      const d2 = nextBoard[2]! + nextBoard[4]! + nextBoard[6]! === 15;

      if (rOk && cOk && d1 && d2) {
        setIsWon(true);
        speakText('太棒了！成功还原三阶洛书九宫格幻方，每条线和均为15！');
      }
    }
  };

  // 橡皮擦
  const handleErase = () => {
    if (selectedIdx === null) return;
    const nextBoard = [...board];
    nextBoard[selectedIdx] = null;
    setBoard(nextBoard);
    setIsWon(false);
  };

  // 一键填充标准解
  const handleShowSolution = () => {
    setBoard(GOAL_3X3.flat());
    setIsWon(true);
    speakText('已为您展现九宫格标准洛书幻方！');
  };

  // 重置题目
  const handleReset = () => {
    setBoard([
      4, null, 2,
      null, 5, null,
      8, 1, null,
    ]);
    setSelectedIdx(null);
    setIsWon(false);
    speakText('新一轮九宫格数阵挑战，开始！');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 font-bold active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800">九宫格幻方数阵</h1>
          <span className="text-xs font-semibold text-indigo-600">横竖斜和皆为 15</span>
        </div>
        <button
          onClick={handleReset}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          重置
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 游戏棋盘展示区 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center gap-4">
          <div className="flex justify-between items-center w-full px-1">
            <span className="text-xs font-bold text-slate-400">点击空格后填入 1~9</span>
            <span className="text-xs font-black text-indigo-600">目标和: 15</span>
          </div>

          {/* 3x3 九宫格 */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] aspect-square bg-slate-100 p-2.5 rounded-2xl">
            {board.map((val, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`rounded-xl flex items-center justify-center text-3xl font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md scale-105 ring-2 ring-indigo-400'
                      : val !== null
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'bg-slate-200/60 text-transparent border border-dashed border-slate-300'
                  }`}
                >
                  {val !== null ? val : ''}
                </button>
              );
            })}
          </div>

          {/* 校验和看板 */}
          <div className="grid grid-cols-3 gap-2 w-full text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">各行之和</span>
              <span className="font-black text-slate-700">
                {rowSums.map(s => s !== null ? s : '?').join(' | ')}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">各列之和</span>
              <span className="font-black text-slate-700">
                {colSums.map(s => s !== null ? s : '?').join(' | ')}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">对角线和</span>
              <span className="font-black text-slate-700">
                {diagSums.map(s => s !== null ? s : '?').join(' | ')}
              </span>
            </div>
          </div>
        </div>

        {/* 1~9 数字填入键盘 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
              const isUsed = usedNumbers.has(num);
              return (
                <button
                  key={num}
                  type="button"
                  disabled={selectedIdx === null || isUsed}
                  onClick={() => handleInputNumber(num)}
                  className={`py-3 rounded-2xl text-xl font-black transition-all ${
                    isUsed
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : selectedIdx === null
                      ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm active:scale-95'
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              type="button"
              disabled={selectedIdx === null}
              onClick={handleErase}
              className={`py-3 rounded-2xl text-xs font-black transition-all ${
                selectedIdx === null
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200 active:scale-95'
              }`}
            >
              擦除
            </button>
          </div>

          <button
            type="button"
            onClick={handleShowSolution}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black active:scale-98 transition-all"
          >
            💡 查看标准解法 (洛书口诀)
          </button>
        </div>

        {/* 获胜提示 */}
        {isWon && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-5 text-white shadow-lg text-center flex flex-col items-center gap-2">
            <span className="text-3xl">🎉 恭喜通关！</span>
            <div className="text-sm font-bold opacity-90">
              三阶洛书幻方复原成功！“戴九履一，左三右七，二四为肩，六八为足，五居中央”。
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
