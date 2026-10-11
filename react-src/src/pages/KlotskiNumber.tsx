import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type GridSize = 3 | 4;

// 生成已解决的目标棋盘
function getGoalBoard(size: GridSize): number[] {
  const len = size * size;
  const board: number[] = [];
  for (let i = 1; i < len; i++) {
    board.push(i);
  }
  board.push(0); // 0 代表空白格
  return board;
}

// 模拟随机合法移动生成100%有解的随机棋盘
function generateSolvableBoard(size: GridSize, steps: number = 100): number[] {
  const board = getGoalBoard(size);
  let emptyIdx = board.length - 1;
  let lastMove = -1;

  for (let i = 0; i < steps; i++) {
    const r = Math.floor(emptyIdx / size);
    const c = emptyIdx % size;
    const neighbors: number[] = [];

    if (r > 0) neighbors.push(emptyIdx - size); // 上
    if (r < size - 1) neighbors.push(emptyIdx + size); // 下
    if (c > 0) neighbors.push(emptyIdx - 1); // 左
    if (c < size - 1) neighbors.push(emptyIdx + 1); // 右

    // 尽量不走回头路
    const validMoves = neighbors.filter(idx => idx !== lastMove);
    const chosen = validMoves.length > 0
      ? validMoves[Math.floor(Math.random() * validMoves.length)]
      : neighbors[Math.floor(Math.random() * neighbors.length)];

    // 交换
    board[emptyIdx] = board[chosen];
    board[chosen] = 0;
    lastMove = emptyIdx;
    emptyIdx = chosen;
  }

  // 如果随机后恰好已经是目标状态，再多走两步
  if (isWin(board, size)) {
    return generateSolvableBoard(size, steps + 10);
  }

  return board;
}

// 检查是否获胜
function isWin(board: number[], size: GridSize): boolean {
  const goal = getGoalBoard(size);
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== goal[i]) return false;
  }
  return true;
}

