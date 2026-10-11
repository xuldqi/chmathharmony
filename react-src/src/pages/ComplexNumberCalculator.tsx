import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

function formatComplex(r: number, i: number): string {
  const rFmt = Number.isInteger(r) ? `${r}` : r.toFixed(2);
  const iFmt = Number.isInteger(i) ? `${i}` : i.toFixed(2);

  if (Math.abs(i) < 1e-9) return rFmt;
  if (Math.abs(r) < 1e-9) return `${iFmt}i`;
  if (i > 0) return `${rFmt} + ${iFmt}i`;
  return `${rFmt} - ${Math.abs(Number(iFmt))}i`;
}

export default function ComplexNumberCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // z1 = a + bi
  const [a, setA] = useState<string>('3');
  const [b, setB] = useState<string>('4');

  // z2 = c + di
  const [c, setC] = useState<string>('1');
  const [d, setD] = useState<string>('-2');

  const calc = useMemo(() => {
    const r1 = parseFloat(a) || 0;
    const i1 = parseFloat(b) || 0;
    const r2 = parseFloat(c) || 0;
    const i2 = parseFloat(d) || 0;

    // 加法
    const addR = r1 + r2;
    const addI = i1 + i2;

    // 减法
    const subR = r1 - r2;
    const subI = i1 - i2;

    // 乘法: (r1*r2 - i1*i2) + (r1*i2 + i1*r2)i
    const mulR = r1 * r2 - i1 * i2;
    const mulI = r1 * i2 + i1 * r2;

    // 除法: denom = r2^2 + i2^2
    const denom = r2 * r2 + i2 * i2;
    const divR = denom === 0 ? null : (r1 * r2 + i1 * i2) / denom;
    const divI = denom === 0 ? null : (i1 * r2 - r1 * i2) / denom;

    // 模长与共轭
    const mod1 = Math.sqrt(r1 * r1 + i1 * i1);
    const mod2 = Math.sqrt(r2 * r2 + i2 * i2);

    const arg1 = (Math.atan2(i1, r1) * 180) / Math.PI;

    return {
      z1Str: formatComplex(r1, i1),
      z2Str: formatComplex(r2, i2),
      add: formatComplex(addR, addI),
      sub: formatComplex(subR, subI),
      mul: formatComplex(mulR, mulI),
      div: divR !== null && divI !== null ? formatComplex(divR, divI) : '无定义 (分母为0)',
      mod1: mod1.toFixed(2),
      mod2: mod2.toFixed(2),
      conj1: formatComplex(r1, -i1),
      conj2: formatComplex(r2, -i2),
      arg1: arg1.toFixed(2),
    };
  }, [a, b, c, d]);

  const handleSpeak = () => {
    speakText(`z1加z2结果为：${calc.add}，乘积为：${calc.mul}，z1模长为：${calc.mod1}`);
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
          <h1 className="text-lg font-black text-slate-800">复数与虚数运算</h1>
          <span className="text-xs font-semibold text-violet-600">z = a + bi 四则与模长</span>
        </div>
        <button
          onClick={handleSpeak}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          语音播报
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 输入两个复数 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400">设定两个复数参数 (实部 + 虚部 i)</span>

          {/* z1 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-violet-700">复数 z₁ = a + bi</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 mr-2 font-bold">实部 a</span>
                <input
                  type="number"
                  step="any"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  className="w-full bg-transparent text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 mr-2 font-bold">虚部 b</span>
                <input
                  type="number"
                  step="any"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  className="w-full bg-transparent text-right font-black text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* z2 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-indigo-700">复数 z₂ = c + di</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 mr-2 font-bold">实部 c</span>
                <input
                  type="number"
                  step="any"
                  value={c}
                  onChange={(e) => setC(e.target.value)}
                  className="w-full bg-transparent text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 mr-2 font-bold">虚部 d</span>
                <input
                  type="number"
                  step="any"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                  className="w-full bg-transparent text-right font-black text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 四则运算结果 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">四则运算结论</span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-violet-50 border border-violet-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-violet-600 block">加法 z₁ + z₂</span>
              <span className="text-lg font-black text-violet-900">{calc.add}</span>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-violet-600 block">减法 z₁ - z₂</span>
              <span className="text-lg font-black text-violet-900">{calc.sub}</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-indigo-600 block">乘法 z₁ × z₂</span>
              <span className="text-lg font-black text-indigo-900">{calc.mul}</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-indigo-600 block">除法 z₁ ÷ z₂</span>
              <span className="text-lg font-black text-indigo-900">{calc.div}</span>
            </div>
          </div>
        </div>

        {/* 模长与共轭 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-400">模长与共轭复数</span>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-bold">z₁ 模长 |z₁| 与 辐角 θ</span>
              <span className="font-black text-slate-800">{calc.mod1} (辐角 {calc.arg1}°)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-bold">z₂ 模长 |z₂|</span>
              <span className="font-black text-slate-800">{calc.mod2}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-bold">共轭复数 z̄₁ / z̄₂</span>
              <span className="font-black text-slate-800">{calc.conj1} / {calc.conj2}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
