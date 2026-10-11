import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type SolveMode = 'hypotenuse' | 'leg'; // 求斜边 c vs 求直角边 a 或 b

const COMMON_TRIPLETS = [
  { a: 3, b: 4, c: 5 },
  { a: 5, b: 12, c: 13 },
  { a: 6, b: 8, c: 10 },
  { a: 7, b: 24, c: 25 },
  { a: 8, b: 15, c: 17 },
  { a: 9, b: 12, c: 15 },
  { a: 9, b: 40, c: 41 },
];

export default function PythagoreanCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [mode, setMode] = useState<SolveMode>('hypotenuse');
  const [sideA, setSideA] = useState<string>('3');
  const [sideB, setSideB] = useState<string>('4');
  const [sideC, setSideC] = useState<string>('5');

  // 计算结果
  const result = useMemo(() => {
    if (mode === 'hypotenuse') {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      if (a <= 0 || b <= 0) return null;

      const cSq = a * a + b * b;
      const c = Math.sqrt(cSq);
      const angleA = (Math.asin(a / c) * 180) / Math.PI;
      const angleB = 90 - angleA;

      return {
        target: '斜边 c',
        val: Number.isInteger(c) ? `${c}` : c.toFixed(4),
        steps: `根据勾股定理：a² + b² = c²\n${a}² + ${b}² = ${a * a} + ${b * b} = ${cSq}\nc = √(${cSq}) ≈ ${c.toFixed(4)}`,
        angleA: angleA.toFixed(2),
        angleB: angleB.toFixed(2),
        area: ((a * b) / 2).toFixed(2),
      };
    } else {
      const b = parseFloat(sideB) || 0;
      const c = parseFloat(sideC) || 0;
      if (b <= 0 || c <= 0) return null;
      if (b >= c) {
        return {
          target: '直角边 a',
          val: '错误',
          steps: '直角边长度必须小于斜边长度！',
          angleA: '0',
          angleB: '0',
          area: '0',
        };
      }

      const aSq = c * c - b * b;
      const a = Math.sqrt(aSq);
      const angleA = (Math.asin(a / c) * 180) / Math.PI;
      const angleB = 90 - angleA;

      return {
        target: '直角边 a',
        val: Number.isInteger(a) ? `${a}` : a.toFixed(4),
        steps: `根据勾股定理变形：a² = c² - b²\n${c}² - ${b}² = ${c * c} - ${b * b} = ${aSq}\na = √(${aSq}) ≈ ${a.toFixed(4)}`,
        angleA: angleA.toFixed(2),
        angleB: angleB.toFixed(2),
        area: ((a * b) / 2).toFixed(2),
      };
    }
  }, [mode, sideA, sideB, sideC]);

  const handleSpeak = () => {
    if (!result || result.val === '错误') {
      speakText('请输入有效的边长');
      return;
    }
    speakText(`计算结果：${result.target}为${result.val}，三角形面积为${result.area}`);
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
          <h1 className="text-lg font-black text-slate-800">勾股定理与三角</h1>
          <span className="text-xs font-semibold text-amber-600">a² + b² = c² 解三角形</span>
        </div>
        <button
          onClick={handleSpeak}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          语音播报
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 计算模式选择 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setMode('hypotenuse')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                mode === 'hypotenuse'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              已知两直角边求斜边 c
            </button>
            <button
              onClick={() => setMode('leg')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                mode === 'leg'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              已知斜边求直角边 a
            </button>
          </div>

          {/* 参数输入 */}
          <div className="flex flex-col gap-3">
            {mode === 'hypotenuse' ? (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">直角边 a (勾)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">直角边 b (股)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">斜边 c (弦)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sideC}
                    onChange={(e) => setSideC(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">已知直角边 b</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 求解结果看板 */}
        {result && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400">解三角形结果</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-amber-600 mb-0.5">{result.target}</span>
                <span className="text-2xl font-black text-amber-800">{result.val}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-emerald-600 mb-0.5">三角形面积 S</span>
                <span className="text-2xl font-black text-emerald-800">{result.area}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400">锐角 ∠A</span>
                <span className="text-lg font-black text-slate-800">{result.angleA}°</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400">锐角 ∠B</span>
                <span className="text-lg font-black text-slate-800">{result.angleB}°</span>
              </div>
            </div>

            {/* 计算步骤 */}
            <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">📐 推导步骤：</span>
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{result.steps}</pre>
            </div>
          </div>
        )}

        {/* 常见经典勾股数速查 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-400">常见整数勾股数 (a, b, c)</span>
          <div className="grid grid-cols-3 gap-2">
            {COMMON_TRIPLETS.map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMode('hypotenuse');
                  setSideA(`${t.a}`);
                  setSideB(`${t.b}`);
                }}
                className="bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-2 rounded-xl text-center text-xs font-bold text-slate-700 transition-all active:scale-95"
              >
                {t.a}, {t.b}, {t.c}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
