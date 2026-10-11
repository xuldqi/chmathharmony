import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function PediatricDosageCalculator() {
  const navigate = useNavigate();

  const [weightKg, setWeightKg] = useState<string>('15'); // 小儿体重 (kg)
  const [ageYears, setAgeYears] = useState<string>('3'); // 小儿年龄 (岁)
  const [adultDose, setAdultDose] = useState<string>('500'); // 成人单次常规剂量 (mg)

  const w = parseFloat(weightKg) || 0;
  const a = parseFloat(ageYears) || 0;
  const adult = parseFloat(adultDose) || 0;

  // 1. Clark公式（以体重为准，国际儿科最常用）：
  // 小儿剂量 = 成人剂量 × (小儿体重kg / 70kg)
  const clarkDose = adult > 0 && w > 0 ? (adult * w) / 70 : 0;

  // 2. 体表面积公式（精确法，常用于抗生素及输液）：
  // 体表面积 S(m²) = 0.035 × 体重 + 0.1 (体重<=30kg)
  // 小儿剂量 = 成人剂量 × (小儿体表面积 / 1.73m²)
  const bsa = w <= 30 ? 0.035 * w + 0.1 : 0.02 * w + 0.55;
  const bsaDose = adult > 0 && w > 0 ? (adult * bsa) / 1.73 : 0;

  // 3. Young公式（以年龄为准参考）：
  // 小儿剂量 = 成人剂量 × [年龄 / (年龄 + 12)]
  const youngDose = adult > 0 && a > 0 ? (adult * a) / (a + 12) : 0;

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="小儿用药剂量折算" onBack={() => navigate(-1)} />

        {/* 输入参数 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">小儿体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">小儿年龄 (周岁)</label>
              <input
                type="number"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500">成人单次常规剂量 (mg 或 片/ml)</label>
              <span className="text-[10px] text-slate-400">见药品说明书标示</span>
            </div>
            <input
              type="number"
              value={adultDose}
              onChange={(e) => setAdultDose(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 剂量测算结果 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <span className="text-sm font-black text-slate-700">参考折算剂量</span>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500">推荐小儿单次参考剂量 (按体重Clark法)</span>
            <span className="text-3xl font-black text-indigo-700 mt-1">
              {clarkDose.toFixed(1)} mg
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              约占成人常规剂量的 {((clarkDose / (adult || 1)) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400">体表面积法(精密)</span>
              <span className="text-sm font-black text-slate-800 mt-0.5">
                {bsaDose.toFixed(1)} mg
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400">年龄折算法(Young法)</span>
              <span className="text-sm font-black text-slate-800 mt-0.5">
                {youngDose.toFixed(1)} mg
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed font-medium">
            <span className="font-bold block mb-0.5 text-amber-900">健康安全提示：</span>
            本工具测算结果仅供家长应急参考。小儿肝肾发育未完全，对药物耐受度与成人不同，实际用药请严格遵循专业医生指导或儿科专用说明书。
          </div>
        </div>
      </main>
    </div>
  );
}
