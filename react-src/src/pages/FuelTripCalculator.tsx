import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { Volume2, RotateCcw, Car, Fuel, DollarSign, Users, ChevronRight } from 'lucide-react';

export default function FuelTripCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 行程输入
  const [distance, setDistance] = useState<string>('300'); // 公里
  const [fuelConsumption, setFuelConsumption] = useState<string>('7.2'); // L / 100km
  const [oilPrice, setOilPrice] = useState<string>('7.85'); // 元 / L
  const [tollFee, setTollFee] = useState<string>('120'); // 过路费 元
  const [passengerCount, setPassengerCount] = useState<number>(3); // 拼车人数
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false); // 是否往返

  const calcResult = useMemo(() => {
    let d = parseFloat(distance) || 0;
    if (isRoundTrip) d *= 2;

    const consumptionPer100 = parseFloat(fuelConsumption) || 0;
    const pricePerL = parseFloat(oilPrice) || 0;
    let toll = parseFloat(tollFee) || 0;
    if (isRoundTrip) toll *= 2;

    const passengers = Math.max(1, passengerCount);

    if (d <= 0 || consumptionPer100 <= 0 || pricePerL <= 0) {
      return null;
    }

    // 总耗油量 L
    const totalFuelLiters = (d / 100) * consumptionPer100;
    // 总油费
    const totalFuelCost = totalFuelLiters * pricePerL;
    // 综合总费用 (油费 + 过路费)
    const grandTotal = totalFuelCost + toll;
    // 每公里综合成本
    const costPerKm = grandTotal / d;
    // 人均 AA 费用
    const costPerPerson = grandTotal / passengers;

    return {
      actualDistance: d,
      totalFuelLiters,
      totalFuelCost,
      toll,
      grandTotal,
      costPerKm,
      costPerPerson,
      passengers,
    };
  }, [distance, fuelConsumption, oilPrice, tollFee, passengerCount, isRoundTrip]);

  const handleVoiceReport = () => {
    if (!calcResult) {
      speakText('请输入有效的里程与油耗数据');
      return;
    }
    const total = calcResult.grandTotal.toFixed(1);
    const perPerson = calcResult.costPerPerson.toFixed(1);
    const perKm = calcResult.costPerKm.toFixed(2);
    if (calcResult.passengers > 1) {
      speakText(`本次行程总费用约 ${total} 元，每公里约 ${perKm} 元，${calcResult.passengers} 人拼车人均需分摊约 ${perPerson} 元。`);
    } else {
      speakText(`本次行程总费用约 ${total} 元，其中油费 ${calcResult.totalFuelCost.toFixed(1)} 元，每公里综合成本约 ${perKm} 元。`);
    }
  };

  const handleReset = () => {
    setDistance('300');
    setFuelConsumption('7.2');
    setOilPrice('7.85');
    setTollFee('120');
    setPassengerCount(3);
    setIsRoundTrip(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col">
      <AppPageHeader
        title="油耗与出行成本计算"
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
        {/* 核心结论卡片 */}
        {calcResult && (
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-emerald-100 font-medium">行程综合总开销</div>
                <div className="text-3xl font-extrabold mt-1 tracking-tight">
                  {calcResult.grandTotal.toFixed(1)}
                  <span className="text-sm font-normal ml-1">元</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-200">每公里成本</span>
                <div className="text-xl font-bold mt-0.5">
                  {calcResult.costPerKm.toFixed(2)} <span className="text-xs font-normal">元/km</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-xs">
              <div>
                <span className="text-emerald-200">燃油总花费</span>
                <p className="font-semibold text-sm mt-0.5">
                  {calcResult.totalFuelCost.toFixed(1)} 元
                </p>
                <p className="text-[10px] text-emerald-100 mt-0.5">
                  约 {calcResult.totalFuelLiters.toFixed(1)} 升
                </p>
              </div>
              <div>
                <span className="text-emerald-200">高速过路费</span>
                <p className="font-semibold text-sm mt-0.5">
                  {calcResult.toll.toFixed(1)} 元
                </p>
                <p className="text-[10px] text-emerald-100 mt-0.5">
                  {isRoundTrip ? '含往返' : '单程'}
                </p>
              </div>
              <div>
                <span className="text-emerald-200">人均 AA 分摊</span>
                <p className="font-semibold text-sm mt-0.5 text-amber-200">
                  {calcResult.costPerPerson.toFixed(1)} 元
                </p>
                <p className="text-[10px] text-emerald-100 mt-0.5">
                  共 {calcResult.passengers} 人
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 里程与往返切换 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">行程里程</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setIsRoundTrip(false)}
                className={`px-3 py-1 rounded-md transition-all ${
                  !isRoundTrip
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                单程
              </button>
              <button
                onClick={() => setIsRoundTrip(true)}
                className={`px-3 py-1 rounded-md transition-all ${
                  isRoundTrip
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                往返双程
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">单程里程 (公里 km)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">单程过路费 (元)</label>
              <input
                type="number"
                value={tollFee}
                onChange={(e) => setTollFee(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 油耗与油价设定 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">车辆油耗与油价</div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">百公里油耗 (L/100km)</label>
              <div className="flex gap-1">
                {[
                  { label: '混动 4.5', val: '4.5' },
                  { label: '轿车 6.8', val: '6.8' },
                  { label: 'SUV 8.5', val: '8.5' },
                  { label: '拥堵 10.0', val: '10.0' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setFuelConsumption(item.val)}
                    className="px-1.5 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              step="0.1"
              value={fuelConsumption}
              onChange={(e) => setFuelConsumption(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">当前油价 (元/升)</label>
              <div className="flex gap-1">
                {[
                  { label: '92号 7.85', val: '7.85' },
                  { label: '95号 8.35', val: '8.35' },
                  { label: '柴油 7.45', val: '7.45' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setOilPrice(item.val)}
                    className="px-1.5 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              step="0.05"
              value={oilPrice}
              onChange={(e) => setOilPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">出行人数 (AA分摊)</label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setPassengerCount(cnt)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    passengerCount === cnt
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cnt === 1 ? '单人自驾' : `${cnt}人拼车`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
