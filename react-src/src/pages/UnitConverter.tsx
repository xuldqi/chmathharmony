import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowRightLeft } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

type CategoryType = 'length' | 'weight' | 'area' | 'temperature';

interface UnitDef {
  name: string;
  factor: number; // 相对基准单位换算率
}

const UNITS: Record<CategoryType, { name: string; base: string; list: UnitDef[] }> = {
  length: {
    name: '长度',
    base: '米 (m)',
    list: [
      { name: '毫米 (mm)', factor: 0.001 },
      { name: '厘米 (cm)', factor: 0.01 },
      { name: '米 (m)', factor: 1 },
      { name: '千米/公里 (km)', factor: 1000 },
      { name: '英寸 (in)', factor: 0.0254 },
      { name: '英尺 (ft)', factor: 0.3048 },
      { name: '市尺', factor: 0.3333333 },
    ],
  },
  weight: {
    name: '重量',
    base: '千克 (kg)',
    list: [
      { name: '毫克 (mg)', factor: 0.000001 },
      { name: '克 (g)', factor: 0.001 },
      { name: '千克/公斤 (kg)', factor: 1 },
      { name: '吨 (t)', factor: 1000 },
      { name: '市斤', factor: 0.5 },
      { name: '市两', factor: 0.05 },
      { name: '磅 (lb)', factor: 0.45359237 },
      { name: '盎司 (oz)', factor: 0.0283495 },
    ],
  },
  area: {
    name: '面积',
    base: '平方米 (m²)',
    list: [
      { name: '平方厘米 (cm²)', factor: 0.0001 },
      { name: '平方米 (m²)', factor: 1 },
      { name: '平方千米 (km²)', factor: 1000000 },
      { name: '公顷 (ha)', factor: 10000 },
      { name: '亩', factor: 666.6667 },
      { name: '平方英尺 (sq ft)', factor: 0.092903 },
    ],
  },
  temperature: {
    name: '温度',
    base: '摄氏度 (°C)',
    list: [
      { name: '摄氏度 (°C)', factor: 1 },
      { name: '华氏度 (°F)', factor: 1 },
      { name: '开氏度 (K)', factor: 1 },
    ],
  },
};

export default function UnitConverter() {
  const navigate = useNavigate();
  const { speakText } = useAudio();
  const isTab = useIsCurrentTab('/unit-converter');

  const [category, setCategory] = useState<CategoryType>('length');
  const [val1, setVal1] = useState<string>('1');
  const [u1, setU1] = useState<number>(2); // 默认米
  const [u2, setU2] = useState<number>(1); // 默认厘米

  const currentCategory = UNITS[category];

  // 换算计算
  const compute = (): string => {
    const input = parseFloat(val1);
    if (isNaN(input)) return '--';

    if (category === 'temperature') {
      // 0: C, 1: F, 2: K
      let cVal = input;
      if (u1 === 1) cVal = (input - 32) / 1.8; // F -> C
      if (u1 === 2) cVal = input - 273.15; // K -> C

      let outVal = cVal;
      if (u2 === 1) outVal = cVal * 1.8 + 32; // C -> F
      if (u2 === 2) outVal = cVal + 273.15; // C -> K

      return outVal.toFixed(2).replace(/\.?0+$/, '');
    }

    const unitFrom = currentCategory.list[u1];
    const unitTo = currentCategory.list[u2];
    if (!unitFrom || !unitTo) return '--';

    const baseVal = input * unitFrom.factor;
    const resultVal = baseVal / unitTo.factor;

    return resultVal.toFixed(4).replace(/\.?0+$/, '');
  };

  const convertedResult = compute();

  const handleSwap = () => {
    const temp = u1;
    setU1(u2);
    setU2(temp);
  };

  const handleSpeak = () => {
    if (convertedResult === '--') return;
    const name1 = currentCategory.list[u1]?.name || '';
    const name2 = currentCategory.list[u2]?.name || '';
    speakText(`${val1} ${name1} 等于 ${convertedResult} ${name2}`);
  };

  const handleCategoryChange = (cat: CategoryType) => {
    setCategory(cat);
    setVal1('1');
    setU1(0);
    setU2(1);
  };

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className={`flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-12'} w-full max-w-md mx-auto flex flex-col gap-4`}>
        <AppPageHeader
          title="单位换算"
          onBack={isTab ? undefined : () => navigate(-1)}
          showBack={!isTab}
        />

        {/* 类别 Tab */}
        <div className="flex bg-white/70 p-1 rounded-2xl gap-1 shadow-sm border border-white">
          {(Object.keys(UNITS) as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                category === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {UNITS[cat].name}
            </button>
          ))}
        </div>

        {/* 换算输入区 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-400">输入数值与单位</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                className="w-1/2 px-3 py-2.5 bg-purple-50 border-2 border-purple-200 rounded-xl text-lg font-black text-slate-800 outline-none focus:border-purple-500"
              />
              <select
                value={u1}
                onChange={(e) => setU1(parseInt(e.target.value, 10))}
                className="w-1/2 px-3 py-3 bg-purple-50 border-2 border-purple-200 rounded-xl text-sm font-black text-slate-700 outline-none focus:border-purple-500"
              >
                {currentCategory.list.map((u, idx) => (
                  <option key={u.name} value={idx}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 切换交换按钮 */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwap}
              className="p-2 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-600 rounded-full active:scale-95 transition-all shadow-sm"
              title="交换单位"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-400">目标单位</span>
            <select
              value={u2}
              onChange={(e) => setU2(parseInt(e.target.value, 10))}
              className="w-full px-3 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-sm font-black text-slate-700 outline-none focus:border-emerald-500"
            >
              {currentCategory.list.map((u, idx) => (
                <option key={u.name} value={idx}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 结果显示 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-500">换算结果</span>
            {convertedResult !== '--' && (
              <button
                onClick={handleSpeak}
                className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black hover:bg-purple-200 active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" /> 语音播报
              </button>
            )}
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-black text-emerald-600 truncate max-w-full">
              {convertedResult}
            </span>
            <span className="text-xs font-black text-emerald-700">
              {currentCategory.list[u2]?.name}
            </span>
          </div>
        </div>
      </main>

      {isTab && <MainTabBar />}
    </div>
  );
}
