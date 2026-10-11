import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type SeqType = 'ap' | 'gp'; // 等差数列 vs 等比数列

export default function SequenceCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [type, setType] = useState<SeqType>('ap');

  // 等差数列参数
  const [apA1, setApA1] = useState<string>('2');
  const [apD, setApD] = useState<string>('3');
  const [apN, setApN] = useState<string>('10');

  // 等比数列参数
  const [gpA1, setGpA1] = useState<string>('2');
  const [gpQ, setGpQ] = useState<string>('2');
  const [gpN, setGpN] = useState<string>('8');

  // 计算等差数列
  const apResult = useMemo(() => {
    const a1 = parseFloat(apA1) || 0;
    const d = parseFloat(apD) || 0;
    const n = Math.max(1, parseInt(apN, 10) || 1);

    const an = a1 + (n - 1) * d;
    const sn = (n * (a1 + an)) / 2;

    const items: number[] = [];
    const maxItems = Math.min(n, 12);
    for (let i = 1; i <= maxItems; i++) {
      items.push(a1 + (i - 1) * d);
    }

    return {
      a1,
      d,
      n,
      an: Number.isInteger(an) ? `${an}` : an.toFixed(4),
      sn: Number.isInteger(sn) ? `${sn}` : sn.toFixed(4),
      items,
      steps: `通项公式：aₙ = a₁ + (n - 1)d\na_${n} = ${a1} + (${n} - 1) × ${d} = ${an}\n前n项和公式：Sₙ = n(a₁ + aₙ) / 2\nS_${n} = ${n} × (${a1} + ${an}) / 2 = ${sn}`,
    };
  }, [apA1, apD, apN]);

  // 计算等比数列
  const gpResult = useMemo(() => {
    const a1 = parseFloat(gpA1) || 0;
    const q = parseFloat(gpQ) || 0;
    const n = Math.max(1, parseInt(gpN, 10) || 1);

    const an = a1 * Math.pow(q, n - 1);
    let sn = 0;
    if (q === 1) {
      sn = n * a1;
    } else {
      sn = (a1 * (1 - Math.pow(q, n))) / (1 - q);
    }

    const items: number[] = [];
    const maxItems = Math.min(n, 10);
    for (let i = 1; i <= maxItems; i++) {
      items.push(a1 * Math.pow(q, i - 1));
    }

    return {
      a1,
      q,
      n,
      an: Number.isInteger(an) ? `${an}` : an.toFixed(4),
      sn: Number.isInteger(sn) ? `${sn}` : sn.toFixed(4),
      items,
      steps: `通项公式：aₙ = a₁ · qⁿ⁻¹\na_${n} = ${a1} × ${q}^(${n} - 1) = ${an}\n前n项和公式：${
        q === 1 ? 'Sₙ = n · a₁' : 'Sₙ = a₁(1 - qⁿ) / (1 - q)'
      }\nS_${n} = ${sn}`,
    };
  }, [gpA1, gpQ, gpN]);

  const handleSpeak = () => {
    if (type === 'ap') {
      speakText(`等差数列第${apResult.n}项为${apResult.an}，前${apResult.n}项和为${apResult.sn}`);
    } else {
      speakText(`等比数列第${gpResult.n}项为${gpResult.an}，前${gpResult.n}项和为${gpResult.sn}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="等差与等比数列"
          subtitle="通项公式 aₙ 与 求和 Sₙ"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 类型切换 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setType('ap')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                type === 'ap'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              等差数列 (AP)
            </button>
            <button
              onClick={() => setType('gp')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                type === 'gp'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              等比数列 (GP)
            </button>
          </div>

          {/* 参数输入 */}
          {type === 'ap' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">首项 (a₁)</label>
                <input
                  type="number"
                  step="any"
                  value={apA1}
                  onChange={(e) => setApA1(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">公差 (d)</label>
                <input
                  type="number"
                  step="any"
                  value={apD}
                  onChange={(e) => setApD(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">项数 (n)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={apN}
                  onChange={(e) => setApN(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">首项 (a₁)</label>
                <input
                  type="number"
                  step="any"
                  value={gpA1}
                  onChange={(e) => setGpA1(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">公比 (q)</label>
                <input
                  type="number"
                  step="any"
                  value={gpQ}
                  onChange={(e) => setGpQ(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">项数 (n)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={gpN}
                  onChange={(e) => setGpN(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* 结果指标 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">数列核心结果</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-600 mb-0.5">
                第 {type === 'ap' ? apResult.n : gpResult.n} 项 (aₙ)
              </span>
              <span className="text-2xl font-black text-emerald-800">
                {type === 'ap' ? apResult.an : gpResult.an}
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold text-indigo-600 mb-0.5">
                前 {type === 'ap' ? apResult.n : gpResult.n} 项和 (Sₙ)
              </span>
              <span className="text-2xl font-black text-indigo-800">
                {type === 'ap' ? apResult.sn : gpResult.sn}
              </span>
            </div>
          </div>

          {/* 前若干项明细展示 */}
          <div className="mt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              前 {(type === 'ap' ? apResult.items : gpResult.items).length} 项展开：
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(type === 'ap' ? apResult.items : gpResult.items).map((val, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-mono font-bold"
                >
                  a{idx + 1} = {val}
                </span>
              ))}
            </div>
          </div>

          {/* 推导公式步骤 */}
          <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">�详细计算步骤：</span>
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
              {type === 'ap' ? apResult.steps : gpResult.steps}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
