import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Briefcase, Clock, Calendar, HelpCircle, ShieldAlert } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

type WageInputMode = 'monthly' | 'hourly';

export default function OvertimeCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 薪资模式：monthly=月薪折算(21.75天), hourly=固定时薪
  const [wageMode, setWageMode] = useState<WageInputMode>('monthly');

  // 基本月薪与时薪
  const [baseSalary, setBaseSalary] = useState<string>('8000');
  const [customHourlyRate, setCustomHourlyRate] = useState<string>('45');

  // 加班时长（小时）
  const [weekdayHours, setWeekdayHours] = useState<string>('15'); // 平时 1.5倍
  const [weekendHours, setWeekendHours] = useState<string>('16'); // 周末 2.0倍
  const [holidayHours, setHolidayHours] = useState<string>('8');  // 节日 3.0倍

  // 夜班津贴与其它补助
  const [allowance, setAllowance] = useState<string>('200');

  // 核心计算逻辑
  const result = useMemo(() => {
    let hourlyWage = 0;
    const salary = parseFloat(baseSalary) || 0;

    if (wageMode === 'monthly') {
      // 国家法定月计薪天数: 21.75天，每天8小时 = 174小时
      hourlyWage = salary > 0 ? salary / 21.75 / 8 : 0;
    } else {
      hourlyWage = parseFloat(customHourlyRate) || 0;
    }

    const wdHours = parseFloat(weekdayHours) || 0;
    const weHours = parseFloat(weekendHours) || 0;
    const hdHours = parseFloat(holidayHours) || 0;
    const extraAllowance = parseFloat(allowance) || 0;

    // 平时 1.5 倍
    const weekdayPay = wdHours * hourlyWage * 1.5;
    // 周末 2.0 倍
    const weekendPay = weHours * hourlyWage * 2.0;
    // 法定节假日 3.0 倍
    const holidayPay = hdHours * hourlyWage * 3.0;

    // 总加班时长与总加班费
    const totalOvertimeHours = wdHours + weHours + hdHours;
    const totalOvertimePay = weekdayPay + weekendPay + holidayPay;

    // 总预估收入
    const totalIncome = (wageMode === 'monthly' ? salary : 0) + totalOvertimePay + extraAllowance;

    return {
      hourlyWage,
      dailyWage: hourlyWage * 8,
      wdHours,
      weHours,
      hdHours,
      weekdayPay,
      weekendPay,
      holidayPay,
      totalOvertimeHours,
      totalOvertimePay,
      totalIncome,
      extraAllowance,
    };
  }, [wageMode, baseSalary, customHourlyRate, weekdayHours, weekendHours, holidayHours, allowance]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `本月累计加班${result.totalOvertimeHours.toFixed(1)}小时，加班费共计${result.totalOvertimePay.toFixed(0)}元。预计当月总收入约为${result.totalIncome.toFixed(0)}元。`;
    speakText(text);
  };

  const handleReset = () => {
    setWageMode('monthly');
    setBaseSalary('8000');
    setCustomHourlyRate('45');
    setWeekdayHours('15');
    setWeekendHours('16');
    setHolidayHours('8');
    setAllowance('200');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="加班费计算器" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 顶部计薪基数模式切换 */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
          <button
            onClick={() => setWageMode('monthly')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              wageMode === 'monthly'
                ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-300/40'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            按月薪换算 (法定21.75天)
          </button>
          <button
            onClick={() => setWageMode('hourly')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              wageMode === 'hourly'
                ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-300/40'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            按固定时薪计算
          </button>
        </div>

        {/* 薪资基数卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>{wageMode === 'monthly' ? '基本工资基数' : '小时工资标准'}</span>
            <span className="text-amber-600 font-extrabold text-xs">
              法定折算时薪: ¥{result.hourlyWage.toFixed(2)}/h
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={wageMode === 'monthly' ? baseSalary : customHourlyRate}
              onChange={(e) =>
                wageMode === 'monthly'
                  ? setBaseSalary(e.target.value)
                  : setCustomHourlyRate(e.target.value)
              }
              placeholder={wageMode === 'monthly' ? '请输入基本月薪' : '请输入每小时工资'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {wageMode === 'monthly' ? '元/月' : '元/小时'}
            </span>
          </div>
        </div>

        {/* 加班工时输入卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>加班时长统计 (小时)</span>
          </div>

          {/* 工作日加班 (1.5倍) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-800">平时延时加班</div>
              <div className="text-[10px] text-slate-400">法定 1.5 倍工资本金</div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={weekdayHours}
                onChange={(e) => setWeekdayHours(e.target.value)}
                className="w-16 text-center bg-white py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                placeholder="0"
              />
              <span className="text-xs font-bold text-slate-500">小时</span>
            </div>
          </div>

          {/* 周末加班 (2.0倍) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-800">休息日加班 (周末)</div>
              <div className="text-[10px] text-slate-400">法定 2.0 倍工资本金</div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={weekendHours}
                onChange={(e) => setWeekendHours(e.target.value)}
                className="w-16 text-center bg-white py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                placeholder="0"
              />
              <span className="text-xs font-bold text-slate-500">小时</span>
            </div>
          </div>

          {/* 法定节假日 (3.0倍) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
            <div>
              <div className="text-xs font-bold text-amber-900">法定节假日加班</div>
              <div className="text-[10px] text-amber-600">法定 3.0 倍工资本金</div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={holidayHours}
                onChange={(e) => setHolidayHours(e.target.value)}
                className="w-16 text-center bg-white py-1.5 rounded-xl border border-amber-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                placeholder="0"
              />
              <span className="text-xs font-bold text-amber-800">小时</span>
            </div>
          </div>

          {/* 夜班或补贴 */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-600">其他补贴/夜班津贴</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                className="w-20 text-right bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                placeholder="0"
              />
              <span className="text-xs font-bold text-slate-500">元</span>
            </div>
          </div>
        </div>

        {/* 结果展示卡片 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-amber-200/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              当月加班费总计
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
              ¥{result.totalOvertimePay.toFixed(2)}
            </span>
            <span className="text-xs text-amber-100 font-bold">
              共 {result.totalOvertimeHours} 小时
            </span>
          </div>

          {wageMode === 'monthly' && (
            <div className="text-xs text-white/90 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              预估当月总薪资: ¥{result.totalIncome.toFixed(2)} 元
            </div>
          )}

          {/* 三档明细 */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
            <div className="bg-white/10 p-2.5 rounded-2xl">
              <div className="text-[10px] text-amber-100 font-bold mb-0.5">平时 (1.5x)</div>
              <div className="text-xs font-black">¥{result.weekdayPay.toFixed(1)}</div>
              <div className="text-[9px] text-amber-200 mt-0.5">{result.wdHours}h</div>
            </div>

            <div className="bg-white/10 p-2.5 rounded-2xl">
              <div className="text-[10px] text-amber-100 font-bold mb-0.5">周末 (2.0x)</div>
              <div className="text-xs font-black">¥{result.weekendPay.toFixed(1)}</div>
              <div className="text-[9px] text-amber-200 mt-0.5">{result.weHours}h</div>
            </div>

            <div className="bg-white/10 p-2.5 rounded-2xl">
              <div className="text-[10px] text-amber-100 font-bold mb-0.5">假日 (3.0x)</div>
              <div className="text-xs font-black text-amber-200">
                ¥{result.holidayPay.toFixed(1)}
              </div>
              <div className="text-[9px] text-amber-200 mt-0.5">{result.hdHours}h</div>
            </div>
          </div>
        </div>

        {/* 底部重置与法律依据 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>依据《中华人民共和国劳动法》第44条标准执行</span>
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
