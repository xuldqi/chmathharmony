import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type Peg = number[]; // 柱子上的盘子大小列表，底大顶小，例如 [3, 2, 1]

export default function HanoiTowerGame() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [disksCount, setDisksCount] = useState<number>(3);
  const [pegs, setPegs] = useState<[Peg, Peg, Peg]>(() => {
    const p1: number[] = [];
    for (let i = 3; i >= 1; i--) p1.push(i);
    return [p1, [], []];
  });
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isAutoSolving, setIsAutoSolving] = useState<boolean>(false);

  const autoTimerRef = useRef<number | null>(null);

  const minMoves = Math.pow(2, disksCount) - 1;

  // 重置游戏
  const resetGame = useCallback((count: number = disksCount) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setIsAutoSolving(false);
    setSelectedPeg(null);
    setMoves(0);
    setIsWon(false);

    const p1: number[] = [];
    for (let i = count; i >= 1; i--) p1.push(i);
    setPegs([p1, [], []]);
    speakText(`汉诺塔 ${count} 层，开始挑战！`);
  }, [disksCount, speakText]);

  const handleDisksChange = (count: number) => {
    setDisksCount(count);
    resetGame(count);
  };

  // 点击柱子
  const handlePegClick = (pegIdx: number) => {
    if (isWon || isAutoSolving) return;

    if (selectedPeg === null) {
      // 选中起始柱
      if (pegs[pegIdx].length === 0) return;
      setSelectedPeg(pegIdx);
    } else {
      if (selectedPeg === pegIdx) {
        // 取消选中
        setSelectedPeg(null);
        return;
      }

      const fromPeg = [...pegs[selectedPeg]];
      const toPeg = [...pegs[pegIdx]];
      const movingDisk = fromPeg[fromPeg.length - 1];
      const targetTop = toPeg.length > 0 ? toPeg[toPeg.length - 1] : Infinity;

      if (movingDisk > targetTop) {
        speakText('大盘不能压在小盘上方哦');
        setSelectedPeg(null);
        return;
      }

      // 合法移动
      fromPeg.pop();
      toPeg.push(movingDisk);

      const nextPegs: [Peg, Peg, Peg] = [...pegs];
      nextPegs[selectedPeg] = fromPeg;
      nextPegs[pegIdx] = toPeg;

      setPegs(nextPegs);
      setSelectedPeg(null);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // 通关检查：所有盘子移动到柱 C (下标 2)
      if (nextPegs[2].length === disksCount) {
        setIsWon(true);
        speakText(`太棒了！用时 ${nextMoves} 步，成功解出 ${disksCount} 层汉诺塔！`);
      }
    }
  };

  // 递归自动求解器
  const handleAutoSolve = () => {
    if (isAutoSolving) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      setIsAutoSolving(false);
      return;
    }

    // 重置后开始
    const p1: number[] = [];
    for (let i = disksCount; i >= 1; i--) p1.push(i);
    let curPegs: [Peg, Peg, Peg] = [p1, [], []];
    setPegs(curPegs);
    setMoves(0);
    setIsWon(false);
    setIsAutoSolving(true);
    setSelectedPeg(null);

    // 生成移动步骤序列
    const steps: [number, number][] = [];
    const solve = (n: number, from: number, to: number, aux: number) => {
      if (n === 1) {
        steps.push([from, to]);
        return;
      }
      solve(n - 1, from, aux, to);
      steps.push([from, to]);
      solve(n - 1, aux, to, from);
    };
    solve(disksCount, 0, 2, 1);

    let stepIdx = 0;
    const runNext = () => {
      if (stepIdx >= steps.length) {
        setIsAutoSolving(false);
        setIsWon(true);
        speakText('自动演示完成，理论最少步数达成！');
        return;
      }

      const [from, to] = steps[stepIdx];
      const f = [...curPegs[from]];
      const t = [...curPegs[to]];
      const disk = f.pop()!;
      t.push(disk);
      curPegs = [...curPegs];
      curPegs[from] = f;
      curPegs[to] = t;

      setPegs(curPegs);
      setMoves(stepIdx + 1);
      stepIdx++;

      autoTimerRef.current = window.setTimeout(runNext, 450);
    };

    speakText('开始自动演示递归解法');
    runNext();
  };

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  const COLORS = ['#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#8B5CF6'];

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
          <h1 className="text-lg font-black text-slate-800">汉诺塔数学益智</h1>
          <span className="text-xs font-semibold text-rose-500">递归移动·最少 {minMoves} 步</span>
        </div>
        <button
          onClick={() => resetGame()}
          className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          重置
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 层数选择与数据看板 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {[3, 4, 5, 6].map(cnt => (
              <button
                key={cnt}
                disabled={isAutoSolving}
                onClick={() => handleDisksChange(cnt)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                  disksCount === cnt
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cnt} 层
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block">当前步数</span>
              <span className="text-xl font-black text-slate-800">{moves}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block">最少步数</span>
              <span className="text-xl font-black text-rose-600">{minMoves}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block">状态</span>
              <span className={`text-base font-black ${isWon ? 'text-emerald-600' : 'text-slate-700'}`}>
                {isWon ? '🏆 通关' : isAutoSolving ? '演示中' : '进行中'}
              </span>
            </div>
          </div>
        </div>

        {/* 汉诺塔柱子游戏区 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 items-center">
          <div className="w-full flex justify-around items-end h-56 pt-6 pb-2 relative">
            {pegs.map((pegDisks, pegIdx) => {
              const isSelected = selectedPeg === pegIdx;
              return (
                <button
                  key={pegIdx}
                  type="button"
                  onClick={() => handlePegClick(pegIdx)}
                  className={`w-28 flex flex-col items-center justify-end h-full relative cursor-pointer group transition-all`}
                >
                  {/* 柱子立柱 */}
                  <div
                    className={`w-3.5 h-44 rounded-full transition-all ${
                      isSelected ? 'bg-rose-500 scale-105' : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                  />

                  {/* 柱子底座 */}
                  <div className="w-24 h-3 bg-slate-300 rounded-lg absolute bottom-0" />

                  {/* 盘子堆叠展示 */}
                  <div className="absolute bottom-3 w-full flex flex-col-reverse items-center gap-1">
                    {pegDisks.map((diskSize, dIdx) => {
                      const isTop = dIdx === pegDisks.length - 1;
                      const widthPercent = 35 + (diskSize / disksCount) * 55;
                      const bg = COLORS[(diskSize - 1) % COLORS.length];

                      return (
                        <div
                          key={dIdx}
                          className={`h-5 rounded-lg flex items-center justify-center text-[10px] text-white font-black shadow-xs transition-transform ${
                            isSelected && isTop ? '-translate-y-3 ring-2 ring-rose-400 animate-bounce' : ''
                          }`}
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: bg,
                          }}
                        >
                          {diskSize}
                        </div>
                      );
                    })}
                  </div>

                  <span className="absolute -bottom-5 text-xs font-extrabold text-slate-400">
                    柱 {['A (起点)', 'B (中转)', 'C (目标)'][pegIdx]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center w-full mt-6 px-1">
            <span className="text-xs text-slate-400 font-semibold">
              点击柱子选择，再点击目标柱移动
            </span>
            <button
              onClick={handleAutoSolve}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
                isAutoSolving
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 active:scale-95'
              }`}
            >
              {isAutoSolving ? '停止演示' : '🤖 自动演示'}
            </button>
          </div>
        </div>

        {/* 获胜祝贺浮层 */}
        {isWon && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg text-center flex flex-col items-center gap-2">
            <span className="text-3xl">🎉 恭喜通关！</span>
            <div className="text-sm font-bold opacity-90">
              您成功将全部 {disksCount} 个圆盘转移至柱 C！共耗费 {moves} 步（最优步数 {minMoves} 步）。
            </div>
            <button
              onClick={() => resetGame()}
              className="mt-2 bg-white text-rose-600 text-xs font-black px-5 py-2 rounded-xl shadow-xs active:scale-95 transition-all"
            >
              挑战更高难度
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
