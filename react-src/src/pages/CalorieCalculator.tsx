import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Flame, HelpCircle, Utensils, Target } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

type GoalType = 'lose' | 'maintain' | 'gain';

export default function CalorieCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 基本指标
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(26);
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(68);

  // 日常活动水平 (运动系数)
  const [activityFactor, setActivityFactor] = useState<number>(1.375);

  // 健身目标
  const [goal, setGoal] = useState<GoalType>('lose');

  // 计算逻辑 (Mifflin-St Jeor 公式)
  const result = useMemo(() => {
    if (weightKg <= 0 || heightCm <= 0 || age <= 0) return null;

    // 基础代谢 BMR
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += sex === 'male' ? 5 : -161;

    // 每日总消耗 TDEE
    const tdee = Math.round(bmr * activityFactor);

    // 目标热量
    let targetCalories = tdee;
    if (goal === 'lose') {
      targetCalories = Math.max(Math.round(bmr), tdee - 450); // 创造约 450 kcal 缺口，不低于 BMR
    } else if (goal === 'gain') {
      targetCalories = tdee + 350; // 增肌热量盈余 350 kcal
    }

    // 三大营养素推荐 (蛋白质按 1.8g/kg，脂肪占 25%，碳水占剩余)
    const proteinGrams = Math.round(weightKg * 1.8);
    const proteinCalories = proteinGrams * 4;

    const fatCalories = Math.round(targetCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);

    const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
    const carbGrams = Math.round(carbCalories / 4);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      proteinGrams,
      fatGrams,
      carbGrams,
    };
  }, [sex, age, heightCm, weightKg, activityFactor, goal]);

  const handleSpeak = () => {
    if (!result) return;
    const goalText = goal === 'lose' ? '减脂' : goal === 'gain' ? '增肌' : '维持体重';
    const text = `您的每日总消耗热量为${result.tdee}大卡。${goalText}目标下，建议每日摄入${result.targetCalories}大卡，包含蛋白质${result.proteinGrams}克，碳水化合物${result.carbGrams}克，脂肪${result.fatGrams}克。`;
    speakText(text);
  };

  const handleReset = () => {
    setSex('male');
    setAge(26);
    setHeightCm(172);
    setWeightKg(68);
    setActivityFactor(1.375);
    setGoal('lose');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="热量与卡路里计算" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 基本身体数据卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">生理性别</span>
            <div className="flex bg-slate-100 p-0.5 rounded-xl">
              <button
                onClick={() => setSex('male')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sex === 'male' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                男
              </button>
              <button
                onClick={() => setSex('female')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sex === 'female' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                女
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 mb-1">年龄</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 font-bold">岁</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 mb-1">身高</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 font-bold">cm</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 mb-1">体重</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 font-bold">kg</span>
              </div>
            </div>
          </div>

          {/* 活动强度 */}
          <div className="pt-1">
            <div className="text-xs font-bold text-slate-600 mb-1.5">日常活动与运动频率</div>
            <select
              value={activityFactor}
              onChange={(e) => setActivityFactor(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value={1.2}>久坐少动 (几乎不运动)</option>
              <option value={1.375}>轻度活动 (每周运动 1-3 天)</option>
              <option value={1.55}>中度活动 (每周运动 3-5 天)</option>
              <option value={1.725}>高强度运动 (每周运动 6-7 天)</option>
            </select>
          </div>

          {/* 目标切换 */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-600 mb-2">我的目标</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose', label: '减脂热量缺口' },
                { id: 'maintain', label: '保持体重' },
                { id: 'gain', label: '增肌热量盈余' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGoal(item.id as GoalType)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    goal === item.id
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 结果展示卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-5 text-white shadow-lg shadow-rose-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-100 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                建议每日摄入热量
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
              <span className="text-4xl font-black tracking-tight">{result.targetCalories}</span>
              <span className="text-xs text-rose-100 font-bold">kcal / 天</span>
            </div>

            <div className="text-xs text-white/95 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              总消耗 TDEE: {result.tdee} kcal ｜ 基础代谢 BMR: {result.bmr} kcal
            </div>

            {/* 三大营养素推荐 */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-rose-100 font-bold mb-0.5">优质蛋白</div>
                <div className="text-sm font-black">{result.proteinGrams} g</div>
                <div className="text-[9px] text-rose-200 mt-0.5">肉蛋奶鱼</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-rose-100 font-bold mb-0.5">碳水化合物</div>
                <div className="text-sm font-black text-amber-200">{result.carbGrams} g</div>
                <div className="text-[9px] text-rose-200 mt-0.5">米面粗粮</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-rose-100 font-bold mb-0.5">健康脂肪</div>
                <div className="text-sm font-black">{result.fatGrams} g</div>
                <div className="text-[9px] text-rose-200 mt-0.5">坚果植物油</div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>依据运动生理学 Mifflin-St Jeor 能量代谢公式制定</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800"
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
