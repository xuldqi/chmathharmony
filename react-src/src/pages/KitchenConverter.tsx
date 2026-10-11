import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Utensils, HelpCircle, Thermometer, Scale, Sparkles } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

type ConverterTab = 'mold' | 'capacity' | 'temperature';

export default function KitchenConverter() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [activeTab, setActiveTab] = useState<ConverterTab>('mold');

  // 1. 模具换算 (原模具尺寸 -> 目标模具尺寸，如 6寸 -> 8寸)
  const [fromSize, setFromSize] = useState<number>(6);
  const [toSize, setToSize] = useState<number>(8);

  // 2. 厨房容量与重量换算 (杯/汤匙/茶匙 -> 克)
  // 常见食材密度参考：面粉(1杯=120g), 白糖(1杯=200g), 黄油(1杯=227g), 水/牛奶(1杯=240g/ml)
  const [ingredient, setIngredient] = useState<'flour' | 'sugar' | 'butter' | 'liquid'>('flour');
  const [unitType, setUnitType] = useState<'cup' | 'tbsp' | 'tsp'>('cup');
  const [unitCount, setUnitCount] = useState<string>('1');

  // 3. 烤箱温度换算
  const [tempCelsius, setTempCelsius] = useState<string>('180');

  // 模具换算系数：面积比 = (d2 / d1)^2
  const moldRatio = useMemo(() => {
    if (fromSize <= 0 || toSize <= 0) return 1;
    const ratio = Math.pow(toSize / fromSize, 2);
    return parseFloat(ratio.toFixed(2));
  }, [fromSize, toSize]);

  // 容量转克重计算
  const capacityResult = useMemo(() => {
    const count = parseFloat(unitCount) || 0;
    if (count <= 0) return null;

    // 1杯 (Cup) 基础克重
    const cupWeights = {
      flour: 120,
      sugar: 200,
      butter: 227,
      liquid: 240,
    };

    // 1 Cup = 16 汤匙 (Tbsp) = 48 茶匙 (Tsp)
    const baseCupWeight = cupWeights[ingredient];
    let gramsPerUnit = baseCupWeight;
    if (unitType === 'tbsp') {
      gramsPerUnit = baseCupWeight / 16;
    } else if (unitType === 'tsp') {
      gramsPerUnit = baseCupWeight / 48;
    }

    const totalGrams = count * gramsPerUnit;
    return parseFloat(totalGrams.toFixed(1));
  }, [ingredient, unitType, unitCount]);

  // 温度换算：℉ = ℃ * 1.8 + 32
  const fahrenheit = useMemo(() => {
    const c = parseFloat(tempCelsius) || 0;
    return Math.round(c * 1.8 + 32);
  }, [tempCelsius]);

  const handleSpeak = () => {
    if (activeTab === 'mold') {
      speakText(`${fromSize}寸模具换算为${toSize}寸，所有食材原料需乘以 ${moldRatio} 倍。`);
    } else if (activeTab === 'capacity' && capacityResult !== null) {
      const ingName = ingredient === 'flour' ? '面粉' : ingredient === 'sugar' ? '细砂糖' : ingredient === 'butter' ? '黄油' : '牛奶或水';
      const uName = unitType === 'cup' ? '杯' : unitType === 'tbsp' ? '汤匙' : '茶匙';
      speakText(`${unitCount} ${uName} ${ingName}，约等于 ${capacityResult} 克。`);
    } else if (activeTab === 'temperature') {
      speakText(`摄氏度 ${tempCelsius} 度，相当于华氏度 ${fahrenheit} 度。`);
    }
  };

  const handleReset = () => {
    setFromSize(6);
    setToSize(8);
    setIngredient('flour');
    setUnitType('cup');
    setUnitCount('1');
    setTempCelsius('180');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="厨房与烘焙换算器" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 顶部Tab切换 */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
          {[
            { id: 'mold', label: '蛋糕模具缩放' },
            { id: 'capacity', label: '容量换算克重' },
            { id: 'temperature', label: '烤箱温度℃/℉' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ConverterTab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-300/40'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. 模具尺寸缩放 */}
        {activeTab === 'mold' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="text-xs font-bold text-slate-700">圆模尺寸转换</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1">原配方模具尺寸</div>
                  <select
                    value={fromSize}
                    onChange={(e) => setFromSize(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 12].map((s) => (
                      <option key={s} value={s}>{s} 寸</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1">目标使用模具尺寸</div>
                  <select
                    value={toSize}
                    onChange={(e) => setToSize(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 12].map((s) => (
                      <option key={s} value={s}>{s} 寸</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-200/50 space-y-3 text-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-100">食材配方用量缩放倍数</span>
                <button
                  onClick={handleSpeak}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                  title="语音朗读结果"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2">
                <div className="text-xs text-amber-100 font-extrabold mb-1">原配方各食材统一乘以</div>
                <div className="text-6xl font-black tracking-tight">{moldRatio}</div>
                <div className="text-xs text-amber-100 font-bold mt-1">倍 (RATIO)</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl text-xs font-bold text-white/95">
                示例：若原配方需细砂糖 50g ➔ 换算后需 {Math.round(50 * moldRatio)}g
              </div>
            </div>
          </div>
        )}

        {/* 2. 容量换算克重 */}
        {activeTab === 'capacity' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              {/* 食材选择 */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">选择常用烘焙食材</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'flour', label: '面粉' },
                    { id: 'sugar', label: '白糖' },
                    { id: 'butter', label: '黄油' },
                    { id: 'liquid', label: '牛奶/水' },
                  ].map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => setIngredient(ing.id as any)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ingredient === ing.id
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {ing.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 计量单位与数值 */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1">容量单位</div>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700"
                  >
                    <option value="cup">1 杯 (Cup)</option>
                    <option value="tbsp">1 汤匙 (Tbsp)</option>
                    <option value="tsp">1 茶匙 (Tsp)</option>
                  </select>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1">数量</div>
                  <input
                    type="number"
                    step="0.1"
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {capacityResult !== null && (
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-200/50 space-y-3 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-100">换算实际重量</span>
                  <button
                    onClick={handleSpeak}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                    title="语音朗读结果"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-2">
                  <div className="text-xs text-amber-100 font-extrabold mb-1">约 合</div>
                  <div className="text-6xl font-black tracking-tight">{capacityResult}</div>
                  <div className="text-xs text-amber-100 font-bold mt-1">克 (GRAMS)</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. 烤箱温度换算 */}
        {activeTab === 'temperature' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>烤箱温度 (摄氏度 ℃)</span>
                <span className="text-amber-600 font-extrabold text-sm">{tempCelsius} ℃</span>
              </div>
              <input
                type="number"
                value={tempCelsius}
                onChange={(e) => setTempCelsius(e.target.value)}
                placeholder="例如 180"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-amber-200/50 space-y-3 text-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-100">华氏温度换算结果</span>
                <button
                  onClick={handleSpeak}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                  title="语音朗读结果"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2">
                <div className="text-xs text-amber-100 font-extrabold mb-1">相当于华氏度</div>
                <div className="text-6xl font-black tracking-tight">{fahrenheit}</div>
                <div className="text-xs text-amber-100 font-bold mt-1">℉ (FAHRENHEIT)</div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>做饭烘焙常用换算，告别食材失衡与模具不配</span>
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