export default function KlotskiNumber() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [size, setSize] = useState<GridSize>(3);
  const [board, setBoard] = useState<number[]>(() => generateSolvableBoard(3, 80));
  const [history, setHistory] = useState<number[][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);

  // 最佳记录存储
  const [bestRecords, setBestRecords] = useState<{ [key: string]: { moves: number; seconds: number } }>(() => {
    try {
      const data = localStorage.getItem('klotski_best_records');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  const timerRef = useRef<number | null>(null);

  // 计时器处理
  useEffect(() => {
    if (isPlaying && !isWon) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isWon]);

  // 重置/重新开局
  const startNewGame = useCallback((newSize: GridSize = size) => {
    const freshBoard = generateSolvableBoard(newSize, newSize === 3 ? 80 : 120);
    setBoard(freshBoard);
    setHistory([]);
    setMoves(0);
    setSeconds(0);
    setIsPlaying(false);
    setIsWon(false);
    speakText(`数字华容道 ${newSize}乘${newSize}，开局！`);
  }, [size, speakText]);

  // 切换难度
  const handleSizeChange = (newSize: GridSize) => {
    if (newSize === size) return;
    setSize(newSize);
    startNewGame(newSize);
  };

  // 点击格子移动
  const handleTileClick = (index: number) => {
    if (isWon) return;
    const tileVal = board[index];
    if (tileVal === 0) return; // 空格不能点

    const emptyIdx = board.indexOf(0);
    const tileRow = Math.floor(index / size);
    const tileCol = index % size;
    const emptyRow = Math.floor(emptyIdx / size);
    const emptyCol = emptyIdx % size;

    // 检查是否在同一行或同一列（支持顺次推挤）
    const isSameRow = tileRow === emptyRow;
    const isSameCol = tileCol === emptyCol;

    if (!isSameRow && !isSameCol) return; // 无法推挤

    if (!isPlaying) {
      setIsPlaying(true);
    }

    // 保存悔步历史
    setHistory(prev => [...prev, [...board]]);

    const newBoard = [...board];

    if (isSameRow) {
      // 水平方向移动
      const step = tileCol < emptyCol ? 1 : -1;
      for (let c = emptyCol; c !== tileCol; c -= step) {
        const curr = tileRow * size + c;
        const next = tileRow * size + (c - step);
        newBoard[curr] = newBoard[next];
      }
      newBoard[index] = 0;
    } else {
      // 垂直方向移动
      const step = tileRow < emptyRow ? 1 : -1;
      for (let r = emptyRow; r !== tileRow; r -= step) {
        const curr = r * size + tileCol;
        const next = (r - step) * size + tileCol;
        newBoard[curr] = newBoard[next];
      }
      newBoard[index] = 0;
    }

    setBoard(newBoard);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    // 获胜检查
    if (isWin(newBoard, size)) {
      setIsWon(true);
      setIsPlaying(false);
      speakText(`恭喜你，用了${nextMoves}步，成功还原数字华容道！太棒了！`);

      // 更新最高分记录
      const key = `${size}x${size}`;
      const currentBest = bestRecords[key];
      const isNewRecord = !currentBest || nextMoves < currentBest.moves;
      if (isNewRecord) {
        const updated = {
          ...bestRecords,
          [key]: { moves: nextMoves, seconds: seconds + 1 },
        };
        setBestRecords(updated);
        try {
          localStorage.setItem('klotski_best_records', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    }
  };

  // 悔步
  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const lastBoard = history[history.length - 1];
    setBoard(lastBoard);
    setHistory(prev => prev.slice(0, -1));
    setMoves(prev => Math.max(0, prev - 1));
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentBest = bestRecords[`${size}x${size}`];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="数字华容道"
          subtitle={`{size}×{size} 经典拼图`}
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={() => startNewGame()} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">重新打乱</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 模式选择与数据统计 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => handleSizeChange(3)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                size === 3
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              3×3 经典速通
            </button>
            <button
              onClick={() => handleSizeChange(4)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                size === 4
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              4×4 标准挑战
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block">步数</span>
              <span className="text-lg font-black text-slate-800">{moves}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block">用时</span>
              <span className="text-lg font-black text-slate-800">{formatTime(seconds)}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block">最佳步数</span>
              <span className="text-lg font-black text-amber-500">
                {currentBest ? `${currentBest.moves} 步` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* 华容道拼图棋盘 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
          <div
            className={`w-full aspect-square max-w-[340px] bg-slate-200/80 p-2.5 rounded-2xl grid gap-2 ${
              size === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}
          >
            {board.map((val, idx) => {
              if (val === 0) {
                return (
                  <div
                    key="empty"
                    className="rounded-xl bg-slate-300/40 border border-dashed border-slate-300/60"
                  />
                );
              }

              // 检查该数字是否位于正确的复原位置
              const isCorrectPos = val === idx + 1;

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleTileClick(idx)}
                  className={`rounded-xl flex items-center justify-center font-black active:scale-95 transition-all cursor-pointer ${
                    size === 3 ? 'text-3xl' : 'text-2xl'
                  } ${
                    isCorrectPos
                      ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-sm'
                      : 'bg-white text-slate-800 hover:bg-slate-50 shadow-md'
                  }`}
                  style={{
                    boxShadow: isCorrectPos
                      ? '0 4px 0 #059669'
                      : '0 4px 0 #CBD5E1',
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between w-full max-w-[340px] mt-4 px-1 items-center">
            <span className="text-xs text-slate-400 font-semibold">
              点击空白格旁边的滑块滑动
            </span>
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || isWon}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
                history.length === 0 || isWon
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 active:scale-95'
              }`}
            >
              ⌫ 悔一步
            </button>
          </div>
        </div>

        {/* 获胜祝贺浮层 */}
        {isWon && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 text-white shadow-lg flex flex-col items-center text-center gap-2">
            <div className="text-3xl">�恭喜通关！</div>
            <div className="text-sm font-bold opacity-90">
              您用 {moves} 步，耗时 {formatTime(seconds)} 成功复原数字华容道！
            </div>
            <button
              onClick={() => startNewGame()}
              className="mt-2 bg-white text-emerald-700 font-black px-6 py-2 rounded-2xl shadow-md active:scale-95 transition-all text-sm"
            >
              再来一局
            </button>
          </div>
        )}

        {/* 游戏规则提示 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-xs text-slate-500 flex flex-col gap-1.5">
          <div className="font-bold text-slate-700">�玩法说明：</div>
          <div>1. 将被打乱的数字滑块顺次移动复原成 1, 2, 3... 升序排列；</div>
          <div>2. 绿色高亮代表该数字已经处于正确的最终复原位置；</div>
          <div>3. 系统保证每次打乱 100% 具备数学可解性，请放心挑战！</div>
        </div>
      </main>
    </div>
  );
}
