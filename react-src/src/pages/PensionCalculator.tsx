import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, ShieldCheck, HelpCircle, TrendingUp, Info } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function PensionCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 退休年龄: 60岁(男/延退), 55岁(女干), 50岁(女工), 65岁
  const [retireAge, setRetireAge] = useState<number>(60);
  // 累计缴费年限 (年，最低15年，延迟退休逐步过渡到20年)
  const [payYears, setPayYears] = useState<number>(25);
  // 本人月缴费工资/基数 (元)
  const [wageBase, setWageBase] = useState<string>('8000');
  // 当地上年度社会平均月工资 (元，如北京上海约11000~12000，二线约7000~8000)
  const [avgWage, setAvgWage] = useState<string>('8500');
  // 平均缴费指数: 0.6 (60%最低档), 1.0 (100%标准档), 1.5, 2.0, 3.0 (最高档)
  const [indexRatio, setIndexRatio] = useState<number>(1.0);

  // 核心计算逻辑
  const result = useMemo(() => {
    const base = parseFloat(wageBase) || 0;
    const avg = parseFloat(avgWage) || 0;
    if (base <= 0 || avg <= 0 || payYears <= 0) return null;

    // 1. 基础养老金 = 当地社平工资 * (1 + 本人缴费指数) / 2 * 缴费年限 * 1%
    const basePension = (avg * (1 + indexRatio)) / 2 * payYears * 0.01;

    // 2. 个人账户养老金 = 个人账户储存额 / 计发月数
    // 计发月数国家标准
    let factorMonths = 139; // 60岁默认
    if (retireAge === 50) factorMonths = 195;
    else if (retireAge === 55) factorMonths = 170;
    else if (retireAge === 65) factorMonths = 101;

    // 个人账户每月划入工资的 8%
    // 估算本息总额：简化按平均年利率 2.5% 复利累积
    const annualDeposit = base * 0.08 * 12;
    let personalTotal = 0;
    for (let i = 0; i < payYears; i++) {
      personalTotal = (personalTotal + annualDeposit) * 1.025;
    }

    const personalPension = personalTotal / factorMonths;

    // 3. 每月养老金总计
    const totalMonthlyPension = basePension + personalPension;

    // 养老金替代率
    const replacementRate = (totalMonthlyPension / base) * 100;

    return {
      basePension,
      personalPension,
      personalTotal,
      totalMonthlyPension,
      replacementRate,
      factorMonths,
    };
  }, [retireAge, payYears, wageBase, avgWage, indexRatio]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `根据测算，在您${retireAge}岁退休、工龄${payYears}年的情况下，预计退休后每月可领取基本养老金约${result.totalMonthlyPension.toFixed(0)}元，其中基础养老金${result.basePension.toFixed(0)}元，个人账户养老金${result.personalPension.toFixed(0)}元。`;
    speakText(text);
  };

  const handleReset = () => {
    setRetireAge(60);
    setPayYears(25);
    setWageBase('8000');
    setAvgWage('8500');
    setIndexRatio(1.0);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="养老金退休金测算" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 输入面板卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 退休年龄与工龄 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">预计退休年龄</div>
              <select
                value={retireAge}
                onChange={(e) => setRetireAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value={60}>60 岁 (男/延迟退休)</option>
                <option value={55}>55 岁 (女干部/女技术)</option>
                <option value={50}>50 岁 (女工人)</option>
                <option value={65}>65 岁 (高龄延退)</option>
              </select>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">社保缴费年限</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="15"
                  max="45"
                  value={payYears}
                  onChange={(e) => setPayYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-400 font-bold">年</span>
              </div>
            </div>
          </div>

          {/* 本人月缴费基数 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>本人月平均工资基数</span>
              <span className="text-indigo-600 font-extrabold">¥{wageBase}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={wageBase}
                onChange={(e) => setWageBase(e.target.value)}
                placeholder="请输入月社保缴费基数"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元/月
              </span>
            </div>
          </div>

          {/* 当地社平工资 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>当地上年度在岗职工月平均工资</span>
              <span className="text-slate-500 font-bold">¥{avgWage}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={avgWage}
                onChange={(e) => setAvgWage(e.target.value)}
                placeholder="城市职工平均月薪"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元/月
              </span>
            </div>
          </div>

          {/* 平均缴费指数档位 */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
              <span>平均缴费档次 (指数)</span>
              <span className="text-indigo-600 font-extrabold">{indexRatio * 100}% 档</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '60%最低', val: 0.6 },
                { label: '100%标准', val: 1.0 },
                { label: '200%高档', val: 2.0 },
                { label: '300%顶格', val: 3.0 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setIndexRatio(item.val)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    indexRatio === item.val
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 测算结果卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                退休后每月预估领取总额
              </span>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title="语音朗读测算结果"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">
                ¥{result.totalMonthlyPension.toFixed(2)}
              </span>
              <span className="text-xs text-indigo-200">/ 月</span>
            </div>

            <div className="text-xs text-amber-200 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              工资替代率: {result.replacementRate.toFixed(1)}% (计发 {result.factorMonths} 个月)
            </div>

            {/* 基础养老金与个人账户明细 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">基础养老金</div>
                <div className="text-sm font-black">¥{result.basePension.toFixed(1)}</div>
                <div className="text-[9px] text-indigo-200 mt-0.5">社会统筹基金计发</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">个人账户养老金</div>
                <div className="text-sm font-black text-amber-200">
                  ¥{result.personalPension.toFixed(1)}
                </div>
                <div className="text-[9px] text-indigo-200 mt-0.5">个人账户积累计发</div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与法律依据 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>依据国务院《关于完善企业职工基本养老保险制度的决定》统一标准计算</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
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
