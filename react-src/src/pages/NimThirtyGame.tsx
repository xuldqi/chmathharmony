import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type Turn = 'player' | 'ai';

export default function NimThirtyGame() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [targetNum, setTargetNum] = useState<number>(30);
  const [maxStep, setMaxStep] = useState<number>(2); // 每次最多报几个数: 2 或 3
  const [aiLevel, setAiLevel] = useState<'easy' | 'smart'>('smart');

  const [currentNum, setCurrentNum] = useState<number>(0);
  const [turn, setTurn] = useState<Turn>('player');
  const [winner, setWinner] = useState<Turn | null>(null);
  const [history, setHistory] = useState<{ who: '玩家' | 'AI'; count: number; end: number }[]>([]);

  // 重置游戏
  const resetGame = () => {
    setCurrentNum(0);
    setTurn('player');
    setWinner(null);
    setHistory([]);
    speakText('抢30报数博弈开始！你先报数。');
  };

  // 玩家报数
  const handlePlayerMove = (count: number) => {
    if (turn !== 'player' || winner !== null) return;
    const nextVal = currentNum + count;
    setHistory(prev => [...prev, { who: '玩家', count, end: nextVal }]);
    setCurrentNum(nextVal);

    if (nextVal >= targetNum) {
      setWinner('player');
      speakText('🎉 太厉害了！你成功抢到了目标数字，获胜！');
      return;
    }

    setTurn('ai');
  };

  // AI 自动报数
  useEffect(() => {
    if (turn !== 'ai' || winner !== null) return;

    const timer = setTimeout(() => {
      let chosenStep = 1;
      const remain = targetNum - currentNum;

      if (aiLevel === 'smart') {
        // 必胜数论策略：关键点为 (target - k * (maxStep + 1))
        // 例如 target=30, maxStep=2 时，关键点为 30, 27, 24, 21, 18, 15, 12, 9, 6, 3
        const stepCycle = maxStep + 1;
        const targetMod = targetNum % stepCycle;
        const desiredMod = targetMod;
        const currentMod = currentNum % stepCycle;

        let diff = (desiredMod - currentMod + stepCycle) % stepCycle;
        if (diff === 0 || diff > maxStep) {
          chosenStep = Math.min(remain, Math.floor(Math.random() * maxStep) + 1);
        } else {
          chosenStep = Math.min(remain, diff);
        }
      } else {
        // 简单模式：随机 1~maxStep
        chosenStep = Math.min(remain, Math.floor(Math.random() * maxStep) + 1);
      }

      const nextVal = currentNum + chosenStep;
      setHistory(prev => [...prev, { who: 'AI', count: chosenStep, end: nextVal }]);
      setCurrentNum(nextVal);

      if (nextVal >= targetNum) {
        setWinner('ai');
        speakText(`AI 抢到了目标数字 ${targetNum}，AI 获胜！`);
      } else {
        setTurn('player');
        speakText(`电脑报了 ${chosenStep} 个数，当前是 ${nextVal}，轮到你了`);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [turn, winner, currentNum, targetNum, maxStep, aiLevel, speakText]);

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
          <h1 className="text-lg font-black text-slate-800">抢30报数博弈</h1>
          <span className="text-xs font-semibold text-emerald-600">数论同余必胜对决</span>
        </div>
        <button
          onClick={resetGame}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          新一局
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 规则设置 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>目标数字: {targetNum}</span>
            <span>每次可报: 1 ~ {maxStep} 个数</span>
            <span>AI: {aiLevel === 'smart' ? '智力大师' : '入门新手'}</span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => { setMaxStep(2); resetGame(); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                maxStep === 2 ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              报 1~2 个数
            </button>
            <button
              onClick={() => { setMaxStep(3); resetGame(); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                maxStep === 3 ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              报 1~3 个数
            </button>
          </div>
        </div>

        {/* 当前报数核心看板 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-400">当前已报数至</span>
          <div className="text-6xl font-black text-emerald-600 tracking-tight">
            {currentNum}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-slate-400">当前回合：</span>
            <span className={`text-xs font-black px-3 py-1 rounded-full ${
              turn === 'player'
                ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                : 'bg-rose-100 text-rose-700'
            }`}>
              {winner ? '游戏结束' : turn === 'player' ? '👉 轮到你报数' : '🤖 电脑思考中...'}
            </span>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentNum / targetNum) * 100)}%` }}
            />
          </div>
        </div>

        {/* 玩家报数操作台 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">选择要报几个数</span>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, ...(maxStep === 3 ? [3] : [])].map(count => (
              <button
                key={count}
                type="button"
                disabled={turn !== 'player' || winner !== null}
                onClick={() => handlePlayerMove(count)}
                className={`py-4 rounded-2xl text-xl font-black transition-all ${
                  turn === 'player' && winner === null
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
                style={{
                  boxShadow: turn === 'player' ? '0 4px 0 #059669' : 'none',
                }}
              >
                报 {count} 个数 (+{count})
              </button>
            ))}
          </div>
        </div>

        {/* 获胜结算 */}
        {winner && (
          <div className={`p-5 rounded-3xl text-white shadow-lg text-center flex flex-col items-center gap-2 ${
            winner === 'player' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-slate-600 to-slate-700'
          }`}>
            <span className="text-3xl">{winner === 'player' ? '🏆 你赢了！' : '🤖 电脑获胜！'}</span>
            <div className="text-xs font-semibold opacity-90">
              {winner === 'player' ? '成功抢到目标 30！数论小天才！' : '掌握了数论余数控制权的电脑率先抢到了 30！'}
            </div>
            <button
              onClick={resetGame}
              className="mt-2 bg-white text-slate-800 text-xs font-black px-5 py-2 rounded-xl shadow-xs active:scale-95"
            >
              再来一局
            </button>
          </div>
        )}

        {/* 报数记录 */}
        {history.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400">对局记录</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                    h.who === '玩家' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {h.who}+{h.count}→{h.end}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
