import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function SalaryHourlyCalculator() {
  const navigate = useNavigate();

  const [monthlySalary, setMonthlySalary] = useState<string>('10000'); // 月薪
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState<string>('21.75'); // 法定计薪天数，默认国家标准21.75天
  const [dailyHours, setDailyHours] = useState<string>('8'); // 每天工作小时数

  const sal = parseFloat(monthlySalary) || 0;
  const days = parseFloat(workDaysPerMonth) || 21.75;
  const hours = parseFloat(dailyHours) || 8;

  // 标准日薪 = 月薪 ÷ 月计薪天数
  const dailyWage = days > 0 ? sal / days : 0;
  // 标准时薪 = 日薪 ÷ 每日工作小时
  const hourlyWage = hours > 0 ? dailyWage / hours : 0;

  // 法定平时加班 (150%)、周末加班 (200%)、法定节假日 (300%)
  const weekdayOtHourly = hourlyWage * 1.5;
  const weekendOtHourly = hourlyWage * 2.0;
  const holidayOtHourly = hourlyWage * 3.0;

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="薪资与工时折算器" onBack={() => navigate(-1)} />

        {/* 输入卡片 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">基本税前月薪 (元)</label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500">月计薪天数</label>
                <button
                  type="button"
                  onClick={() => setWorkDaysPerMonth('21.75')}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  国家法定
                </button>
              </div>
              <input
                type="number"
                step="0.05"
                value={workDaysPerMonth}
                onChange={(e) => setWorkDaysPerMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">每日工时 (小时)</label>
              <input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 折算基础收益 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">基础薪资单价</span>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500">法定标准日薪</span>
              <span className="text-xl font-black text-indigo-700 mt-1">
                ¥{dailyWage.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">每工作日</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500">法定标准时薪</span>
              <span className="text-xl font-black text-indigo-700 mt-1">
                ¥{hourlyWage.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">每小时</span>
            </div>
          </div>

          {/* 加班单价折算 */}
          <span className="text-xs font-black text-slate-700 mt-1">法定加班费基准单价</span>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-600">工作日加班 (1.5倍)</span>
              <span className="font-black text-slate-800">¥{weekdayOtHourly.toFixed(2)} / 小时</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-600">周末休息日加班 (2.0倍)</span>
              <span className="font-black text-slate-800">¥{weekendOtHourly.toFixed(2)} / 小时</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-600">法定节假日加班 (3.0倍)</span>
              <span className="font-black text-emerald-700">¥{holidayOtHourly.toFixed(2)} / 小时</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
