import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function PercentageCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 场景 1: A 的 B% 是多少
  const [s1A, setS1A] = useState<string>('200');
  const [s1B, setS1B] = useState<string>('15');

  // 场景 2: A 是 B 的百分之几
  const [s2A, setS2A] = useState<string>('45');
  const [s2B, setS2B] = useState<string>('180');

  // 场景 3: 从 A 到 B 的增减幅度
  const [s3A, setS3A] = useState<string>('100');
  const [s3B, setS3B] = useState<string>('130');

  // 计算结果
  const res1 = (() => {
    const a = parseFloat(s1A);
    const b = parseFloat(s1B);
    if (isNaN(a) || isNaN(b)) return null;
    return (a * (b / 100)).toFixed(2).replace(/\.?0+$/, '');
  })();

  const res2 = (() => {
    const a = parseFloat(s2A);
    const b = parseFloat(s2B);
    if (isNaN(a) || isNaN(b) || b === 0) return null;
    return ((a / b) * 100).toFixed(2).replace(/\.?0+$/, '');
  })();

  const res3 = (() => {
    const a = parseFloat(s3A);
    const b = parseFloat(s3B);
    if (isNaN(a) || isNaN(b) || a === 0) return null;
    const diff = b - a;
    const rate = (diff / a) * 100;
    return {
      rate: Math.abs(rate).toFixed(2).replace(/\.?0+$/, ''),
      isIncrease: diff >= 0,
    };
  })();

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="百分比计算" onBack={() => navigate(-1)} />

        {/* 场景 1 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-blue-600">�数量百分比</span>
            {res1 !== null && (
              <button
                onClick={() => speakText(`${s1A}的百分之${s1B}是${res1}`)}
                className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> 播报
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input
              type="number"
              value={s1A}
              onChange={(e) => setS1A(e.target.value)}
              className="w-20 px-2 py-1.5 text-center bg-blue-50 border border-blue-200 rounded-xl font-black text-slate-800 outline-none focus:border-blue-500"
            />
            <span>的</span>
            <input
              type="number"
              value={s1B}
              onChange={(e) => setS1B(e.target.value)}
              className="w-16 px-2 py-1.5 text-center bg-blue-50 border border-blue-200 rounded-xl font-black text-slate-800 outline-none focus:border-blue-500"
            />
            <span>% 是：</span>
            <span className="flex-1 text-right text-lg font-black text-blue-600 truncate">
              {res1 ?? '--'}
            </span>
          </div>
        </div>

        {/* 场景 2 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-emerald-600">�占比计算</span>
            {res2 !== null && (
              <button
                onClick={() => speakText(`${s2A}占${s2B}的百分之${res2}`)}
                className="text-xs text-emerald-500 font-bold flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> 播报
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input
              type="number"
              value={s2A}
              onChange={(e) => setS2A(e.target.value)}
              className="w-20 px-2 py-1.5 text-center bg-emerald-50 border border-emerald-200 rounded-xl font-black text-slate-800 outline-none focus:border-emerald-500"
            />
            <span>占</span>
            <input
              type="number"
              value={s2B}
              onChange={(e) => setS2B(e.target.value)}
              className="w-20 px-2 py-1.5 text-center bg-emerald-50 border border-emerald-200 rounded-xl font-black text-slate-800 outline-none focus:border-emerald-500"
            />
            <span>的：</span>
            <span className="flex-1 text-right text-lg font-black text-emerald-600 truncate">
              {res2 !== null ? `${res2}%` : '--'}
            </span>
          </div>
        </div>

        {/* 场景 3 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-purple-600">�涨跌增减率</span>
            {res3 !== null && (
              <button
                onClick={() =>
                  speakText(
                    `从${s3A}变到${s3B}，${res3.isIncrease ? '增加了' : '减少了'}百分之${res3.rate}`
                  )
                }
                className="text-xs text-purple-500 font-bold flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> 播报
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span>从</span>
            <input
              type="number"
              value={s3A}
              onChange={(e) => setS3A(e.target.value)}
              className="w-18 px-2 py-1.5 text-center bg-purple-50 border border-purple-200 rounded-xl font-black text-slate-800 outline-none focus:border-purple-500"
            />
            <span>变为</span>
            <input
              type="number"
              value={s3B}
              onChange={(e) => setS3B(e.target.value)}
              className="w-18 px-2 py-1.5 text-center bg-purple-50 border border-purple-200 rounded-xl font-black text-slate-800 outline-none focus:border-purple-500"
            />
          </div>
          {res3 !== null && (
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-sm font-black">
              <span className="text-slate-500">变化情况：</span>
              <span className={res3.isIncrease ? 'text-red-500' : 'text-emerald-500'}>
                {res3.isIncrease ? `+ 上涨 ${res3.rate}%` : `- 下降 ${res3.rate}%`}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
