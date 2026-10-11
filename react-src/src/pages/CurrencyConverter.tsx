import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, ArrowRightLeft, DollarSign, HelpCircle, Globe } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  rateToCNY: number; // 1 单位外币兑人民币 (参考基准中间价)
}

const DEFAULT_CURRENCIES: CurrencyItem[] = [
  { code: 'CNY', name: '人民币', symbol: '¥', rateToCNY: 1.0 },
  { code: 'USD', name: '美元', symbol: '$', rateToCNY: 7.24 },
  { code: 'EUR', name: '欧元', symbol: '€', rateToCNY: 7.85 },
  { code: 'JPY', name: '日元', symbol: '円', rateToCNY: 0.0475 },
  { code: 'HKD', name: '港币', symbol: 'HK$', rateToCNY: 0.925 },
  { code: 'GBP', name: '英镑', symbol: '£', rateToCNY: 9.38 },
  { code: 'KRW', name: '韩元', symbol: '₩', rateToCNY: 0.0052 },
  { code: 'AUD', name: '澳元', symbol: 'A$', rateToCNY: 4.68 },
];

export default function CurrencyConverter() {
  const navigate = useNavigate();
  const { speakText } = useAudio();
  const isTab = useIsCurrentTab('/currency-converter');

  const [fromCode, setFromCode] = useState<string>('USD');
  const [toCode, setToCode] = useState<string>('CNY');
  const [amount, setAmount] = useState<string>('100');

  // 计算换算结果
  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return null;

    const fromCurr = DEFAULT_CURRENCIES.find((c) => c.code === fromCode) || DEFAULT_CURRENCIES[1];
    const toCurr = DEFAULT_CURRENCIES.find((c) => c.code === toCode) || DEFAULT_CURRENCIES[0];

    // 折算为 CNY 后再折算为目标货币
    const amountInCNY = val * fromCurr.rateToCNY;
    const converted = amountInCNY / toCurr.rateToCNY;

    // 汇率比值 (1 from = ? to)
    const directRate = fromCurr.rateToCNY / toCurr.rateToCNY;

    return {
      fromCurr,
      toCurr,
      converted: parseFloat(converted.toFixed(2)),
      directRate: parseFloat(directRate.toFixed(4)),
    };
  }, [fromCode, toCode, amount]);

  // 互换货币
  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleSpeak = () => {
    if (!result) return;
    const text = `${amount} ${result.fromCurr.name}，约等于 ${result.converted} ${result.toCurr.name}。`;
    speakText(text);
  };

  const handleReset = () => {
    setFromCode('USD');
    setToCode('CNY');
    setAmount('100');
  };

  return (
    <div className={`min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-12'}`}>
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
        <AppPageHeader
          title="主流汇率换算"
          onBack={isTab ? undefined : () => navigate(-1)}
          showBack={!isTab}
        />

        <main className="flex-1 w-full space-y-4">
        {/* 输入与币种选择卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          {/* 原币种与输入金额 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>兑换金额</span>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700"
              >
                {DEFAULT_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="请输入金额"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {fromCode}
              </span>
            </div>
          </div>

          {/* 币种互换按钮 */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwap}
              className="p-2 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 border border-slate-200 shadow-sm active:scale-95 transition-all"
              title="互换币种"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* 目标币种 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>换算目标币种</span>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700"
              >
                {DEFAULT_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 换算结果卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                折算到 {result.toCurr.name}
              </span>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title="语音朗读换算结果"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight">
                {result.toCurr.symbol} {result.converted.toLocaleString()}
              </span>
              <span className="text-xs text-indigo-200 font-bold">{result.toCurr.code}</span>
            </div>

            <div className="text-xs text-indigo-100 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              参考汇率：1 {result.fromCurr.code} = {result.directRate} {result.toCurr.code}
            </div>

            {/* 常见多币种一览列表 */}
            <div className="pt-2 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
              {DEFAULT_CURRENCIES.filter((c) => c.code !== fromCode).slice(0, 4).map((c) => {
                const subConverted = ((parseFloat(amount) || 0) * result.fromCurr.rateToCNY) / c.rateToCNY;
                return (
                  <div key={c.code} className="bg-white/10 p-2 rounded-xl flex justify-between items-center">
                    <span className="text-[11px] text-indigo-200">{c.name}:</span>
                    <span className="font-extrabold">{c.symbol} {subConverted.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>依据各大银行标准中间价估算，实际成交以银行柜台牌价为准</span>
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
