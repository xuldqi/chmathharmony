import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Calendar, HelpCircle, Sparkles, Clock } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function CountdownCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 事件名称
  const [eventName, setEventName] = useState<string>('高考倒计时');

  // 目标日期 (默认设置为当前年份高考日 6月7日 或 往后几个月)
  const today = new Date();
  const defaultTarget = new Date(today.getFullYear(), 5, 7); // 6月7日
  if (defaultTarget < today) {
    defaultTarget.setFullYear(today.getFullYear() + 1);
  }
  const defaultDateStr = defaultTarget.toISOString().split('T')[0];

  const [targetDateStr, setTargetDateStr] = useState<string>(defaultDateStr);

  // 核心计算
  const result = useMemo(() => {
    if (!targetDateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const [y, m, d] = targetDateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const isFuture = diffDays >= 0;
    const absDays = Math.abs(diffDays);

    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;

    return {
      isFuture,
      absDays,
      weeks,
      remDays,
      targetFormatted: `${y}年${m}月${d}日`,
    };
  }, [targetDateStr]);

  const handleSpeak = () => {
    if (!result) return;
    if (result.isFuture) {
      const text = `距离${eventName}还有${result.absDays}天，约合${result.weeks}周零${result.remDays}天，加油！`;
      speakText(text);
    } else {
      const text = `${eventName}已经过去了${result.absDays}天，珍惜每一天！`;
      speakText(text);
    }
  };

  const setPreset = (name: string, date: Date) => {
    setEventName(name);
    setTargetDateStr(date.toISOString().split('T')[0]);
  };

  const handleReset = () => {
    setEventName('高考倒计时');
    setTargetDateStr(defaultDateStr);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none pb-12">
      <AppPageHeader title="倒数日与纪念日计算" onBack={() => navigate(-1)} />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {/* 输入面板卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 事件名称 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>纪念日 / 目标事件名称</span>
            </div>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例如：高考、发工资、恋爱纪念"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 目标日期选择 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>目标日期</span>
              <span className="text-amber-600 font-extrabold text-xs">
                {result ? result.targetFormatted : ''}
              </span>
            </div>
            <input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 热门快捷预设 */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>常用热门预设</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  const nextNewYear = new Date(now.getFullYear() + 1, 0, 1);
                  setPreset('元旦新年跨年', nextNewYear);
                }}
                className="py-1.5 bg-slate-50 hover:bg-amber-50 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-700 border border-slate-100 transition-all"
              >
                🎉 元旦跨年
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  let gaokao = new Date(now.getFullYear(), 5, 7);
                  if (gaokao < now) gaokao = new Date(now.getFullYear() + 1, 5, 7);
                  setPreset('高考倒计时', gaokao);
                }}
                className="py-1.5 bg-slate-50 hover:bg-amber-50 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-700 border border-slate-100 transition-all"
              >
                ✏️ 高考倒数
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  let payDay = new Date(now.getFullYear(), now.getMonth(), 15);
                  if (payDay < now) payDay = new Date(now.getFullYear(), now.getMonth() + 1, 15);
                  setPreset('本月发工资日', payDay);
                }}
                className="py-1.5 bg-slate-50 hover:bg-amber-50 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-700 border border-slate-100 transition-all"
              >
                💰 发薪日
              </button>
            </div>
          </div>
        </div>

        {/* 核心天数卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-200/50 space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {eventName || '重要日子'}
              </span>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title="语音朗读结果"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              <div className="text-xs text-amber-100 font-extrabold mb-1">
                {result.isFuture ? '还 剩' : '已 经 过 去'}
              </div>
              <div className="text-6xl font-black tracking-tight">{result.absDays}</div>
              <div className="text-xs text-amber-100 font-bold mt-1">天 (DAYS)</div>
            </div>

            {/* 周数与日期详情 */}
            <div className="bg-white/10 p-2.5 rounded-2xl text-xs font-bold text-white/95">
              约合 {result.weeks} 周零 {result.remDays} 天 ｜ 目标日：{result.targetFormatted}
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>自动计算未来倒计时与过去纪念日天数</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>
      </main>
    </div>
  );
}
