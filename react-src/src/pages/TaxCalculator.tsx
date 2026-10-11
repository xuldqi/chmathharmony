import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, DollarSign, HelpCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function TaxCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 税前月薪
  const [salary, setSalary] = useState<string>('15000');
  // 专项附加扣除
  const [specialDeduction, setSpecialDeduction] = useState<string>('2000');
  // 年终奖
  const [bonus, setBonus] = useState<string>('0');

  // 五险一金模式：true=按比例自动算, false=手动填
  const [autoInsurance, setAutoInsurance] = useState<boolean>(true);
  const [socialRate, setSocialRate] = useState<string>('10.5'); // 养老8% + 医疗2% + 失业0.5%
  const [fundRate, setFundRate] = useState<string>('7.0'); // 住房公积金

  const [customSocial, setCustomSocial] = useState<string>('1575');
  const [customFund, setCustomFund] = useState<string>('1050');

  // 是否显示专项附加扣除标准参考
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // 七级累进税率表 (年度累计)
  const brackets = [
    { min: 0, max: 36000, rate: 0.03, quick: 0 },
    { min: 36000, max: 144000, rate: 0.10, quick: 2520 },
    { min: 144000, max: 300000, rate: 0.20, quick: 16920 },
    { min: 300000, max: 420000, rate: 0.25, quick: 31920 },
    { min: 420000, max: 660000, rate: 0.30, quick: 52920 },
    { min: 660000, max: 960000, rate: 0.35, quick: 85920 },
    { min: 960000, max: Infinity, rate: 0.45, quick: 181920 },
  ];

  // 年终奖税率表 (月均匹配)
  const bonusBrackets = [
    { max: 3000, rate: 0.03, quick: 0 },
    { max: 12000, rate: 0.10, quick: 210 },
    { max: 25000, rate: 0.20, quick: 1410 },
    { max: 35000, rate: 0.25, quick: 2660 },
    { max: 55000, rate: 0.30, quick: 4410 },
    { max: 80000, rate: 0.35, quick: 7160 },
    { max: Infinity, rate: 0.45, quick: 15160 },
  ];

  // 计算逻辑
  const result = useMemo(() => {
    const s = parseFloat(salary) || 0;
    const special = parseFloat(specialDeduction) || 0;
    const b = parseFloat(bonus) || 0;

    if (s <= 0 && b <= 0) return null;

    let monthlySocial = 0;
    let monthlyFund = 0;

    if (autoInsurance) {
      const sr = (parseFloat(socialRate) || 0) / 100;
      const fr = (parseFloat(fundRate) || 0) / 100;
      monthlySocial = s * sr;
      monthlyFund = s * fr;
    } else {
      monthlySocial = parseFloat(customSocial) || 0;
      monthlyFund = parseFloat(customFund) || 0;
    }

    const totalInsurance = monthlySocial + monthlyFund;

    // 月应纳税所得额 = 月薪 - 5000起征点 - 五险一金 - 专项扣除
    const monthlyTaxable = Math.max(0, s - 5000 - totalInsurance - special);

    // 年度累计应纳税所得额 (按12个月折算)
    const annualTaxable = monthlyTaxable * 12;

    // 计算年个税
    let annualTax = 0;
    let currentRate = 0.03;
    for (const item of brackets) {
      if (annualTaxable <= item.max) {
        annualTax = Math.max(0, annualTaxable * item.rate - item.quick);
        currentRate = item.rate;
        break;
      }
    }

    // 月均个税
    const monthlyTax = annualTax / 12;

    // 月税后到手
    const monthlyNet = Math.max(0, s - totalInsurance - monthlyTax);

    // 年终奖单独计税
    let bonusTax = 0;
    if (b > 0) {
      const bAvg = b / 12;
      for (const item of bonusBrackets) {
        if (bAvg <= item.max) {
          bonusTax = Math.max(0, b * item.rate - item.quick);
          break;
        }
      }
    }
    const bonusNet = Math.max(0, b - bonusTax);

    // 全年合计
    const annualGross = s * 12 + b;
    const annualNet = monthlyNet * 12 + bonusNet;
    const annualTotalTax = annualTax + bonusTax;

    return {
      monthlyGross: s,
      monthlySocial,
      monthlyFund,
      totalInsurance,
      monthlyTaxable,
      monthlyTax,
      monthlyNet,
      taxRate: currentRate,
      bonus,
      bonusTax,
      bonusNet,
      annualGross,
      annualNet,
      annualTotalTax,
    };
  }, [salary, specialDeduction, bonus, autoInsurance, socialRate, fundRate, customSocial, customFund]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `税前月薪${result.monthlyGross.toFixed(0)}元，扣除五险一金${result.totalInsurance.toFixed(0)}元和个人所得税${result.monthlyTax.toFixed(0)}元后，税后到手约为${result.monthlyNet.toFixed(0)}元。`;
    speakText(text);
  };

  const handleReset = () => {
    setSalary('15000');
    setSpecialDeduction('2000');
    setBonus('0');
    setAutoInsurance(true);
    setSocialRate('10.5');
    setFundRate('7.0');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none pb-12">
      <AppPageHeader title="个税与薪资计算器" onBack={() => navigate(-1)} />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {/* 输入卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 税前月薪 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>税前月薪 (基本工资+绩效)</span>
              <span className="text-emerald-600 font-extrabold text-sm">¥{salary || '0'}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="请输入税前月薪"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-emerald-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元/月
              </span>
            </div>
          </div>

          {/* 专项附加扣除 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                专项附加扣除
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-slate-400 hover:text-emerald-600"
                  title="查看扣除标准"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </span>
              <span className="text-slate-500 font-bold">¥{specialDeduction || '0'}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={specialDeduction}
                onChange={(e) => setSpecialDeduction(e.target.value)}
                placeholder="子女教育、房贷租金等"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元/月
              </span>
            </div>
          </div>

          {/* 专项附加扣除说明折叠面板 */}
          {showInfo && (
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5 leading-relaxed">
              <div className="font-bold text-emerald-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                国家法定专项附加扣除参考标准：
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-700">
                <li>3岁以下婴幼儿照护 / 子女教育：2000元/月/孩</li>
                <li>赡养老人：独生子女 2000元/月；非独生分摊≤1000元</li>
                <li>住房贷款利息：1000元/月（首套）</li>
                <li>住房租金：直辖市/省会 1500元/月，其他 800~1100元</li>
                <li>继续教育：学历 400元/月，职业资格 3600元/年</li>
              </ul>
            </div>
          )}

          {/* 五险一金比例/金额切换 */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">五险一金设置</span>
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setAutoInsurance(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    autoInsurance ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  按常规比例
                </button>
                <button
                  onClick={() => setAutoInsurance(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    !autoInsurance ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  自定义金额
                </button>
              </div>
            </div>

            {autoInsurance ? (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1">个人社保比例</div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={socialRate}
                      onChange={(e) => setSocialRate(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1">公积金比例</div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={fundRate}
                      onChange={(e) => setFundRate(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1">个人社保金额</div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customSocial}
                      onChange={(e) => setCustomSocial(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-400 font-bold">元</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1">公积金金额</div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customFund}
                      onChange={(e) => setCustomFund(e.target.value)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-400 font-bold">元</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 结果展示卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-100 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                月度税后到手工资
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
                ¥{result.monthlyNet.toFixed(2)}
              </span>
              <span className="text-xs text-emerald-200">/ 月</span>
            </div>

            {/* 扣除明细三格 */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-emerald-200 font-bold mb-0.5">个人所得税</div>
                <div className="text-xs font-black text-amber-200">
                  ¥{result.monthlyTax.toFixed(2)}
                </div>
                <div className="text-[9px] text-emerald-100 mt-0.5">
                  税率 {(result.taxRate * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-emerald-200 font-bold mb-0.5">五险一金扣除</div>
                <div className="text-xs font-black">
                  ¥{result.totalInsurance.toFixed(2)}
                </div>
                <div className="text-[9px] text-emerald-100 mt-0.5">
                  社保+公积金
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-emerald-200 font-bold mb-0.5">年度税后总额</div>
                <div className="text-xs font-black">
                  ¥{(result.annualNet / 10000).toFixed(2)} 万
                </div>
                <div className="text-[9px] text-emerald-100 mt-0.5">
                  按12个月折算
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与提示 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>依据国家个人所得税法 5000 元综合所得预扣预缴标准</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>
      </main>
    </div>
  );
}
