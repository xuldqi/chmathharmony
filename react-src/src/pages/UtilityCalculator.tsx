import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Zap, Droplets, Flame, HelpCircle, Layers } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

type UtilityType = 'electricity' | 'water' | 'gas';

export default function UtilityCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 类别
  const [utilityType, setUtilityType] = useState<UtilityType>('electricity');
  // 用量
  const [usage, setUsage] = useState<string>('280');

  // 计算逻辑
  const result = useMemo(() => {
    const val = parseFloat(usage) || 0;
    if (val <= 0) return null;

    let tier1Usage = 0;
    let tier2Usage = 0;
    let tier3Usage = 0;
    let tier1Cost = 0;
    let tier2Cost = 0;
    let tier3Cost = 0;
    let totalCost = 0;
    let currentTier = 1;
    let unit = '度';

    if (utilityType === 'electricity') {
      unit = '度';
      // 常见居民三档电价：1档0-240度(0.5283元), 2档241-400度(0.5783元), 3档400度以上(0.8283元)
      const p1 = 0.5283;
      const p2 = 0.5783;
      const p3 = 0.8283;

      if (val <= 240) {
        tier1Usage = val;
        tier1Cost = tier1Usage * p1;
        currentTier = 1;
      } else if (val <= 400) {
        tier1Usage = 240;
        tier2Usage = val - 240;
        tier1Cost = tier1Usage * p1;
        tier2Cost = tier2Usage * p2;
        currentTier = 2;
      } else {
        tier1Usage = 240;
        tier2Usage = 160;
        tier3Usage = val - 400;
        tier1Cost = tier1Usage * p1;
        tier2Cost = tier2Usage * p2;
        tier3Cost = tier3Usage * p3;
        currentTier = 3;
      }
      totalCost = tier1Cost + tier2Cost + tier3Cost;
    } else if (utilityType === 'water') {
      unit = '吨(m³)';
      // 居民阶梯水费：1档0-20吨(3.5元), 2档21-30吨(5.25元), 3档30吨以上(7.0元)
      const p1 = 3.5;
      const p2 = 5.25;
      const p3 = 7.0;

      if (val <= 20) {
        tier1Usage = val;
        tier1Cost = tier1Usage * p1;
        currentTier = 1;
      } else if (val <= 30) {
        tier1Usage = 20;
        tier2Usage = val - 20;
        tier1Cost = tier1Usage * p1;
        tier2Cost = tier2Usage * p2;
        currentTier = 2;
      } else {
        tier1Usage = 20;
        tier2Usage = 10;
        tier3Usage = val - 30;
        tier1Cost = tier1Usage * p1;
        tier2Cost = tier2Usage * p2;
        tier3Cost = tier3Usage * p3;
        currentTier = 3;
      }
      totalCost = tier1Cost + tier2Cost + tier3Cost;
    } else {
      unit = '立方米(m³)';
      // 居民阶梯燃气：1档0-30m³(2.8元), 2档31-50m³(3.36元), 3档50m³以上(4.2元)
      const p1 = 2.8;
      const p2 = 3.36;
      const p3 = 4.2;

      if (val <= 30) {
        tier1Usage = val;
        tier1Cost = tier1Usage * p1;
        currentTier = 1;
      } else if (val <= 50) {
        tier1Usage = 30;
        tier2Usage = val - 30;
        tier1Cost = tier1Usage * p1;
        tier2Cost = tier2Usage * p2;
        currentTier = 2;
      } else {
        tier1Usage = 30;
        tier2Usage = 20;
        tier3Usage = val - 50;
        tier1Cost = tier1Usage * p1;
        tier2Cost = tier2Usage * p2;
        tier3Cost = tier3Usage * p3;
        currentTier = 3;
      }
      totalCost = tier1Cost + tier2Cost + tier3Cost;
    }

    return {
      val,
      unit,
      currentTier,
      totalCost: parseFloat(totalCost.toFixed(2)),
      tier1Usage: parseFloat(tier1Usage.toFixed(1)),
      tier2Usage: parseFloat(tier2Usage.toFixed(1)),
      tier3Usage: parseFloat(tier3Usage.toFixed(1)),
      tier1Cost: parseFloat(tier1Cost.toFixed(1)),
      tier2Cost: parseFloat(tier2Cost.toFixed(1)),
      tier3Cost: parseFloat(tier3Cost.toFixed(1)),
    };
  }, [utilityType, usage]);

  const handleSpeak = () => {
    if (!result) return;
    const typeName = utilityType === 'electricity' ? '用电' : utilityType === 'water' ? '用水' : '用气';
    const text = `本月${typeName}${result.val}${result.unit}，费用合计${result.totalCost}元，已跨入第${result.currentTier}档阶梯。`;
    speakText(text);
  };

  const handleReset = () => {
    setUtilityType('electricity');
    setUsage('280');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="阶梯水电燃气计算" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 顶部类别切换 */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
          {[
            { id: 'electricity', label: '阶梯电费', defaultVal: '280' },
            { id: 'water', label: '�阶梯水费', defaultVal: '25' },
            { id: 'gas', label: '�阶梯燃气', defaultVal: '35' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setUtilityType(item.id as UtilityType);
                setUsage(item.defaultVal);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                utilityType === item.id
                  ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-300/40'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 用量输入卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>
              {utilityType === 'electricity'
                ? '本月累计用电量'
                : utilityType === 'water'
                ? '本月累计用水量'
                : '本月累计用气量'}
            </span>
            <span className="text-amber-600 font-extrabold text-xs">
              {result ? `第 ${result.currentTier} 档阶梯计费` : ''}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder="请输入用量数值"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {result ? result.unit : '度'}
            </span>
          </div>
        </div>

        {/* 费用结果卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-amber-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                本月费用总计
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
              <span className="text-4xl font-black tracking-tight">¥{result.totalCost}</span>
              <span className="text-xs text-amber-100 font-bold">元</span>
            </div>

            <div className="text-xs text-white/95 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              当前阶梯档位：第 {result.currentTier} 档 (总消耗 {result.val} {result.unit})
            </div>

            {/* 三档明细一览 */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">一档用量</div>
                <div className="text-xs font-black">¥{result.tier1Cost}</div>
                <div className="text-[9px] text-amber-200 mt-0.5">{result.tier1Usage}{result.unit}</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">二档用量</div>
                <div className="text-xs font-black">¥{result.tier2Cost}</div>
                <div className="text-[9px] text-amber-200 mt-0.5">{result.tier2Usage}{result.unit}</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-amber-100 font-bold mb-0.5">三档用量</div>
                <div className="text-xs font-black">¥{result.tier3Cost}</div>
                <div className="text-[9px] text-amber-200 mt-0.5">{result.tier3Usage}{result.unit}</div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>参考中国国家电网及各省居民阶梯价格基准政策执行</span>
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
