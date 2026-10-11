import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { Volume2, RotateCcw, TrendingDown, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';

type RepayMethod = 'equal_installment' | 'equal_principal';
type EarlyPlanType = 'reduce_term' | 'reduce_payment' | 'pay_off';

export default function EarlyRepaymentCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 原贷款基本信息
  const [loanAmount, setLoanAmount] = useState<string>('100'); // 万元
  const [loanYears, setLoanYears] = useState<number>(30); // 贷款年限
  const [interestRate, setInterestRate] = useState<string>('3.2'); // 年利率 %
  const [repayMethod, setRepayMethod] = useState<RepayMethod>('equal_installment'); // 方式

  // 已还情况
  const [paidMonths, setPaidMonths] = useState<number>(36); // 已还月数（例如3年）

  // 提前还款方案
  const [planType, setPlanType] = useState<EarlyPlanType>('reduce_term'); // 缩短年限 / 减少月供 / 一次性结清
  const [earlyAmount, setEarlyAmount] = useState<string>('20'); // 提前还款本金 万元

  const calcResult = useMemo(() => {
    const P0 = (parseFloat(loanAmount) || 0) * 10000;
    const rYear = parseFloat(interestRate) || 0;
    const r = (rYear / 100) / 12;
    const N0 = loanYears * 12;
    const k = paidMonths;

    if (P0 <= 0 || N0 <= 0 || r <= 0 || k < 0 || k >= N0) {
      return null;
    }

    // 1. 原还款计划测算
    let originalTotalInterest = 0;
    let originalMonthlyPayment = 0;
    let remainingPrincipal = P0; // 第 k 期末剩余本金
    let paidPrincipal = 0;
    let paidInterest = 0;

    if (repayMethod === 'equal_installment') {
      // 等额本息
      originalMonthlyPayment = (P0 * r * Math.pow(1 + r, N0)) / (Math.pow(1 + r, N0) - 1);
      originalTotalInterest = originalMonthlyPayment * N0 - P0;

      let tempP = P0;
      for (let m = 1; m <= k; m++) {
        const curInterest = tempP * r;
        const curPrincipal = originalMonthlyPayment - curInterest;
        paidPrincipal += curPrincipal;
        paidInterest += curInterest;
        tempP -= curPrincipal;
      }
      remainingPrincipal = Math.max(0, tempP);
    } else {
      // 等额本金
      const monthlyPrincipal = P0 / N0;
      originalTotalInterest = ((N0 + 1) * P0 * r) / 2;
      originalMonthlyPayment = monthlyPrincipal + P0 * r; // 首月月供

      for (let m = 1; m <= k; m++) {
        const curPrincipal = monthlyPrincipal;
        const curInterest = (P0 - (m - 1) * monthlyPrincipal) * r;
        paidPrincipal += curPrincipal;
        paidInterest += curInterest;
      }
      remainingPrincipal = Math.max(0, P0 - k * monthlyPrincipal);
    }

    // 2. 提前还款方案
    let extraPayment = (parseFloat(earlyAmount) || 0) * 10000;
    if (planType === 'pay_off' || extraPayment >= remainingPrincipal) {
      extraPayment = remainingPrincipal;
    }

    const newRemainingPrincipal = Math.max(0, remainingPrincipal - extraPayment);

    // 计算提前还款后剩余利息与新月供
    let newFutureInterest = 0;
    let newMonthlyPayment = 0;
    let newRemainingMonths = 0;

    if (newRemainingPrincipal <= 0 || planType === 'pay_off') {
      // 一次性结清
      newFutureInterest = 0;
      newMonthlyPayment = 0;
      newRemainingMonths = 0;
    } else if (repayMethod === 'equal_installment') {
      if (planType === 'reduce_term') {
        // 缩短年限：保持原月供基本不变，计算新的所需期数
        // log(M / (M - P * r)) / log(1 + r)
        const M = originalMonthlyPayment;
        if (M <= newRemainingPrincipal * r) {
          // 月供不足以覆盖利息（极端小概率，避免死循环）
          newRemainingMonths = N0 - k;
        } else {
          newRemainingMonths = Math.ceil(
            Math.log(M / (M - newRemainingPrincipal * r)) / Math.log(1 + r)
          );
        }
        newMonthlyPayment = (newRemainingPrincipal * r * Math.pow(1 + r, newRemainingMonths)) /
          (Math.pow(1 + r, newRemainingMonths) - 1);
        newFutureInterest = newMonthlyPayment * newRemainingMonths - newRemainingPrincipal;
      } else {
        // 减少月供：还款期数保持不变 (N0 - k)
        newRemainingMonths = N0 - k;
        newMonthlyPayment = (newRemainingPrincipal * r * Math.pow(1 + r, newRemainingMonths)) /
          (Math.pow(1 + r, newRemainingMonths) - 1);
        newFutureInterest = newMonthlyPayment * newRemainingMonths - newRemainingPrincipal;
      }
    } else {
      // 等额本金
      if (planType === 'reduce_term') {
        // 保持原月本金不变
        const origMonthlyPrincipal = P0 / N0;
        newRemainingMonths = Math.ceil(newRemainingPrincipal / origMonthlyPrincipal);
        const actualMonthlyPrincipal = newRemainingPrincipal / newRemainingMonths;
        newFutureInterest = ((newRemainingMonths + 1) * newRemainingPrincipal * r) / 2;
        newMonthlyPayment = actualMonthlyPrincipal + newRemainingPrincipal * r;
      } else {
        newRemainingMonths = N0 - k;
        const actualMonthlyPrincipal = newRemainingPrincipal / newRemainingMonths;
        newFutureInterest = ((newRemainingMonths + 1) * newRemainingPrincipal * r) / 2;
        newMonthlyPayment = actualMonthlyPrincipal + newRemainingPrincipal * r;
      }
    }

    // 原计划未来利息
    const origFutureInterest = originalTotalInterest - paidInterest;
    // 节省利息
    const savedInterest = Math.max(0, origFutureInterest - newFutureInterest);
    // 缩短月数
    const shortenedMonths = Math.max(0, (N0 - k) - newRemainingMonths);

    return {
      originalMonthlyPayment,
      remainingPrincipal,
      paidPrincipal,
      paidInterest,
      extraPayment,
      newRemainingPrincipal,
      newMonthlyPayment,
      newRemainingMonths,
      savedInterest,
      shortenedMonths,
      origFutureInterest,
      newFutureInterest,
    };
  }, [loanAmount, loanYears, interestRate, repayMethod, paidMonths, planType, earlyAmount]);

  const handleVoiceReport = () => {
    if (!calcResult) {
      speakText('请先输入有效的原贷款和提前还款信息');
      return;
    }
    const savedWan = (calcResult.savedInterest / 10000).toFixed(2);
    if (planType === 'pay_off') {
      speakText(`一次性结清剩余贷款，共节省后续利息约 ${savedWan} 万元。`);
    } else if (planType === 'reduce_term') {
      const shortenYears = (calcResult.shortenedMonths / 12).toFixed(1);
      speakText(`提前还款后选择缩短年限，可节省利息支出约 ${savedWan} 万元，缩短还款期约 ${shortenYears} 年。`);
    } else {
      const newPay = calcResult.newMonthlyPayment.toFixed(0);
      speakText(`提前还款后选择减少月供，新月供降为约每月 ${newPay} 元，节省利息约 ${savedWan} 万元。`);
    }
  };

  const handleReset = () => {
    setLoanAmount('100');
    setLoanYears(30);
    setInterestRate('3.2');
    setRepayMethod('equal_installment');
    setPaidMonths(36);
    setPlanType('reduce_term');
    setEarlyAmount('20');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <AppPageHeader
        title="房贷提前还款测算"
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

      <div className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* 核心结论卡片 */}
        {calcResult && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-blue-100 font-medium">累计节省利息支出</div>
                <div className="text-3xl font-extrabold mt-1 tracking-tight">
                  {(calcResult.savedInterest / 10000).toFixed(2)}
                  <span className="text-sm font-normal ml-1">万元</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-semibold text-white">
                {planType === 'reduce_term' ? '缩短年限方案' : planType === 'reduce_payment' ? '减少月供方案' : '一次性结清'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-xs">
              <div>
                <span className="text-blue-200">当前剩余本金</span>
                <p className="font-semibold text-sm mt-0.5">
                  {(calcResult.remainingPrincipal / 10000).toFixed(2)} 万元
                </p>
              </div>
              <div>
                <span className="text-blue-200">还款后新月供</span>
                <p className="font-semibold text-sm mt-0.5">
                  {planType === 'pay_off' ? '0 元' : `${calcResult.newMonthlyPayment.toFixed(0)} 元/月`}
                </p>
              </div>
              <div>
                <span className="text-blue-200">剩余还款期数</span>
                <p className="font-semibold text-sm mt-0.5">
                  {calcResult.newRemainingMonths} 期 ({Math.floor(calcResult.newRemainingMonths / 12)}年{calcResult.newRemainingMonths % 12}月)
                </p>
              </div>
              <div>
                <span className="text-blue-200">缩短还款期限</span>
                <p className="font-semibold text-sm mt-0.5">
                  {calcResult.shortenedMonths > 0 ? `提前 ${calcResult.shortenedMonths} 个月` : '期限不变'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 原贷款信息配置 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">原贷款信息</div>

          {/* 还款方式选择 */}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">原贷款金额 (万元)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">贷款年利率 (%)</label>
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">原贷款期限 (年)</label>
              <select
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 15, 20, 25, 30].map((y) => (
                  <option key={y} value={y}>{y} 年 ({y * 12} 期)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">已还月数 (期)</label>
              <input
                type="number"
                value={paidMonths}
                onChange={(e) => setPaidMonths(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 提前还款方案选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">提前还款规划</div>

          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-medium">
            <button
              onClick={() => setPlanType('reduce_term')}
              className={`py-2 rounded-lg transition-all ${
                planType === 'reduce_term'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              缩短还款期限
            </button>
            <button
              onClick={() => setPlanType('reduce_payment')}
              className={`py-2 rounded-lg transition-all ${
                planType === 'reduce_payment'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              减少每月月供
            </button>
            <button
              onClick={() => setPlanType('pay_off')}
              className={`py-2 rounded-lg transition-all ${
                planType === 'pay_off'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              一次性结清
            </button>
          </div>

          {planType !== 'pay_off' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-500 dark:text-slate-400">本次提前还款本金 (万元)</label>
                <div className="flex gap-1">
                  {['5', '10', '20', '30'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setEarlyAmount(val)}
                      className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded"
                    >
                      +{val}万
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={earlyAmount}
                onChange={(e) => setEarlyAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* 策略对比分析提示 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              还款方式对比建议
            </div>
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200">1. 缩短年限：</span>
              月供基本不变，还款期大幅缩短，整体节省利息最多，适合当前现金流充裕的家庭。
            </div>
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200">2. 减少月供：</span>
              还款期限不变，直接降低每月月供金额，显著减轻每月生活还款压力，提升流动性安全垫。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
