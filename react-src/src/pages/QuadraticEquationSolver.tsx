import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function QuadraticEquationSolver() {
  const navigate = useNavigate();

  const [aStr, setAStr] = useState<string>('1');
  const [bStr, setBStr] = useState<string>('-5');
  const [cStr, setCStr] = useState<string>('6');

  const a = parseFloat(aStr);
  const b = parseFloat(bStr);
  const c = parseFloat(cStr);

  const isValidA = !isNaN(a) && a !== 0;
  const isInputsValid = isValidA && !isNaN(b) && !isNaN(c);

  // 判别式 Δ = b² - 4ac
  const delta = isInputsValid ? b * b - 4 * a * c : 0;

  // 方程字符串形式 ax² + bx + c = 0
  const formatEquation = () => {
    if (!isInputsValid) return 'ax² + bx + c = 0';
    let res = '';
    if (a === 1) res += 'x²';
    else if (a === -1) res += '-x²';
    else res += `${a}x²`;

    if (b > 0) res += ` + ${b === 1 ? '' : b}x`;
    else if (b < 0) res += ` - ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;

    if (c > 0) res += ` + ${c}`;
    else if (c < 0) res += ` - ${Math.abs(c)}`;

    return `${res} = 0`;
  };

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="一元二次方程求解" onBack={() => navigate(-1)} />

        {/* 系数输入区域 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div className="text-center py-2 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <span className="text-xs font-bold text-slate-400 block mb-0.5">标准形式</span>
            <span className="text-lg font-black text-indigo-700 tracking-wide font-mono">
              {formatEquation()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">二次项系数 a</label>
              <input
                type="number"
                step="any"
                value={aStr}
                onChange={(e) => setAStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500 text-center"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">一次项系数 b</label>
              <input
                type="number"
                step="any"
                value={bStr}
                onChange={(e) => setBStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500 text-center"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">常数项 c</label>
              <input
                type="number"
                step="any"
                value={cStr}
                onChange={(e) => setCStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500 text-center"
              />
            </div>
          </div>

          {!isValidA && (
            <p className="text-xs font-bold text-rose-500 text-center">
              二次项系数 a 不能为 0（若 a=0 则退化为一元一次方程）
            </p>
          )}
        </div>

        {/* 根与判别式推导结果 */}
        {isInputsValid && (
          <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
            <span className="text-sm font-black text-slate-700">求根分析与判别式</span>

            {/* 判别式卡片 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-bold block">判别式 Δ = b² - 4ac</span>
                <span className="text-base font-black text-slate-800 font-mono mt-0.5">
                  Δ = {delta.toFixed(4).replace(/\.?0+$/, '')}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                delta > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : delta === 0
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                {delta > 0 ? '有两个不相等实根' : delta === 0 ? '有两个相等实根' : '无实数根 (有共轭复根)'}
              </span>
            </div>

            {/* 方程的解 */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col gap-2 font-mono">
              <span className="text-xs font-bold text-slate-500 font-sans">方程的根：</span>
              {delta > 0 ? (
                <div className="flex flex-col gap-1 text-sm font-black text-indigo-800">
                  <span>x₁ = {((-b + Math.sqrt(delta)) / (2 * a)).toFixed(4).replace(/\.?0+$/, '')}</span>
                  <span>x₂ = {((-b - Math.sqrt(delta)) / (2 * a)).toFixed(4).replace(/\.?0+$/, '')}</span>
                </div>
              ) : delta === 0 ? (
                <div className="text-sm font-black text-indigo-800">
                  <span>x₁ = x₂ = {(-b / (2 * a)).toFixed(4).replace(/\.?0+$/, '')}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1 text-sm font-black text-indigo-800">
                  <span>
                    x₁ = {(-b / (2 * a)).toFixed(4).replace(/\.?0+$/, '')} + {(Math.sqrt(-delta) / (2 * Math.abs(a))).toFixed(4).replace(/\.?0+$/, '')}i
                  </span>
                  <span>
                    x₂ = {(-b / (2 * a)).toFixed(4).replace(/\.?0+$/, '')} - {(Math.sqrt(-delta) / (2 * Math.abs(a))).toFixed(4).replace(/\.?0+$/, '')}i
                  </span>
                </div>
              )}
            </div>

            {/* 求根公式步骤详解 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-indigo-700 block mb-1">推导公式：</span>
              <span>求根公式为：x = (-b ± √(b² - 4ac)) / (2a)</span>
              <br />
              <span>
                代入得：x = (-({b}) ± √({delta})) / (2 × {a})
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
