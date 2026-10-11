import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function AnnualLeaveCalculator() {
  const navigate = useNavigate();

  const [totalWorkYears, setTotalWorkYears] = useState<string>('5'); // 累计工龄（所有公司总和）
  const [currentCompanyMonths, setCurrentCompanyMonths] = useState<string>('8'); // 新公司入职月数（当年）
  const [monthlySalary, setMonthlySalary] = useState<string>('10000'); // 月薪，用于折算未休年假工资

  const totalY = parseFloat(totalWorkYears) || 0;
  const companyM = parseFloat(currentCompanyMonths) || 12;
  const sal = parseFloat(monthlySalary) || 0;

  // 法定年休假天数标准：
  // 职工累计工作已满1年不满10年的，年休假5天；
  // 已满10年不满20年的，年休假10天；
  // 已满20年的，年休假15天。
  let fullYearDays = 0;
  if (totalY >= 20) {
    fullYearDays = 15;
  } else if (totalY >= 10) {
    fullYearDays = 10;
  } else if (totalY >= 1) {
    fullYearDays = 5;
  }

  // 新进用人单位当年年休假折算天数：
  // (当年度在本单位剩余日历天数 / 365天) * 职工本人全年应当享受的年休假天数（折算后不足1整天的部分不享受）
  const currentYearEntitledDays = companyM >= 12
    ? fullYearDays
    : Math.floor((companyM / 12) * fullYearDays);

  // 未休年假法定工资报酬：用人单位应当按照该职工日工资收入的300%支付年休假工资报酬
  // 其中包含用人单位支付职工正常工作期间的工资收入（即额外补发200%）
  const dailyWage = sal / 21.75;
  const leaveCompensation = dailyWage * 2 * currentYearEntitledDays;

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="法定年休假测算器" onBack={() => navigate(-1)} />

        {/* 表单卡片 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500">累计总工作年限 (年)</label>
              <span className="text-[10px] text-slate-400">所有参加工作年限总和</span>
            </div>
            <input
              type="number"
              value={totalWorkYears}
              onChange={(e) => setTotalWorkYears(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500">今年在本单位在职月数</label>
              <span className="text-[10px] text-slate-400">跨年入职直接填 12</span>
            </div>
            <input
              type="number"
              min="1"
              max="12"
              value={currentCompanyMonths}
              onChange={(e) => setCurrentCompanyMonths(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">基本月薪 (元，算未休补偿用)</label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 测算结果 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">年假权益评估</span>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500">本年度应享法定年假</span>
            <span className="text-3xl font-black text-indigo-700 mt-1">
              {currentYearEntitledDays} 天
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              全年基准档位：{fullYearDays} 天 / 年
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">未休年假折算补偿金额 (按200%补贴)</span>
            <span className="text-sm font-black text-indigo-700">
              ¥{leaveCompensation.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
            <span className="font-bold text-indigo-700 block mb-1">法规依据：</span>
            根据《职工带薪年休假条例》，年休假天数以【累计总工龄】为准，跳槽新公司工龄不归零清空，新进公司按入职剩余月份折算，不满1整天不计入。
          </div>
        </div>
      </main>
    </div>
  );
}
