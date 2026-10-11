import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Car, HelpCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function CarLoanCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 裸车售价 (万元)
  const [carPrice, setCarPrice] = useState<string>('15');
  // 首付比例 (%)
  const [downRatio, setDownRatio] = useState<number>(30);
  // 贷款期限 (年)
  const [loanYears, setLoanYears] = useState<number>(3);
  // 年利率 / 年费率 (%)
  const [interestRate, setInterestRate] = useState<string>('4.5');

  // 必要花费选项展开
  const [showTaxDetail, setShowTaxDetail] = useState<boolean>(false);

  // 核心计算
  const result = useMemo(() => {
    const priceYuan = (parseFloat(carPrice) || 0) * 10000;
    if (priceYuan <= 0) return null;

    // 首付金额与贷款金额
    const downPayment = priceYuan * (downRatio / 100);
    const loanAmount = priceYuan - downPayment;

    // 必要花费 (官方标准估算)
    // 1. 车辆购置税 = 裸车售价 / 1.13 * 10%
    const purchaseTax = Math.round((priceYuan / 1.13) * 0.1);
    // 2. 车船税 (常见 1.6-2.0L 为例，约 420 元)
    const vehicleTax = 420;
    // 3. 交强险 (家用6座以下标准 950 元)
    const compulsoryInsurance = 950;
    // 4. 上牌服务费 (通常约 500 元)
    const plateFee = 500;
    // 5. 商业险基础包 (车损险 + 200万三者 + 不计免赔，约车价的 2.5% ~ 3.5%)
    const commercialInsurance = Math.round(priceYuan * 0.028 + 1200);

    // 必要税费合计
    const necessaryFees = purchaseTax + vehicleTax + compulsoryInsurance + plateFee + commercialInsurance;

    // 贷款利息与月供计算 (等额本息/常规车贷分期)
    const months = loanYears * 12;
    const rate = (parseFloat(interestRate) || 0) / 100;
    const monthlyRate = rate / 12;

    let monthlyPayment = 0;
    let totalInterest = 0;

    if (loanAmount > 0 && months > 0) {
      if (monthlyRate > 0) {
        monthlyPayment =
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
        totalInterest = monthlyPayment * months - loanAmount;
      } else {
        monthlyPayment = loanAmount / months;
        totalInterest = 0;
      }
    }

    // 首期提车花费 (首付 + 必要税费)
    const firstPayment = downPayment + necessaryFees;

    // 分期落地总价 = 首付 + 贷款本息 + 必要税费
    const installmentTotal = downPayment + loanAmount + totalInterest + necessaryFees;
    // 全款落地总价 = 裸车价 + 必要税费
    const fullPayTotal = priceYuan + necessaryFees;

    return {
      priceYuan,
      downPayment,
      loanAmount,
      purchaseTax,
      vehicleTax,
      compulsoryInsurance,
      plateFee,
      commercialInsurance,
      necessaryFees,
      monthlyPayment,
      totalInterest,
      firstPayment,
      installmentTotal,
      fullPayTotal,
      months,
    };
  }, [carPrice, downRatio, loanYears, interestRate]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `裸车价${carPrice}万元，首付${downRatio}%约${(result.downPayment / 10000).toFixed(2)}万元。分期${loanYears}年，每月月供约${result.monthlyPayment.toFixed(0)}元，首期提车需准备约${(result.firstPayment / 10000).toFixed(2)}万元。`;
    speakText(text);
  };

  const handleReset = () => {
    setCarPrice('15');
    setDownRatio(30);
    setLoanYears(3);
    setInterestRate('4.5');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="车贷与落地价计算" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 输入面板卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 裸车售价 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>裸车售价 (官方指导价或成交价)</span>
              <span className="text-amber-600 font-extrabold text-sm">{carPrice || '0'} 万元</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={carPrice}
                onChange={(e) => setCarPrice(e.target.value)}
                placeholder="请输入裸车价"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                万元
              </span>
            </div>
          </div>

          {/* 首付比例 */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>首付比例</span>
              <span className="text-amber-600 font-extrabold">{downRatio}%</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 20, 30, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setDownRatio(r)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    downRatio === r
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r === 0 ? '0首付' : `${r}%`}
                </button>
              ))}
            </div>
          </div>

          {/* 贷款期限与年利率 */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">分期年限</div>
              <select
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    {y} 年 ({y * 12} 期)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">分期年利率/费率</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 结果展示卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-amber-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                每月车贷月供
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
              <span className="text-xs text-amber-100">/ 月 (共 {result.months} 期)</span>
            </div>

            <div className="text-xs text-white/95 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              提车首期花费: ¥{(result.firstPayment / 10000).toFixed(2)} 万元 (含首付+税费险)
            </div>

            {/* 对比两格 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">全款落地总价</div>
                <div className="text-sm font-black">
                  {(result.fullPayTotal / 10000).toFixed(2)} 万
                </div>
                <div className="text-[9px] text-amber-200 mt-0.5">无利息支出</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">分期落地总价</div>
                <div className="text-sm font-black text-yellow-200">
                  {(result.installmentTotal / 10000).toFixed(2)} 万
                </div>
                <div className="text-[9px] text-amber-200 mt-0.5">
                  利息约 +{(result.totalInterest / 10000).toFixed(2)}万
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 必要税费清单折叠卡片 */}
        {result && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <button
              onClick={() => setShowTaxDetail(!showTaxDetail)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                查看落地必要税费预估 (共 ¥{result.necessaryFees} 元)
              </span>
              {showTaxDetail ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showTaxDetail && (
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">车辆购置税 (10%)</span>
                  <span className="font-bold text-slate-800">¥{result.purchaseTax}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">交强险 (6座以下)</span>
                  <span className="font-bold text-slate-800">¥{result.compulsoryInsurance}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">商业险预估 (车损+200万三者)</span>
                  <span className="font-bold text-slate-800">¥{result.commercialInsurance}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">车船使用税</span>
                  <span className="font-bold text-slate-800">¥{result.vehicleTax}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">上牌杂费 (预估)</span>
                  <span className="font-bold text-slate-800">¥{result.plateFee}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>税费根据国家现行车辆购置税标准与常规保险方案测算</span>
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
