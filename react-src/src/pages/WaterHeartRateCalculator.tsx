import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

export default function WaterHeartRateCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [tab, setTab] = useState<'water' | 'heart'>('water');

  // 饮水量参数
  const [weight, setWeight] = useState<string>('60'); // kg
  const [exerciseMin, setExerciseMin] = useState<string>('30'); // 分钟
  const [isHotWeather, setIsHotWeather] = useState<boolean>(false);

  // 心率参数
  const [age, setAge] = useState<string>('28');
  const [restingHr, setRestingHr] = useState<string>('70'); // 静息心率

  // 饮水量计算
  const waterStats = useMemo(() => {
    const w = parseFloat(weight) || 60;
    const ex = parseFloat(exerciseMin) || 0;
    // 基础饮水 = 体重 * 35ml
    let total = w * 35;
    // 运动加成: 每30分钟 + 350ml
    total += (ex / 30) * 350;
    if (isHotWeather) total += 300;

    const cups = Math.round(total / 250); // 250ml 标准纸杯
    return {
      totalMl: Math.round(total),
      cups,
      schedule: [
        { time: '07:00 晨起温水', ml: 250 },
        { time: '09:30 晨间提神', ml: 300 },
        { time: '11:30 餐前半小时', ml: 250 },
        { time: '14:00 午后解困', ml: 300 },
        { time: '16:30 工间补水', ml: 300 },
        { time: '19:00 晚间补给', ml: 250 },
        { time: '21:00 睡前半小时', ml: 150 },
      ],
    };
  }, [weight, exerciseMin, isHotWeather]);

  // 心率区间计算 (Karvonen 储备心率法)
  const hrStats = useMemo(() => {
    const a = parseInt(age, 10) || 28;
    const rhr = parseInt(restingHr, 10) || 70;
    const maxHr = 220 - a;
    const hrr = maxHr - rhr; // 心率储备

    const fatBurnLow = Math.round(rhr + hrr * 0.6);
    const fatBurnHigh = Math.round(rhr + hrr * 0.7);

    const cardioLow = Math.round(rhr + hrr * 0.7);
    const cardioHigh = Math.round(rhr + hrr * 0.8);

    const anaerobicLow = Math.round(rhr + hrr * 0.8);
    const anaerobicHigh = Math.round(rhr + hrr * 0.9);

    return {
      maxHr,
      fatBurn: `${fatBurnLow} ~ ${fatBurnHigh}`,
      cardio: `${cardioLow} ~ ${cardioHigh}`,
      anaerobic: `${anaerobicLow} ~ ${anaerobicHigh}`,
    };
  }, [age, restingHr]);

  const handleSpeak = () => {
    if (tab === 'water') {
      speakText(`建议您每日饮水量约为${waterStats.totalMl}毫升，折合约${waterStats.cups}杯水`);
    } else {
      speakText(`您的最大心率约为${hrStats.maxHr}次，最佳有氧燃脂心率区间为${hrStats.fatBurn}次每分`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 font-bold active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800">饮水量与燃脂心率</h1>
          <span className="text-xs font-semibold text-cyan-600">健康科学补水与运动区间</span>
        </div>
        <button
          onClick={handleSpeak}
          className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          语音播报
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 标签栏 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTab('water')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                tab === 'water' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              💧 科学每日饮水量
            </button>
            <button
              onClick={() => setTab('heart')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                tab === 'heart' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              ❤️ 运动燃脂心率区间
            </button>
          </div>

          {tab === 'water' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">运动时长 (分钟/天)</label>
                <input
                  type="number"
                  value={exerciseMin}
                  onChange={(e) => setExerciseMin(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">高温炎热或大量出汗</label>
                <input
                  type="checkbox"
                  checked={isHotWeather}
                  onChange={(e) => setIsHotWeather(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded-sm"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">年龄 (岁)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">清晨静息心率 (次/分)</label>
                <input
                  type="number"
                  value={restingHr}
                  onChange={(e) => setRestingHr(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* 结果展示 */}
        {tab === 'water' ? (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400">每日黄金饮水指标</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-600 mb-0.5">建议饮水总量</span>
                  <span className="text-3xl font-black text-cyan-800">{waterStats.totalMl} ml</span>
                </div>
                <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-600 mb-0.5">标准水杯数 (250ml)</span>
                  <span className="text-3xl font-black text-cyan-800">约 {waterStats.cups} 杯</span>
                </div>
              </div>
            </div>

            {/* 科学饮水时间表 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-400">推荐每日分时补水节律</span>
              <div className="flex flex-col gap-1.5 text-xs">
                {waterStats.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="font-bold text-slate-700">{item.time}</span>
                    <span className="font-black text-cyan-600">{item.ml} ml</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400">运动心率安全与燃脂区间 (次/分)</span>
            <div className="flex flex-col gap-2.5">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-black text-emerald-800 block text-sm">🔥 最佳有氧燃脂心率</span>
                  <span className="text-[10px] text-emerald-600">高效分解脂肪·呼吸微喘可说话</span>
                </div>
                <span className="text-lg font-black text-emerald-700">{hrStats.fatBurn}</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-black text-blue-800 block text-sm">🏃 心肺耐力耐受心率</span>
                  <span className="text-[10px] text-blue-600">提升摄氧量·体能进阶训练</span>
                </div>
                <span className="text-lg font-black text-blue-700">{hrStats.cardio}</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-black text-rose-800 block text-sm">⚡ 无氧冲刺极限心率</span>
                  <span className="text-[10px] text-rose-600">爆发力冲刺·不宜维持过久</span>
                </div>
                <span className="text-lg font-black text-rose-700">{hrStats.anaerobic}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
