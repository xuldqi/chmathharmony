import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Home, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

type LoanType = 'commercial' | 'fund' | 'combination';
type RepayMethod = 'equal_installment' | 'equal_principal';

export default function MortgageCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();
  const isTab = useIsCurrentTab('/mortgage-calculator');

  // 贷款类型
  const [loanType, setLoanType] = useState<LoanType>('commercial');
  // 还款方式
  const [repayMethod, setRepayMethod] = useState<RepayMethod>('equal_installment');

  // 商业贷款
  const [commAmount, setCommAmount] = useState<string>('100'); // 万元
  const [commRate, setCommRate] = useState<string>('3.15'); // %

  // 公积金贷款
  const [fundAmount, setFundAmount] = useState<string>('50'); // 万元
  const [fundRate, setFundRate] = useState<string>('2.85'); // %

  // 年限
  const [years, setYears] = useState<number>(30);

  // 是否展开明细表
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // 计算房贷
  const result = useMemo(() => {
    const totalMonths = years * 12;
    if (totalMonths <= 0) return null;

    let pComm = 0;
    let rComm = 0;
    let pFund = 0;
    let rFund = 0;

    if (loanType === 'commercial' || loanType === 'combination') {
      pComm = (parseFloat(commAmount) || 0) * 10000;
      rComm = ((parseFloat(commRate) || 0) / 100) / 12;
    }

    if (loanType === 'fund' || loanType === 'combination') {
      pFund = (parseFloat(fundAmount) || 0) * 10000;
      rFund = ((parseFloat(fundRate) || 0) / 100) / 12;
    }

    const totalPrincipal = pComm + pFund;
    if (totalPrincipal <= 0) return null;

    // 单笔等额本息月供计算
    const calcInstallmentMonth = (p: number, r: number, m: number) => {
      if (p <= 0) return 0;
      if (r <= 0) return p / m;
      return (p * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
    };

    if (repayMethod === 'equal_installment') {
      // 等额本息
      const monthComm = calcInstallmentMonth(pComm, rComm, totalMonths);
      const monthFund = calcInstallmentMonth(pFund, rFund, totalMonths);
      const monthlyPayment = monthComm + monthFund;
      const totalPayment = monthlyPayment * totalMonths;
      const totalInterest = totalPayment - totalPrincipal;

      // 月度还款明细(前36期展示)
      let remainComm = pComm;
      let remainFund = pFund;
      const schedule = [];
      const previewMonths = Math.min(totalMonths, 36);

      for (let i = 1; i <= previewMonths; i++) {
        const intComm = remainComm * rComm;
        const prinComm = monthComm - intComm;
        remainComm = Math.max(0, remainComm - prinComm);

        const intFund = remainFund * rFund;
        const prinFund = monthFund - intFund;
        remainFund = Math.max(0, remainFund - prinFund);

        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: prinComm + prinFund,
          interest: intComm + intFund,
          remain: remainComm + remainFund,
        });
      }

      return {
        type: 'equal_installment',
        totalPrincipal,
        monthlyPayment,
        firstMonthPayment: monthlyPayment,
        decreasePerMonth: 0,
        totalPayment,
        totalInterest,
        schedule,
        totalMonths,
      };
    } else {
      // 等额本金
      const prinPerMonthComm = pComm / totalMonths;
      const prinPerMonthFund = pFund / totalMonths;
      const prinPerMonthTotal = prinPerMonthComm + prinPerMonthFund;

      let totalInterest = 0;
      let remainComm = pComm;
      let remainFund = pFund;
      let firstMonthPayment = 0;
      let secondMonthPayment = 0;

      const schedule = [];
      const previewMonths = Math.min(totalMonths, 36);

      for (let i = 1; i <= totalMonths; i++) {
        const intComm = remainComm * rComm;
        const intFund = remainFund * rFund;
        const currentInterest = intComm + intFund;
        const currentPayment = prinPerMonthTotal + currentInterest;

        totalInterest += currentInterest;
        remainComm = Math.max(0, remainComm - prinPerMonthComm);
        remainFund = Math.max(0, remainFund - prinPerMonthFund);

        if (i === 1) firstMonthPayment = currentPayment;
        if (i === 2) secondMonthPayment = currentPayment;

        if (i <= previewMonths) {
          schedule.push({
            month: i,
            payment: currentPayment,
            principal: prinPerMonthTotal,
            interest: currentInterest,
            remain: remainComm + remainFund,
          });
        }
      }

      const decreasePerMonth = firstMonthPayment - secondMonthPayment;
      const totalPayment = totalPrincipal + totalInterest;

      return {
        type: 'equal_principal',
        totalPrincipal,
        monthlyPayment: firstMonthPayment,
        firstMonthPayment,
        decreasePerMonth,
        totalPayment,
        totalInterest,
        schedule,
        totalMonths,
      };
    }
  }, [loanType, repayMethod, commAmount, commRate, fundAmount, fundRate, years]);

  const handleSpeak = () => {
    if (!result) return;
    if (result.type === 'equal_installment') {
      const text = `等额本息还款，贷款${(result.totalPrincipal / 10000).toFixed(1)}万元，期限${years}年。每月还款约${result.monthlyPayment.toFixed(0)}元，总利息约${(result.totalInterest / 10000).toFixed(2)}万元。`;
      speakText(text);
    } else {
      const text = `等额本金还款，首月还款约${result.firstMonthPayment.toFixed(0)}元，每月递减约${result.decreasePerMonth.toFixed(1)}元，总利息约${(result.totalInterest / 10000).toFixed(2)}万元。`;
      speakText(text);
    }
  };

  const handleReset = () => {
    setLoanType('commercial');
    setRepayMethod('equal_installment');
    setCommAmount('100');
    setCommRate('3.15');
    setFundAmount('50');
    setFundRate('2.85');
    setYears(30);
  };

  return (
    <div className={`min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-12'}`}>
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        <AppPageHeader
          title="房贷计算器"
          onBack={isTab ? undefined : () => navigate(-1)}
          showBack={!isTab}
        />

        <main className="flex-1 w-full space-y-4">
        {/* 顶部贷款模式切换 */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
          {(
            [
              { id: 'commercial', label: '商业贷款' },
              { id: 'fund', label: '公积金贷' },
              { id: 'combination', label: '组合贷款' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setLoanType(item.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                loanType === item.id
                  ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-300/40'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 输入面板卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 还款方式切换 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">还款方式</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setRepayMethod('equal_installment')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  repayMethod === 'equal_installment'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                等额本息
              </button>
              <button
                onClick={() => setRepayMethod('equal_principal')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  repayMethod === 'equal_principal'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                等额本金
              </button>
            </div>
          </div>

          {/* 商业贷款输入 */}
          {(loanType === 'commercial' || loanType === 'combination') && (
            <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">商业贷款金额</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={commAmount}
                    onChange={(e) => setCommAmount(e.target.value)}
                    className="w-24 text-right bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                    placeholder="0"
                  />
                  <span className="text-xs font-bold text-amber-800">万元</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">商贷年利率</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={commRate}
                    onChange={(e) => setCommRate(e.target.value)}
                    className="w-20 text-right bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                    placeholder="3.15"
                  />
                  <span className="text-xs font-bold text-amber-800">%</span>
                </div>
              </div>
            </div>
          )}

          {/* 公积金贷款输入 */}
          {(loanType === 'fund' || loanType === 'combination') && (
            <div className="space-y-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">公积金贷款额</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-24 text-right bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-400"
                    placeholder="0"
                  />
                  <span className="text-xs font-bold text-blue-800">万元</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">公积金利率</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={fundRate}
                    onChange={(e) => setFundRate(e.target.value)}
                    className="w-20 text-right bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-400"
                    placeholder="2.85"
                  />
                  <span className="text-xs font-bold text-blue-800">%</span>
                </div>
              </div>
            </div>
          )}

          {/* 按揭年限 */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-500">按揭年限</span>
            <div className="flex items-center gap-2">
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                {[30, 25, 20, 15, 10, 5].map((y) => (
                  <option key={y} value={y}>
                    {y} 年 ({y * 12} 期)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 结果展示卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                {repayMethod === 'equal_installment' ? '每月月供 (固定)' : '首月月供 (逐月递减)'}
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
                ¥{result.monthlyPayment.toFixed(2)}
              </span>
              <span className="text-xs text-indigo-200">/ 月</span>
            </div>

            {repayMethod === 'equal_principal' && (
              <div className="text-xs text-amber-200 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
                每月递减约 ¥{result.decreasePerMonth.toFixed(2)} 元
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">贷款本金</div>
                <div className="text-xs font-black">
                  {(result.totalPrincipal / 10000).toFixed(1)} 万
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">支付利息</div>
                <div className="text-xs font-black text-amber-300">
                  {(result.totalInterest / 10000).toFixed(2)} 万
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">还款总额</div>
                <div className="text-xs font-black">
                  {(result.totalPayment / 10000).toFixed(2)} 万
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 还款明细展开折叠 */}
        {result && result.schedule.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1"
            >
              <span>查看还款明细 (前36期计划)</span>
              {showSchedule ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showSchedule && (
              <div className="pt-2 border-t border-slate-100 max-h-60 overflow-y-auto space-y-1.5 pr-1">
                <div className="grid grid-cols-4 text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">
                  <span>期数</span>
                  <span className="text-right">月供(元)</span>
                  <span className="text-right">本金(元)</span>
                  <span className="text-right">利息(元)</span>
                </div>
                {result.schedule.map((item) => (
                  <div
                    key={item.month}
                    className="grid grid-cols-4 text-[11px] font-medium text-slate-600 py-1 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-slate-400">第 {item.month} 期</span>
                    <span className="text-right font-bold text-slate-800">
                      {item.payment.toFixed(1)}
                    </span>
                    <span className="text-right text-indigo-600">
                      {item.principal.toFixed(1)}
                    </span>
                    <span className="text-right text-amber-600">
                      {item.interest.toFixed(1)}
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
            <span>等额本息利息多月供稳，等额本金总利息少</span>
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

      {isTab && <MainTabBar />}
    </div>
  );
}
