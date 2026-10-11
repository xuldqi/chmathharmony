import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function SeveranceCalculator() {
  const navigate = useNavigate();

  const [years, setYears] = useState<string>('3'); // 完整工作年限
  const [months, setMonths] = useState<string>('4'); // 剩余月数
  const [monthlySalary, setMonthlySalary] = useState<string>('12000'); // 离职前12个月平均实发/应发工资
  const [localAvgSalary, setLocalAvgSalary] = useState<string>('10000'); // 当地社平工资（封顶用）
  const [type, setType] = useState<'N' | 'N1' | '2N'>('N1'); // 补偿标准

  const y = parseFloat(years) || 0;
  const m = parseFloat(months) || 0;
  const sal = parseFloat(monthlySalary) || 0;
  const cap = parseFloat(localAvgSalary) || 0;

  // 法定工龄折算规则：
  // 六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿
  let nRatio = y;
  if (m >= 6) {
    nRatio += 1;
  } else if (m > 0) {
    nRatio += 0.5;
  }

  // 社平工资 3 倍封顶规则（超过3倍按3倍算，且最高不超过12年）
  const maxCapSal = cap > 0 ? cap * 3 : Infinity;
  const effectiveSal = Math.min(sal, maxCapSal);
  const effectiveRatio = sal > maxCapSal ? Math.min(nRatio, 12) : nRatio;

  // 基础 N 补偿
  const baseN = effectiveSal * effectiveRatio;

  let totalCompensation = baseN;
  let labelText = '协商解除劳动合同补偿 (N)';

  if (type === 'N1') {
    // N+1（未提前30天书面通知的代通知金：上月实发1个月工资）
    totalCompensation = baseN + sal;
    labelText = '无提前通知解除补偿 (N+1)';
  } else if (type === '2N') {
    // 2N 违法解除劳动合同赔偿金
    totalCompensation = baseN * 2;
    labelText = '违法解除双倍赔偿金 (2N)';
  }

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="离职经济补偿金测算" onBack={() => navigate(-1)} />

        {/* 补偿金类型三档 */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
          <button
            type="button"
            onClick={() => setType('N1')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              type === 'N1' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            N+1 补偿 (常见)
          </button>
          <button
            type="button"
            onClick={() => setType('N')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              type === 'N' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            N 协商离职
          </button>
          <button
            type="button"
            onClick={() => setType('2N')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              type === '2N' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            2N 违法辞退
          </button>
        </div>

        {/* 参数表单 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">本公司工龄 (年)</label>
              <input
                type="number"
                min="0"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">剩余不足年 (月)</label>
              <input
                type="number"
                min="0"
                max="11"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">离职前12个月平均工资 (元)</label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500">当地社平月均工资 (元)</label>
              <span className="text-[10px] text-slate-400">用于法定3倍封顶计算</span>
            </div>
            <input
              type="number"
              value={localAvgSalary}
              onChange={(e) => setLocalAvgSalary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 测算结果 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">{labelText}</span>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500">预估应得补偿总额</span>
            <span className="text-3xl font-black text-indigo-600 mt-1">
              ¥{totalCompensation.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              折算补偿系数：{nRatio} 个月工资 {type === 'N1' ? '+ 1个月代通金' : type === '2N' ? '× 2倍' : ''}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
            <span className="font-bold text-indigo-700 block mb-1">法规贴士：</span>
            根据《劳动合同法》第47条，六个月以上不满一年的按一年折算（{nRatio >= 1 ? `${Math.floor(nRatio)}年` : ''}），不满六个月的按半个月折算。
          </div>
        </div>
      </main>
    </div>
  );
}
