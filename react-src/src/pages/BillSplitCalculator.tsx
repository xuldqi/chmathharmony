import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Users, Receipt, HelpCircle, Scissors, Percent } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

type RoundingMode = 'none' | 'round_up' | 'round_down';

export default function BillSplitCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 账单总金额 (元)
  const [billAmount, setBillAmount] = useState<string>('368');
  // 分摊人数
  const [peopleCount, setPeopleCount] = useState<number>(4);
  // 优惠券 / 满减立减 (元)
  const [discountAmount, setDiscountAmount] = useState<string>('30');
  // 额外小费/服务费比例 (%)
  const [tipPercent, setTipPercent] = useState<number>(0);
  // 抹零模式
  const [roundingMode, setRoundingMode] = useState<RoundingMode>('round_up');

  // 计算逻辑
  const result = useMemo(() => {
    const rawBill = parseFloat(billAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const count = peopleCount > 0 ? peopleCount : 1;

    if (rawBill <= 0) return null;

    // 折后金额
    const netBill = Math.max(0, rawBill - discount);
    // 服务费/小费金额
    const tipAmount = netBill * (tipPercent / 100);
    // 应付总金额
    const totalToPay = netBill + tipAmount;

    // 基础人均应付
    let perPersonExact = totalToPay / count;
    let perPersonFinal = perPersonExact;

    if (roundingMode === 'round_up') {
      perPersonFinal = Math.ceil(perPersonExact); // 向上取整到元
    } else if (roundingMode === 'round_down') {
      perPersonFinal = Math.floor(perPersonExact); // 向下抹零到元
    } else {
      perPersonFinal = parseFloat(perPersonExact.toFixed(2));
    }

    // 抹零带来的总额微小偏差
    const actualCollected = perPersonFinal * count;
    const difference = actualCollected - totalToPay;

    return {
      rawBill,
      discount,
      netBill,
      tipAmount,
      totalToPay,
      count,
      perPersonExact,
      perPersonFinal,
      difference,
    };
  }, [billAmount, peopleCount, discountAmount, tipPercent, roundingMode]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `聚餐账单应付总额为${result.totalToPay.toFixed(1)}元，共${result.count}人分摊，每人应付${result.perPersonFinal}元。`;
    speakText(text);
  };

  const handleReset = () => {
    setBillAmount('368');
    setPeopleCount(4);
    setDiscountAmount('30');
    setTipPercent(0);
    setRoundingMode('round_up');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="AA聚餐分账计算器" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 输入面板卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 账单金额 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>消费账单总额</span>
              <span className="text-indigo-600 font-extrabold text-sm">¥{billAmount || '0'}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="请输入账单金额"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                元
              </span>
            </div>
          </div>

          {/* 分摊人数调节 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-700">分摊人数 (AA人数)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-sm active:scale-95 transition-all"
              >
                -
              </button>
              <span className="w-8 text-center text-base font-extrabold text-indigo-600">
                {peopleCount}
              </span>
              <button
                onClick={() => setPeopleCount(peopleCount + 1)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-sm active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* 优惠抵扣与服务费两格 */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">优惠券/立减满减</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-400 font-bold">元</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1">小费/服务费比例</div>
              <div className="flex items-center gap-1">
                <select
                  value={tipPercent}
                  onChange={(e) => setTipPercent(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
                >
                  <option value={0}>无服务费 (0%)</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                </select>
              </div>
            </div>
          </div>

          {/* 抹零取整模式 */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-indigo-500" />
              <span>零钱结算方式</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'round_up', label: '⬆️ 向上取整(元)' },
                { id: 'none', label: '精确到分' },
                { id: 'round_down', label: '⬇️ 向下抹零(元)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoundingMode(item.id as RoundingMode)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    roundingMode === item.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 核心分账卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                每人应付金额 (人均分摊)
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
              <span className="text-4xl font-black tracking-tight">
                ¥{result.perPersonFinal}
              </span>
              <span className="text-xs text-indigo-200 font-bold">/ 人</span>
            </div>

            <div className="text-xs text-indigo-100 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              折后实付总额: ¥{result.totalToPay.toFixed(2)} 元 (已减优惠 ¥{result.discount} 元)
            </div>

            {/* 细节两格 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">精确人均额</div>
                <div className="text-sm font-black">¥{result.perPersonExact.toFixed(2)}</div>
                <div className="text-[9px] text-indigo-200 mt-0.5">未取整前</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">取整差额</div>
                <div className="text-sm font-black text-amber-200">
                  {result.difference > 0 ? `多收 +${result.difference.toFixed(2)}` : result.difference < 0 ? `抹除 ${result.difference.toFixed(2)}` : '无差额'}
                </div>
                <div className="text-[9px] text-indigo-200 mt-0.5">便于转账结算</div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>聚餐聚会账单快速分摊，支持优惠抵扣与整元结算</span>
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
    </div>
  );
}
