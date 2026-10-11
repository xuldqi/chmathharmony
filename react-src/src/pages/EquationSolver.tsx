import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type EquationType = 'linear' | 'quadratic';

export default function EquationSolver() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [eqType, setEqType] = useState<EquationType>('quadratic');

  // 一元一次: ax + b = c
  const [linearA, setLinearA] = useState<string>('3');
  const [linearB, setLinearB] = useState<string>('6');
  const [linearC, setLinearC] = useState<string>('18');

  // 一元二次: ax^2 + bx + c = 0
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('-5');
  const [quadC, setQuadC] = useState<string>('6');

  // 计算一元一次
  const linearResult = useMemo(() => {
    const a = parseFloat(linearA) || 0;
    const b = parseFloat(linearB) || 0;
    const c = parseFloat(linearC) || 0;

    if (a === 0) {
      if (b === c) {
        return {
          title: '恒等式，无穷多解',
          summary: 'x 可取任意实数',
          steps: `移项得：0 · x = ${c - b}\n任何 x 代入均成立，故方程有无穷多个解。`,
        };
      } else {
        return {
          title: '矛盾方程，无解',
          summary: '无解',
          steps: `移项得：0 · x = ${c - b}\n等式两边不相等，故方程无解。`,
        };
      }
    }

    const x = (c - b) / a;
    const xFormatted = Number.isInteger(x) ? `${x}` : x.toFixed(4);
    return {
      title: '唯一解',
      summary: `x = ${xFormatted}`,
      steps: `1. 移项将常数项移至等号右侧：\n   ${a}x = ${c} - (${b}) = ${c - b}\n2. 两边同除以未知数系数 a (${a})：\n   x = ${c - b} / ${a} = ${xFormatted}`,
    };
  }, [linearA, linearB, linearC]);

  // 计算一元二次
  const quadraticResult = useMemo(() => {
    const a = parseFloat(quadA) || 0;
    const b = parseFloat(quadB) || 0;
    const c = parseFloat(quadC) || 0;

    if (a === 0) {
      return {
        title: '降次为一元一次方程',
        delta: null,
        roots: b !== 0 ? [`x = ${(-c / b).toFixed(4)}`] : ['无实数解'],
        steps: `二次项系数 a = 0，退化为一次方程：${b}x + ${c} = 0`,
      };
    }

    const delta = b * b - 4 * a * c;
    const deltaFormatted = delta.toFixed(2);
    const axis = -b / (2 * a);
    const vertexY = (4 * a * c - b * b) / (4 * a);

    if (delta > 0) {
      const sqrtDelta = Math.sqrt(delta);
      const x1 = (-b + sqrtDelta) / (2 * a);
      const x2 = (-b - sqrtDelta) / (2 * a);
      const r1 = Number.isInteger(x1) ? `${x1}` : x1.toFixed(4);
      const r2 = Number.isInteger(x2) ? `${x2}` : x2.toFixed(4);
      return {
        title: '两个不相等的实数根',
        delta,
        roots: [`x₁ = ${r1}`, `x₂ = ${r2}`],
        steps: `1. 计算判别式 Δ = b² - 4ac：\n   Δ = (${b})² - 4 × ${a} × ${c} = ${deltaFormatted} > 0\n2. 代入求根公式 x = (-b ± √Δ) / 2a：\n   x₁ = (${-b} + √${deltaFormatted}) / ${2 * a} = ${r1}\n   x₂ = (${-b} - √${deltaFormatted}) / ${2 * a} = ${r2}\n3. 抛物线对称轴：x = ${axis.toFixed(2)}，顶点极值点坐标：(${axis.toFixed(2)}, ${vertexY.toFixed(2)})`,
      };
    } else if (Math.abs(delta) < 1e-7) {
      const x = -b / (2 * a);
      const r = Number.isInteger(x) ? `${x}` : x.toFixed(4);
      return {
        title: '两个相等的实数根 (重根)',
        delta: 0,
        roots: [`x₁ = x₂ = ${r}`],
        steps: `1. 计算判别式 Δ = b² - 4ac：\n   Δ = (${b})² - 4 × ${a} × ${c} = 0\n2. 代入求根公式 x = -b / (2a)：\n   x = ${-b} / ${2 * a} = ${r}\n3. 抛物线顶点与 x 轴相切于点 (${r}, 0)`,
      };
    } else {
      const realPart = (-b / (2 * a)).toFixed(4);
      const imagPart = (Math.sqrt(-delta) / (2 * a)).toFixed(4);
      return {
        title: '无实数根 (有一对共轭复数根)',
        delta,
        roots: [
          `x₁ = ${realPart} + ${Math.abs(Number(imagPart))}i`,
          `x₂ = ${realPart} - ${Math.abs(Number(imagPart))}i`,
        ],
        steps: `1. 计算判别式 Δ = b² - 4ac：\n   Δ = (${b})² - 4 × ${a} × ${c} = ${deltaFormatted} < 0\n2. 在实数范围内无解。在复数范围内有一对共轭复根：\n   x = (-b ± i√|Δ|) / 2a\n   x₁ = ${realPart} + ${Math.abs(Number(imagPart))}i\n   x₂ = ${realPart} - ${Math.abs(Number(imagPart))}i`,
      };
    }
  }, [quadA, quadB, quadC]);

  const handleSpeak = () => {
    if (eqType === 'linear') {
      speakText(`一元一次方程求解结果：${linearResult.summary}`);
    } else {
      speakText(`一元二次方程求解结果：${quadraticResult.title}，根为${quadraticResult.roots.join('，')}`);
    }
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
          <h1 className="text-lg font-black text-slate-800">一元方程求解器</h1>
          <span className="text-xs font-semibold text-indigo-600">一次/二次方程步骤解析</span>
        </div>
        <button
          onClick={handleSpeak}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          语音播报
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 类型切换 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setEqType('quadratic')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                eqType === 'quadratic'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              一元二次 (ax² + bx + c = 0)
            </button>
            <button
              onClick={() => setEqType('linear')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                eqType === 'linear'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              一元一次 (ax + b = c)
            </button>
          </div>

          {/* 参数输入 */}
          {eqType === 'quadratic' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">二次项系数 a</label>
                <input
                  type="number"
                  value={quadA}
                  onChange={(e) => setQuadA(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">一次项系数 b</label>
                <input
                  type="number"
                  value={quadB}
                  onChange={(e) => setQuadB(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">常数项 c</label>
                <input
                  type="number"
                  value={quadC}
                  onChange={(e) => setQuadC(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">系数 a</label>
                <input
                  type="number"
                  value={linearA}
                  onChange={(e) => setLinearA(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">左常数 b</label>
                <input
                  type="number"
                  value={linearB}
                  onChange={(e) => setLinearB(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">右常数 c</label>
                <input
                  type="number"
                  value={linearC}
                  onChange={(e) => setLinearC(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* 求解结果看板 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">方程求根结论</span>
          {eqType === 'quadratic' ? (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                {quadraticResult.title}
                {quadraticResult.delta !== null && ` (判别式 Δ = ${quadraticResult.delta.toFixed(2)})`}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {quadraticResult.roots.map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center text-lg font-black text-slate-800"
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                {linearResult.title}
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-2xl font-black text-slate-800">
                {linearResult.summary}
              </div>
            </div>
          )}
        </div>

        {/* 逐步推导过程 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">📘 详细求解过程：</span>
          <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {eqType === 'quadratic' ? quadraticResult.steps : linearResult.steps}
          </pre>
        </div>
      </main>
    </div>
  );
}
