import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, TrendingUp, HelpCircle, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function CompoundInterestCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 初始本金 (元)
  const [initialPrincipal, setInitialPrincipal] = useState<string>('50000');
  // 每月定期定投金额 (元)
  const [monthlyDeposit, setMonthlyDeposit] = useState<string>('2000');
  // 年化收益率 (%)
  const [annualRate, setAnnualRate] = useState<string>('5.0');
  // 投资期限 (年)
  const [years, setYears] = useState<number>(10);
  // 是否展开年度资产表
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // 计算逻辑
  const result = useMemo(() => {
    const p = parseFloat(initialPrincipal) || 0;
    const mDeposit = parseFloat(monthlyDeposit) || 0;
    const rate = (parseFloat(annualRate) || 0) / 100;
    const totalYears = years;

    if (totalYears <= 0 || (p <= 0 && mDeposit <= 0)) return null;

    const monthlyRate = rate / 12;
    let balance = p;
    let totalInvested = p;

    const yearlyData = [];

    for (let y = 1; y <= totalYears; y++) {
      for (let m = 1; m <= 12; m++) {
        balance = balance * (1 + monthlyRate) + mDeposit;
        totalInvested += mDeposit;
      }
      yearlyData.push({
        year: y,
        invested: totalInvested,
        balance: balance,
        interest: balance - totalInvested,
      });
    }

    const totalInterest = balance - totalInvested;
    const profitRatio = totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0;

    return {
      totalInvested,
      finalBalance: balance,
      totalInterest,
      profitRatio,
      yearlyData,
    };
  }, [initialPrincipal, monthlyDeposit, annualRate, years]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `投资期限${years}年，累计本金投入约${(result.totalInvested / 10000).toFixed(1)}万元。复利总资产达${(result.finalBalance / 10000).toFixed(2)}万元，为您创造利息收益约${(result.totalInterest / 10000).toFixed(2)}万元。`;
    speakText(text);
  };

  const handleReset = () => {
    setInitialPrincipal('50000');
    setMonthlyDeposit('2000');
    setAnnualRate('5.0');
    setYears(10);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="复利与定投计算器" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 输入面板卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 初始本金 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>初始起存本金</span>
              <span className="text-amber-600 font-extrabold text-sm">¥{initialPrincipal || '0'}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(e.target.value)}
                placeholder="一次性存入本金"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元
              </span>
            </div>
          </div>

          {/* 每月定投金额 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>每月定期追加 (定投金额)</span>
              <span className="text-amber-600 font-extrabold">¥{monthlyDeposit || '0'}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(e.target.value)}
                placeholder="0 为不定投"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元/月
              </span>
            </div>
          </div>

          {/* 年化收益率与投资年限 */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">预期年化收益率</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">投资复利期限</div>
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                {[1, 3, 5, 8, 10, 15, 20, 25, 30].map((y) => (
                  <option key={y} value={y}>
                    {y} 年 ({y * 12} 个月)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 结果展示卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg shadow-amber-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                复利终值 (资产总规模)
              </span>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title="语音朗读结果"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">
                ¥{result.finalBalance.toFixed(2)}
              </span>
            </div>

            <div className="text-xs text-white/95 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              利息回报率: +{result.profitRatio.toFixed(1)}% (资产翻 {(result.finalBalance / (result.totalInvested || 1)).toFixed(2)} 倍)
            </div>

            {/* 本金与收益两格 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">累计投入本金</div>
                <div className="text-sm font-black">
                  {(result.totalInvested / 10000).toFixed(2)} 万
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">创造纯利息收益</div>
                <div className="text-sm font-black text-yellow-200">
                  +{(result.totalInterest / 10000).toFixed(2)} 万
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 资产增长计划表展开折叠 */}
        {result && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1"
            >
              <span>查看年度资产增长明细</span>
              {showSchedule ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showSchedule && (
              <div className="pt-2 border-t border-slate-100 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                <div className="grid grid-cols-4 text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">
                  <span>年份</span>
                  <span className="text-right">累计本金</span>
                  <span className="text-right">资产总值</span>
                  <span className="text-right">累计利息</span>
                </div>
                {result.yearlyData.map((item) => (
                  <div
                    key={item.year}
                    className="grid grid-cols-4 text-[11px] font-medium text-slate-600 py-1 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-slate-400">第 {item.year} 年</span>
                    <span className="text-right font-medium text-slate-600">
                      {(item.invested / 10000).toFixed(1)}万
                    </span>
                    <span className="text-right font-bold text-amber-600">
                      {(item.balance / 10000).toFixed(1)}万
                    </span>
                    <span className="text-right text-emerald-600">
                      +{(item.interest / 10000).toFixed(1)}万
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>复利是世界第八大奇迹，长期投资收益显著</span>
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
    </div>
  );
}
