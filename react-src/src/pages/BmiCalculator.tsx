import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Activity, HelpCircle, HeartPulse, Info } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

export default function BmiCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 身高 (cm) 与 体重 (kg)
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(65);

  // 性别与年龄
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);

  // 计算结果
  const result = useMemo(() => {
    const hMeter = heightCm / 100;
    if (hMeter <= 0 || weightKg <= 0) return null;

    const bmi = weightKg / (hMeter * hMeter);
    const idealLow = 18.5 * hMeter * hMeter;
    const idealHigh = 23.9 * hMeter * hMeter;

    // 中国标准 BMI 判定
    let category = '正常';
    let colorClass = 'text-emerald-500';
    let bgBadge = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    let desc = '身材标准，请继续保持健康饮食与规律运动！';

    if (bmi < 18.5) {
      category = '偏瘦';
      colorClass = 'text-blue-500';
      bgBadge = 'bg-blue-50 text-blue-600 border-blue-200';
      desc = '体重偏低，建议适当增加优质蛋白与能量摄入。';
    } else if (bmi >= 24 && bmi < 28) {
      category = '超重';
      colorClass = 'text-amber-500';
      bgBadge = 'bg-amber-50 text-amber-600 border-amber-200';
      desc = '体重略有超重，建议减少油腻甜食，增加有氧锻炼。';
    } else if (bmi >= 28) {
      category = '肥胖';
      colorClass = 'text-rose-500';
      bgBadge = 'bg-rose-50 text-rose-600 border-rose-200';
      desc = '处于肥胖区间，建议制定减脂计划，注意心血管健康。';
    }

    // 基础代谢率 (Mifflin-St Jeor 公式)
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += sex === 'male' ? 5 : -161;

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      colorClass,
      bgBadge,
      desc,
      idealLow: parseFloat(idealLow.toFixed(1)),
      idealHigh: parseFloat(idealHigh.toFixed(1)),
      bmr: Math.round(bmr),
    };
  }, [heightCm, weightKg, sex, age]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `你的 BMI 值为 ${result.bmi}，体型处于${result.category}状态。理想体重范围为 ${result.idealLow} 到 ${result.idealHigh} 公斤，每日基础代谢约为 ${result.bmr} 大卡。`;
    speakText(text);
  };

  const handleReset = () => {
    setHeightCm(170);
    setWeightKg(65);
    setSex('male');
    setAge(25);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="BMI 健康计算器" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 顶部性别与年龄 */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-xs font-bold text-slate-500">生理性别:</span>
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

          <div className="flex items-center gap-1.5 pr-2">
            <span className="text-xs font-bold text-slate-500">年龄:</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 text-center bg-slate-100 px-2 py-1 rounded-xl text-xs font-bold text-slate-700"
            />
            <span className="text-xs font-bold text-slate-400">岁</span>
          </div>
        </div>

        {/* 核心 BMI 仪表卡片 */}
        {result && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-emerald-500" />
                身体质量指数 (BMI)
              </span>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
                title="语音朗读结果"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              <div className={`text-5xl font-black tracking-tight ${result.colorClass}`}>
                {result.bmi}
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold border ${result.bgBadge}`}
                >
                  {result.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed px-4">{result.desc}</p>

            {/* 理想体重与代谢两格 */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold mb-0.5">标准健康体重</div>
                <div className="text-xs font-extrabold text-slate-700">
                  {result.idealLow} ~ {result.idealHigh} kg
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold mb-0.5">基础代谢率 (BMR)</div>
                <div className="text-xs font-extrabold text-emerald-600">
                  {result.bmr} kcal/天
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 身高体重滑块与输入调节 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          {/* 身高 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>身高 (Height)</span>
              <span className="text-sm font-extrabold text-emerald-600">{heightCm} cm</span>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>100 cm</span>
              <span>160 cm</span>
              <span>180 cm</span>
              <span>220 cm</span>
            </div>
          </div>

          {/* 体重 */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>体重 (Weight)</span>
              <span className="text-sm font-extrabold text-emerald-600">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>30 kg</span>
              <span>60 kg</span>
              <span>90 kg</span>
              <span>150 kg</span>
            </div>
          </div>
        </div>

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>参考中国国家卫生健康委员会成人体重判定标准</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
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
