import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function IrrCalculator() {
  const navigate = useNavigate();

  const [principal, setPrincipal] = useState<string>('12000'); // 借款/分期本金
  const [periods, setPeriods] = useState<string>('12'); // 分期月数
  const [monthlyPayment, setMonthlyPayment] = useState<string>('1060'); // 每期还款额 (本金+手续费)

  const p = parseFloat(principal) || 0;
  const n = parseInt(periods, 10) || 12;
  const pmt = parseFloat(monthlyPayment) || 0;

  // 牛顿法迭代求解 IRR 月利率 r
  // f(r) = pmt * (1 - (1+r)^(-n)) / r - p = 0
  const calculateIrr = (principalAmount: number, paymentAmount: number, numPeriods: number): number => {
    if (principalAmount <= 0 || paymentAmount <= 0 || numPeriods <= 0) return 0;
    if (paymentAmount * numPeriods <= principalAmount) return 0; // 无息或负息

    let r = (paymentAmount * numPeriods - principalAmount) / (principalAmount * numPeriods); // 初始估计
    for (let i = 0; i < 50; i++) {
      const pow = Math.pow(1 + r, -numPeriods);
      const f = paymentAmount * (1 - pow) / r - principalAmount;
      const df = paymentAmount * (numPeriods * r * Math.pow(1 + r, -numPeriods - 1) - (1 - pow)) / (r * r);
      const nextR = r - f / df;
      if (Math.abs(nextR - r) < 1e-7) {
        return nextR;
      }
      r = nextR;
      if (r <= 0) r = 0.0001;
    }
    return r;
  };

  const monthlyRate = calculateIrr(p, pmt, n);
  // 真实复合年化利率 IRR = (1 + r)^12 - 1
  const effectiveAnnualRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  // 名义年化利率 APR = r * 12
  const nominalAnnualRate = monthlyRate * 12 * 100;

  // 总还款额与总手续费/利息
  const totalRepay = pmt * n;
  const totalFee = totalRepay - p;
  // 表面宣传月费率
  const surfaceRate = p > 0 ? (totalFee / n / p) * 100 : 0;

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="分期真实年化利率(IRR)" onBack={() => navigate(-1)} />

        {/* 输入卡片 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">借款/分期本金 (元)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">分期期数 (月)</label>
              <select
                value={periods}
                onChange={(e) => setPeriods(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
              >
                {[3, 6, 9, 12, 18, 24, 36].map((m) => (
                  <option key={m} value={m}>{m} 期</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">每期还款额 (元)</label>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 结果揭秘展示 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">实际利率揭秘</span>

          {/* 真实复合年化利率高光 */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500">真实复合年化利率 (IRR)</span>
            <span className="text-3xl font-black text-rose-600 mt-1">
              {effectiveAnnualRate > 0 ? `${effectiveAnnualRate.toFixed(2)}%` : '0.00%'}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              表面宣传月费率仅约：{surfaceRate.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400">名义年化利率 (APR)</span>
              <span className="text-sm font-black text-slate-800 mt-0.5">
                {nominalAnnualRate.toFixed(2)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400">总利息/手续费</span>
              <span className="text-sm font-black text-rose-600 mt-0.5">
                ¥{totalFee.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
            <span className="font-bold text-indigo-700 block mb-1">避坑说明：</span>
            分期还款由于每个月都在归还本金，手中占用的本金是在逐月递减的，但机构通常按借款全额收取手续费，因此真实年化率（IRR）通常是表面宣传费率的近两倍！
          </div>
        </div>
      </main>
    </div>
  );
}
