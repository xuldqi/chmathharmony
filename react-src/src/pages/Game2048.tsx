import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Volume2, Trophy, Undo2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

const SIZE = 4;

type Board = number[][];

const COLOR_MAP: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-slate-100', text: 'text-transparent' },
  2: { bg: 'bg-amber-100', text: 'text-amber-900' },
  4: { bg: 'bg-amber-200', text: 'text-amber-900' },
  8: { bg: 'bg-orange-300', text: 'text-white' },
  16: { bg: 'bg-orange-400', text: 'text-white' },
  32: { bg: 'bg-orange-500', text: 'text-white' },
  64: { bg: 'bg-red-400', text: 'text-white' },
  128: { bg: 'bg-yellow-300', text: 'text-amber-950' },
  256: { bg: 'bg-yellow-400', text: 'text-amber-950' },
  512: { bg: 'bg-emerald-400', text: 'text-white' },
  1024: { bg: 'bg-teal-500', text: 'text-white' },
  2048: { bg: 'bg-indigo-600', text: 'text-white shadow-lg shadow-indigo-300' },
};

export default function Game2048() {
  const navigate = useNavigate();
  const { speakText } = useAudio();
  const isTab = useIsCurrentTab('/game-2048');

  const [board, setBoard] = useState<Board>(() => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState<number>(0);
  const [prevScore, setPrevScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('game_2048_best') || '0', 10);
  });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  // 添加随机数字
  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCells.push([r, c]);
        }
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const [randR, randC] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randR][randC] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  // 初始化新游戏
  const startNewGame = useCallback(() => {
    let newBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setPrevBoard(null);
    setScore(0);
    setPrevScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // 检查是否游戏结束
  const checkGameOver = (currentBoard: Board) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (r < SIZE - 1 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
        if (c < SIZE - 1 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      }
    }
    return true;
  };

  // 滑动核心逻辑 (左移一行)
  const slideAndMergeRow = (row: number[]): { newRow: number[]; gainedScore: number; merged: boolean } => {
    const nonZero = row.filter((x) => x !== 0);
    const resultRow: number[] = [];
    let gainedScore = 0;
    let merged = false;

    for (let i = 0; i < nonZero.length; i++) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const val = nonZero[i] * 2;
        resultRow.push(val);
        gainedScore += val;
        merged = true;
        if (val === 2048 && !won) {
          setWon(true);
          speakText('恭喜你！成功达成2048目标！');
        }
        i++; // 跳过下一个
      } else {
        resultRow.push(nonZero[i]);
      }
    }

    while (resultRow.length < SIZE) {
      resultRow.push(0);
    }

    return { newRow: resultRow, gainedScore, merged };
  };

  // 四方向移动
  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver) return;

      let gainedTotalScore = 0;
      let hasChange = false;
      let newBoard = board.map((row) => [...row]);

      if (direction === 'left') {
        for (let r = 0; r < SIZE; r++) {
          const { newRow, gainedScore } = slideAndMergeRow(newBoard[r]);
          gainedTotalScore += gainedScore;
          if (newRow.some((v, idx) => v !== newBoard[r][idx])) {
            hasChange = true;
          }
          newBoard[r] = newRow;
        }
      } else if (direction === 'right') {
        for (let r = 0; r < SIZE; r++) {
          const reversed = [...newBoard[r]].reverse();
          const { newRow, gainedScore } = slideAndMergeRow(reversed);
          const restored = newRow.reverse();
          gainedTotalScore += gainedScore;
          if (restored.some((v, idx) => v !== newBoard[r][idx])) {
            hasChange = true;
          }
          newBoard[r] = restored;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < SIZE; c++) {
          const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
          const { newRow, gainedScore } = slideAndMergeRow(col);
          gainedTotalScore += gainedScore;
          for (let r = 0; r < SIZE; r++) {
            if (newBoard[r][c] !== newRow[r]) hasChange = true;
            newBoard[r][c] = newRow[r];
          }
        }
      } else if (direction === 'down') {
        for (let c = 0; c < SIZE; c++) {
          const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]];
          const { newRow, gainedScore } = slideAndMergeRow(col);
          const restored = newRow.reverse();
          gainedTotalScore += gainedScore;
          for (let r = 0; r < SIZE; r++) {
            if (newBoard[r][c] !== restored[r]) hasChange = true;
            newBoard[r][c] = restored[r];
          }
        }
      }

      if (hasChange) {
        setPrevBoard(board.map((r) => [...r]));
        setPrevScore(score);

        const boardWithTile = addRandomTile(newBoard);
        const newScore = score + gainedTotalScore;
        setBoard(boardWithTile);
        setScore(newScore);

        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('game_2048_best', newScore.toString());
        }

        if (checkGameOver(boardWithTile)) {
          setGameOver(true);
          speakText(`游戏结束，您的最终得分为${newScore}分！`);
        }
      }
    },
    [board, score, bestScore, gameOver, won, speakText]
  );

  // 悔步撤回
  const undo = () => {
    if (!prevBoard) return;
    setBoard(prevBoard);
    setScore(prevScore);
    setPrevBoard(null);
    setGameOver(false);
  };

  // 手势触摸处理
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // 阈值防误触

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) move('right');
      else move('left');
    } else {
      if (dy > 0) move('down');
      else move('up');
    }
  };

  return (
    <div className={`min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-12'}`}>
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        <AppPageHeader
          title="2048 经典数字拼图"
          onBack={isTab ? undefined : () => navigate(-1)}
          showBack={!isTab}
        />

        <main className="flex-1 w-full space-y-4">
        {/* 顶部计分与控制 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-400">当前得分</div>
              <div className="text-lg font-black text-amber-600">{score}</div>
            </div>
            <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 justify-center">
                <Trophy className="w-3 h-3 text-amber-500" />
                最高纪录
              </div>
              <div className="text-lg font-black text-slate-800">{bestScore}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {prevBoard && (
              <button
                onClick={undo}
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-95 transition-all"
                title="撤销上一步"
              >
                <Undo2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={startNewGame}
              className="p-2.5 rounded-2xl bg-amber-400 text-amber-950 font-bold shadow-sm shadow-amber-300/40 active:scale-95 transition-all"
              title="重新开始"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2048 游戏主棋盘 */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-slate-200 p-3 rounded-3xl shadow-inner aspect-square w-full max-w-sm mx-auto flex flex-col justify-between"
        >
          {board.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-between gap-2.5 h-[22%]">
              {row.map((val, cIdx) => {
                const colorInfo = COLOR_MAP[val] || { bg: 'bg-indigo-700', text: 'text-white' };
                return (
                  <div
                    key={cIdx}
                    className={`flex-1 rounded-2xl flex items-center justify-center font-black transition-all ${colorInfo.bg} ${colorInfo.text} text-xl md:text-2xl shadow-sm`}
                  >
                    {val > 0 ? val : ''}
                  </div>
                );
              })}
            </div>
          ))}

          {/* 游戏结束覆盖遮罩 */}
          {gameOver && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white space-y-3 z-20">
              <span className="text-3xl font-black">游戏结束！</span>
              <p className="text-xs text-slate-200">最终得分：{score}</p>
              <button
                onClick={startNewGame}
                className="px-6 py-2.5 bg-amber-400 text-amber-950 font-black rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
              >
                再玩一局
              </button>
            </div>
          )}
        </div>

        {/* 辅助方向控制按键 (方便非手势滑动用户) */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => move('up')}
              className="w-12 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-700 active:scale-95 transition-all"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => move('left')}
                className="w-12 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-700 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => move('down')}
                className="w-12 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-700 active:scale-95 transition-all"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => move('right')}
                className="w-12 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-700 active:scale-95 transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 justify-center">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>在棋盘上任意方向滑动，相同数字方块碰撞将合并翻倍</span>
        </div>
      </main>
      </div>

      {isTab && <MainTabBar />}
    </div>
  );
}
