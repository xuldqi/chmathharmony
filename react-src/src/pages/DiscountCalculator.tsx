import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Tag, Percent } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function DiscountCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [originalPrice, setOriginalPrice] = useState<string>('299');
  const [discountType, setDiscountType] = useState<'rate' | 'percent'>('rate'); // 折扣(如8.5折) 或 百分比立减(如20% off)
  const [discountVal, setDiscountVal] = useState<string>('8.5'); // 8.5折
  const [percentVal, setPercentVal] = useState<string>('15'); // 15% off
  const [extraReduction, setExtraReduction] = useState<string>('0'); // 额外满减/优惠券

  const compute = () => {
    const origin = parseFloat(originalPrice);
    if (isNaN(origin) || origin < 0) return null;

    let discounted = origin;
    if (discountType === 'rate') {
      const rate = parseFloat(discountVal);
      if (!isNaN(rate) && rate > 0) {
        discounted = origin * (rate / 10);
      }
    } else {
      const pct = parseFloat(percentVal);
      if (!isNaN(pct) && pct >= 0 && pct <= 100) {
        discounted = origin * (1 - pct / 100);
      }
    }

    const coupon = parseFloat(extraReduction) || 0;
    const finalPrice = Math.max(discounted - coupon, 0);
    const savedAmount = Math.max(origin - finalPrice, 0);

    return {
      finalPrice: finalPrice.toFixed(2).replace(/\.?0+$/, ''),
      savedAmount: savedAmount.toFixed(2).replace(/\.?0+$/, ''),
    };
  };

  const res = compute();

  const handleSpeak = () => {
    if (!res) return;
    speakText(`原价${originalPrice}元，折后价格${res.finalPrice}元，立省${res.savedAmount}元`);
  };

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="折扣计算器" onBack={() => navigate(-1)} />

        {/* 输入区 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-black text-slate-500">原价 (元)</span>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-xl font-black text-slate-800 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500">折扣方式</span>
              <div className="flex bg-slate-100 p-0.5 rounded-xl">
                <button
                  onClick={() => setDiscountType('rate')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    discountType === 'rate'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  几折 (如 8.5折)
                </button>
                <button
                  onClick={() => setDiscountType('percent')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    discountType === 'percent'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  减免 % (如 15% off)
                </button>
              </div>
            </div>

            {discountType === 'rate' ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-lg font-black text-slate-800 outline-none focus:border-purple-500"
                />
                <span className="text-base font-black text-slate-700">折</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={percentVal}
                  onChange={(e) => setPercentVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-lg font-black text-slate-800 outline-none focus:border-purple-500"
                />
                <span className="text-base font-black text-slate-700">% 减免</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-black text-slate-500">叠加满减 / 优惠券 (元)</span>
            <input
              type="number"
              value={extraReduction}
              onChange={(e) => setExtraReduction(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-lg font-black text-slate-800 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* 结果区 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-500">计算结果</span>
            {res && (
              <button
                onClick={handleSpeak}
                className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black hover:bg-purple-200 active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" /> 语音播报
              </button>
            )}
          </div>

          {res ? (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-600">最终到手价：</span>
                <span className="text-3xl font-black text-emerald-600">
                  ¥ {res.finalPrice}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-emerald-200/60">
                <span className="text-xs font-bold text-slate-500">为您立省金额：</span>
                <span className="text-lg font-black text-red-500">
                  - ¥ {res.savedAmount}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400 font-bold text-sm">
              请输入有效原价与折扣数值
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
