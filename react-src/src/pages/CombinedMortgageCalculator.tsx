import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { Volume2, RotateCcw, Home, PieChart, ChevronDown, ChevronUp } from 'lucide-react';

type RepayMethod = 'equal_installment' | 'equal_principal';

export default function CombinedMortgageCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 还款方式
  const [repayMethod, setRepayMethod] = useState<RepayMethod>('equal_installment');

  // 商业贷款部分
  const [commAmount, setCommAmount] = useState<string>('120'); // 万元
  const [commRate, setCommRate] = useState<string>('3.15'); // %

  // 公积金贷款部分
  const [fundAmount, setFundAmount] = useState<string>('80'); // 万元
  const [fundRate, setFundRate] = useState<string>('2.85'); // %

  // 贷款年限
  const [years, setYears] = useState<number>(30);

  // 是否展开明细
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const calcResult = useMemo(() => {
    const P_comm = (parseFloat(commAmount) || 0) * 10000;
    const r_comm = ((parseFloat(commRate) || 0) / 100) / 12;

    const P_fund = (parseFloat(fundAmount) || 0) * 10000;
    const r_fund = ((parseFloat(fundRate) || 0) / 100) / 12;

    const N = years * 12;
    if (N <= 0 || (P_comm <= 0 && P_fund <= 0)) return null;

    const totalPrincipal = P_comm + P_fund;

    // 单笔计算辅助函数
    const calcLoan = (P: number, r: number, totalMonths: number) => {
      if (P <= 0) return { monthly: 0, totalInterest: 0, totalRepayment: 0, firstMonth: 0, monthlyDec: 0 };
      if (repayMethod === 'equal_installment') {
        const m = (P * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
        const totInt = m * totalMonths - P;
        return {
          monthly: m,
          totalInterest: totInt,
          totalRepayment: m * totalMonths,
          firstMonth: m,
          monthlyDec: 0,
        };
      } else {
        const principalPerMonth = P / totalMonths;
        const totInt = ((totalMonths + 1) * P * r) / 2;
        const firstM = principalPerMonth + P * r;
        const dec = principalPerMonth * r;
        return {
          monthly: firstM,
          totalInterest: totInt,
          totalRepayment: P + totInt,
          firstMonth: firstM,
          monthlyDec: dec,
        };
      }
    };

    const commRes = calcLoan(P_comm, r_comm, N);
    const fundRes = calcLoan(P_fund, r_fund, N);

    const totalMonthly = commRes.firstMonth + fundRes.firstMonth;
    const totalInterest = commRes.totalInterest + fundRes.totalInterest;
    const totalRepay = totalPrincipal + totalInterest;
    const totalMonthlyDec = commRes.monthlyDec + fundRes.monthlyDec;

    return {
      totalPrincipal,
      P_comm,
      P_fund,
      commRes,
      fundRes,
      totalMonthly,
      totalInterest,
      totalRepay,
      totalMonthlyDec,
      totalMonths: N,
    };
  }, [commAmount, commRate, fundAmount, fundRate, years, repayMethod]);

  const handleVoiceReport = () => {
    if (!calcResult) {
      speakText('请先输入有效的组合贷款金额与利率');
      return;
    }
    const totalWan = (calcResult.totalRepay / 10000).toFixed(2);
    const interestWan = (calcResult.totalInterest / 10000).toFixed(2);
    if (repayMethod === 'equal_installment') {
      speakText(`组合贷款等额本息，每月总月供约为 ${calcResult.totalMonthly.toFixed(0)} 元，支付总利息约 ${interestWan} 万元，还款总计 ${totalWan} 万元。`);
    } else {
      speakText(`组合贷款等额本金，首月总月供约为 ${calcResult.totalMonthly.toFixed(0)} 元，每月递减约 ${calcResult.totalMonthlyDec.toFixed(1)} 元，支付总利息约 ${interestWan} 万元。`);
    }
  };

  const handleReset = () => {
    setRepayMethod('equal_installment');
    setCommAmount('120');
    setCommRate('3.15');
    setFundAmount('80');
    setFundRate('2.85');
    setYears(30);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col">
      <AppPageHeader
        title="组合贷款计算器"
        onBack={() => navigate(-1)}
        rightElement={
          <div className="flex items-center gap-1">
            <button
              onClick={handleVoiceReport}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="语音播报"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="重置"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="flex-1 w-full space-y-4">
        {/* 结果汇总卡片 */}
        {calcResult && (
          <div className="bg-gradient-to-br from-indigo-600 to-sky-700 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-indigo-100 font-medium">
                  {repayMethod === 'equal_installment' ? '每月合计月供' : '首月合计月供'}
                </div>
                <div className="text-3xl font-extrabold mt-1 tracking-tight">
                  {calcResult.totalMonthly.toFixed(0)}
                  <span className="text-sm font-normal ml-1">元/月</span>
                </div>
                {repayMethod === 'equal_principal' && (
                  <div className="text-xs text-indigo-200 mt-0.5">
                    每月递减约 {calcResult.totalMonthlyDec.toFixed(1)} 元
                  </div>
                )}
              </div>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-semibold text-white">
                贷款总额 {(calcResult.totalPrincipal / 10000).toFixed(0)} 万元
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-xs">
              <div>
                <span className="text-indigo-200">商业月供 / 利息</span>
                <p className="font-semibold text-sm mt-0.5">
                  {calcResult.commRes.firstMonth.toFixed(0)} 元 · {(calcResult.commRes.totalInterest / 10000).toFixed(2)}万利息
                </p>
              </div>
              <div>
                <span className="text-indigo-200">公积金月供 / 利息</span>
                <p className="font-semibold text-sm mt-0.5">
                  {calcResult.fundRes.firstMonth.toFixed(0)} 元 · {(calcResult.fundRes.totalInterest / 10000).toFixed(2)}万利息
                </p>
              </div>
              <div>
                <span className="text-indigo-200">累计支付总利息</span>
                <p className="font-semibold text-sm mt-0.5">
                  {(calcResult.totalInterest / 10000).toFixed(2)} 万元
                </p>
              </div>
              <div>
                <span className="text-indigo-200">还款总额 (本息)</span>
                <p className="font-semibold text-sm mt-0.5">
                  {(calcResult.totalRepay / 10000).toFixed(2)} 万元
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 还款方式与年限 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">贷款方式与期限</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-medium">
            <button
              onClick={() => setRepayMethod('equal_installment')}
              className={`py-2 rounded-lg transition-all ${
                repayMethod === 'equal_installment'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              等额本息 (每月相同)
            </button>
            <button
              onClick={() => setRepayMethod('equal_principal')}
              className={`py-2 rounded-lg transition-all ${
                repayMethod === 'equal_principal'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              等额本金 (逐月递减)
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">贷款期限 (年)</label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 15, 20, 25, 30].map((y) => (
                <option key={y} value={y}>{y} 年 ({y * 12} 期)</option>
              ))}
            </select>
          </div>
        </div>

        {/* 商业贷款部分输入 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>商业贷款部分</span>
            <span className="text-xs font-normal text-slate-500">基准参考: 3.15%</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">商贷金额 (万元)</label>
              <input
                type="number"
                value={commAmount}
                onChange={(e) => setCommAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">商贷年利率 (%)</label>
              <input
                type="number"
                step="0.05"
                value={commRate}
                onChange={(e) => setCommRate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 公积金贷款部分输入 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>公积金贷款部分</span>
            <span className="text-xs font-normal text-slate-500">基准参考: 2.85%</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">公积金金额 (万元)</label>
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">公积金年利率 (%)</label>
              <input
                type="number"
                step="0.05"
                value={fundRate}
                onChange={(e) => setFundRate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 组合贷小常识 */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="font-semibold text-indigo-700 dark:text-indigo-400">
            买房组合贷款注意事项
          </div>
          <div>
            1. 组合贷款还款时，公积金账户内的余额通常优先用于冲还公积金贷款部分，亦可签约逐月冲还贷。
          </div>
          <div>
            2. 提前还款时，由于商业贷款利率普遍高于公积金利率，通常建议优先申请提前还清商业贷款部分以最大化节省利息。
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
