import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type PhysCategory = 'speed' | 'accel' | 'force' | 'energy' | 'pressure';

export default function PhysicsCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [category, setCategory] = useState<PhysCategory>('speed');

  // 速度 s = vt
  const [speedV, setSpeedV] = useState<string>('20'); // m/s
  const [speedT, setSpeedT] = useState<string>('5'); // s

  // 加速度 v = v0 + at, s = v0*t + 0.5*a*t^2
  const [accV0, setAccV0] = useState<string>('0');
  const [accA, setAccA] = useState<string>('9.8');
  const [accT, setAccT] = useState<string>('3');

  // 牛顿第二定律 F = ma
  const [forceM, setForceM] = useState<string>('10'); // kg
  const [forceA, setForceA] = useState<string>('2.5'); // m/s^2

  // 动能与势能 Ek = 0.5*m*v^2, Ep = m*g*h
  const [energyM, setEnergyM] = useState<string>('2');
  const [energyV, setEnergyV] = useState<string>('10');
  const [energyH, setEnergyH] = useState<string>('5');

  // 压强 P = F / S
  const [pressF, setPressF] = useState<string>('500'); // N
  const [pressS, setPressS] = useState<string>('0.05'); // m^2

  // 速度计算
  const speedRes = useMemo(() => {
    const v = parseFloat(speedV) || 0;
    const t = parseFloat(speedT) || 0;
    const s = v * t;
    const kmh = (v * 3.6).toFixed(1);
    return {
      s: s.toFixed(2),
      kmh,
      formula: `路程 s = v × t = ${v} m/s × ${t} s = ${s.toFixed(2)} m (速度折合 ${kmh} km/h)`,
    };
  }, [speedV, speedT]);

  // 加速度计算
  const accelRes = useMemo(() => {
    const v0 = parseFloat(accV0) || 0;
    const a = parseFloat(accA) || 0;
    const t = parseFloat(accT) || 0;
    const vt = v0 + a * t;
    const s = v0 * t + 0.5 * a * t * t;
    return {
      vt: vt.toFixed(2),
      s: s.toFixed(2),
      formula: `末速度 vt = v₀ + at = ${v0} + ${a}×${t} = ${vt.toFixed(2)} m/s\n位移 s = v₀t + ½at² = ${s.toFixed(2)} m`,
    };
  }, [accV0, accA, accT]);

  // 牛二定律
  const forceRes = useMemo(() => {
    const m = parseFloat(forceM) || 0;
    const a = parseFloat(forceA) || 0;
    const f = m * a;
    return {
      f: f.toFixed(2),
      formula: `合外力 F = m × a = ${m} kg × ${a} m/s² = ${f.toFixed(2)} N (牛顿)`,
    };
  }, [forceM, forceA]);

  // 机械能
  const energyRes = useMemo(() => {
    const m = parseFloat(energyM) || 0;
    const v = parseFloat(energyV) || 0;
    const h = parseFloat(energyH) || 0;
    const ek = 0.5 * m * v * v;
    const ep = m * 9.8 * h;
    const total = ek + ep;
    return {
      ek: ek.toFixed(2),
      ep: ep.toFixed(2),
      total: total.toFixed(2),
      formula: `动能 Ek = ½mv² = ${ek.toFixed(2)} J\n重力势能 Ep = mgh = ${ep.toFixed(2)} J\n机械能总量 = ${total.toFixed(2)} J (焦耳)`,
    };
  }, [energyM, energyV, energyH]);

  // 压强
  const pressRes = useMemo(() => {
    const f = parseFloat(pressF) || 0;
    const s = parseFloat(pressS) || 0;
    const p = s > 0 ? f / s : 0;
    const kpa = (p / 1000).toFixed(2);
    return {
      p: p.toFixed(2),
      kpa,
      formula: `压强 P = F / S = ${f} N ÷ ${s} m² = ${p.toFixed(2)} Pa (即 ${kpa} kPa)`,
    };
  }, [pressF, pressS]);

  const handleSpeak = () => {
    if (category === 'speed') speakText(`计算结果：路程为${speedRes.s}米`);
    else if (category === 'accel') speakText(`末速度为${accelRes.vt}米每秒，位移为${accelRes.s}米`);
    else if (category === 'force') speakText(`合力为${forceRes.f}牛顿`);
    else if (category === 'energy') speakText(`动能为${energyRes.ek}焦耳，重力势能为${energyRes.ep}焦耳`);
    else speakText(`压强为${pressRes.p}帕斯卡`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="经典物理公式"
          subtitle="运动学·力学·能量·压强"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 公式分类导航 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-black">
            {[
              { key: 'speed', label: '匀速 s=vt' },
              { key: 'accel', label: '加速度 a' },
              { key: 'force', label: '牛二 F=ma' },
              { key: 'energy', label: '动能势能' },
              { key: 'pressure', label: '压强 P' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setCategory(item.key as PhysCategory)}
                className={`py-1.5 rounded-xl transition-all ${
                  category === item.key
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 各分类参数输入 */}
          <div className="flex flex-col gap-3">
            {category === 'speed' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">速度 v (m/s)</label>
                  <input
                    type="number"
                    step="any"
                    value={speedV}
                    onChange={(e) => setSpeedV(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">运动时间 t (s 秒)</label>
                  <input
                    type="number"
                    step="any"
                    value={speedT}
                    onChange={(e) => setSpeedT(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}

            {category === 'accel' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">初速度 v₀ (m/s)</label>
                  <input
                    type="number"
                    step="any"
                    value={accV0}
                    onChange={(e) => setAccV0(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">加速度 a (m/s²)</label>
                  <input
                    type="number"
                    step="any"
                    value={accA}
                    onChange={(e) => setAccA(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">时间 t (s 秒)</label>
                  <input
                    type="number"
                    step="any"
                    value={accT}
                    onChange={(e) => setAccT(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}

            {category === 'force' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">质量 m (kg 千克)</label>
                  <input
                    type="number"
                    step="any"
                    value={forceM}
                    onChange={(e) => setForceM(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">加速度 a (m/s²)</label>
                  <input
                    type="number"
                    step="any"
                    value={forceA}
                    onChange={(e) => setForceA(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}

            {category === 'energy' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">物体质量 m (kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={energyM}
                    onChange={(e) => setEnergyM(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">运行速度 v (m/s)</label>
                  <input
                    type="number"
                    step="any"
                    value={energyV}
                    onChange={(e) => setEnergyV(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">离地高度 h (m 米)</label>
                  <input
                    type="number"
                    step="any"
                    value={energyH}
                    onChange={(e) => setEnergyH(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}

            {category === 'pressure' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">垂直压力 F (N 牛顿)</label>
                  <input
                    type="number"
                    step="any"
                    value={pressF}
                    onChange={(e) => setPressF(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">受力面积 S (m² 平方米)</label>
                  <input
                    type="number"
                    step="any"
                    value={pressS}
                    onChange={(e) => setPressS(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 结果指标 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">物理运算结果</span>

          {category === 'speed' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-sky-600 mb-0.5">行驶路程 s</span>
                <span className="text-2xl font-black text-sky-800">{speedRes.s} m</span>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-sky-600 mb-0.5">时速换算</span>
                <span className="text-2xl font-black text-sky-800">{speedRes.kmh} km/h</span>
              </div>
            </div>
          )}

          {category === 'accel' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-sky-600 mb-0.5">最终速度 vt</span>
                <span className="text-2xl font-black text-sky-800">{accelRes.vt} m/s</span>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-sky-600 mb-0.5">位移路程 s</span>
                <span className="text-2xl font-black text-sky-800">{accelRes.s} m</span>
              </div>
            </div>
          )}

          {category === 'force' && (
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold text-sky-600 mb-0.5">作用力 F</span>
              <span className="text-3xl font-black text-sky-800">{forceRes.f} N</span>
            </div>
          )}

          {category === 'energy' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-sky-600 block">动能 Ek</span>
                <span className="text-lg font-black text-sky-800">{energyRes.ek} J</span>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-sky-600 block">势能 Ep</span>
                <span className="text-lg font-black text-sky-800">{energyRes.ep} J</span>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-sky-600 block">机械能 E</span>
                <span className="text-lg font-black text-sky-800">{energyRes.total} J</span>
              </div>
            </div>
          )}

          {category === 'pressure' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-sky-600 mb-0.5">压强 P (Pa 帕)</span>
                <span className="text-2xl font-black text-sky-800">{pressRes.p} Pa</span>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-sky-600 mb-0.5">千帕 (kPa)</span>
                <span className="text-2xl font-black text-sky-800">{pressRes.kpa} kPa</span>
              </div>
            </div>
          )}

          {/* 公式说明 */}
          <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">详细公式步骤：</span>
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
              {category === 'speed' && speedRes.formula}
              {category === 'accel' && accelRes.formula}
              {category === 'force' && forceRes.formula}
              {category === 'energy' && energyRes.formula}
              {category === 'pressure' && pressRes.formula}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
