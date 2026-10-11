import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Calendar, ArrowRight } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function DateCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 当前默认日期
  const todayStr = new Date().toISOString().split('T')[0];

  // 模式 1: 计算两个日期间隔
  const [d1, setD1] = useState<string>(todayStr);
  const [d2, setD2] = useState<string>(todayStr);

  // 模式 2: 日期推算 (某天 + N天)
  const [baseDate, setBaseDate] = useState<string>(todayStr);
  const [offsetDays, setOffsetDays] = useState<string>('30');
  const [direction, setDirection] = useState<'after' | 'before'>('after');

  // 计算日期间隔
  const intervalResult = (() => {
    if (!d1 || !d2) return null;
    const t1 = new Date(d1).getTime();
    const t2 = new Date(d2).getTime();
    if (isNaN(t1) || isNaN(t2)) return null;

    const diffMs = Math.abs(t2 - t1);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;

    return {
      diffDays,
      weeks,
      remDays,
    };
  })();

  // 推算结果
  const offsetResult = (() => {
    if (!baseDate) return null;
    const base = new Date(baseDate);
    const n = parseInt(offsetDays, 10);
    if (isNaN(base.getTime()) || isNaN(n)) return null;

    const targetDate = new Date(base);
    targetDate.setDate(targetDate.getDate() + (direction === 'after' ? n : -n));

    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][targetDate.getDay()];

    return `${y}年${m}月${d}日 (${dayOfWeek})`;
  })();

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="日期计算器" onBack={() => navigate(-1)} />

        {/* 模式 1: 两日期间隔 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-purple-600">计算两日期间隔天数</span>
            {intervalResult && (
              <button
                onClick={() => speakText(`两日期间隔${intervalResult.diffDays}天`)}
                className="text-xs text-purple-500 font-bold flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> 播报
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-slate-500">起始日期</span>
              <input
                type="date"
                value={d1}
                onChange={(e) => setD1(e.target.value)}
                className="bg-transparent font-black text-slate-800 text-sm outline-none"
              />
            </div>
            <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-slate-500">结束日期</span>
              <input
                type="date"
                value={d2}
                onChange={(e) => setD2(e.target.value)}
                className="bg-transparent font-black text-slate-800 text-sm outline-none"
              />
            </div>
          </div>

          {intervalResult && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">相差天数：</span>
              <div className="text-right">
                <span className="text-2xl font-black text-purple-700">
                  {intervalResult.diffDays}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1">天</span>
                {intervalResult.weeks > 0 && (
                  <span className="block text-xs font-bold text-purple-500">
                    约 {intervalResult.weeks} 周 {intervalResult.remDays} 天
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 模式 2: 日期推算 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-emerald-600">⏳ 日期前后推算</span>
            {offsetResult && (
              <button
                onClick={() => speakText(`推算结果是：${offsetResult}`)}
                className="text-xs text-emerald-500 font-bold flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> 播报
              </button>
            )}
          </div>

          <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
            <span className="text-xs font-bold text-slate-500">基准日期</span>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="bg-transparent font-black text-slate-800 text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'after' | 'before')}
              className="px-2 py-2 bg-slate-100 font-black text-xs rounded-xl outline-none"
            >
              <option value="after">往后推进</option>
              <option value="before">往前倒推</option>
            </select>
            <input
              type="number"
              value={offsetDays}
              onChange={(e) => setOffsetDays(e.target.value)}
              className="flex-1 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-sm text-center outline-none focus:border-emerald-500"
            />
            <span className="text-xs font-bold text-slate-600">天</span>
          </div>

          {offsetResult && (
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">目标日期：</span>
              <span className="text-base font-black text-emerald-700">
                {offsetResult}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
