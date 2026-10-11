import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function BankDepositCalculator() {
  const navigate = useNavigate();

  const [principal, setPrincipal] = useState<string>('50000'); // 存款本金
  const [depositType, setDepositType] = useState<'lump' | 'demand' | 'large'>('lump'); // 整存整取 / 活期 / 大额存单
  const [termMonths, setTermMonths] = useState<number>(12); // 存期（月）
  const [customRate, setCustomRate] = useState<string>('1.75'); // 年化利率 %

  // 快捷基准利率配置 (央行基准/大行常见挂牌)
  const RATES: Record<string, Record<number, number>> = {
    lump: {
      3: 1.15,
      6: 1.35,
      12: 1.45,
      24: 1.65,
      36: 1.95,
      60: 2.00,
    },
    large: {
      12: 1.80,
      24: 2.00,
      36: 2.35,
      60: 2.40,
    },
    demand: {
      12: 0.20,
    },
  };

  const handleTypeChange = (type: 'lump' | 'demand' | 'large') => {
    setDepositType(type);
    if (type === 'demand') {
      setTermMonths(12);
      setCustomRate('0.20');
    } else if (type === 'large') {
      setTermMonths(36);
      setCustomRate('2.35');
    } else {
      setTermMonths(12);
      setCustomRate('1.45');
    }
  };

  const handleTermChange = (months: number) => {
    setTermMonths(months);
    const suggestedRate = RATES[depositType]?.[months];
    if (suggestedRate) {
      setCustomRate(suggestedRate.toString());
    }
  };

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(customRate) || 0) / 100;
  const years = termMonths / 12;

  // 单利利息与本息和
  const totalInterest = p * r * years;
  const totalAmount = p + totalInterest;

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="银行存款定期利息" onBack={() => navigate(-1)} />

        {/* 存款类型切换 */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
          <button
            type="button"
            onClick={() => handleTypeChange('lump')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              depositType === 'lump' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            整存整取
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('large')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              depositType === 'large' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            大额存单
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('demand')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              depositType === 'demand' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            活期存款
          </button>
        </div>

        {/* 参数表单 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">存款本金 (元)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="请输入存款金额"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* 存期选择 */}
          {depositType !== 'demand' && (
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">选择存期</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ...(depositType === 'lump' ? [{ m: 3, label: '3个月' }, { m: 6, label: '半年' }] : []),
                  { m: 12, label: '1年' },
                  { m: 24, label: '2年' },
                  { m: 36, label: '3年' },
                  { m: 60, label: '5年' },
                ].map((item) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => handleTermChange(item.m)}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      termMonths === item.m
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500">年化存款利率 (%)</label>
              <span className="text-[11px] text-indigo-600 font-semibold">支持自由微调</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 收益计算结果展示 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">到期收益测算</span>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500">到期累计利息</span>
            <span className="text-3xl font-black text-indigo-600 mt-1">
              +¥{totalInterest.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              本息合计：¥{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400">平均月收益</span>
              <span className="text-sm font-black text-slate-800 mt-0.5">
                ¥{(totalInterest / termMonths).toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400">平均日利息</span>
              <span className="text-sm font-black text-slate-800 mt-0.5">
                ¥{(totalInterest / (termMonths * 30)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
