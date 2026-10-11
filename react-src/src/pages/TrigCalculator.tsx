import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type AngleUnit = 'deg' | 'rad';

const SPECIAL_ANGLES = [
  { deg: 0, rad: '0', sin: '0', cos: '1', tan: '0' },
  { deg: 30, rad: 'π/6', sin: '1/2', cos: '√3/2', tan: '√3/3' },
  { deg: 45, rad: 'π/4', sin: '√2/2', cos: '√2/2', tan: '1' },
  { deg: 60, rad: 'π/3', sin: '√3/2', cos: '1/2', tan: '√3' },
  { deg: 90, rad: 'π/2', sin: '1', cos: '0', tan: '不存在' },
  { deg: 180, rad: 'π', sin: '0', cos: '-1', tan: '0' },
  { deg: 270, rad: '3π/2', sin: '-1', cos: '0', tan: '不存在' },
  { deg: 360, rad: '2π', sin: '0', cos: '1', tan: '0' },
];

export default function TrigCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [unit, setUnit] = useState<AngleUnit>('deg');
  const [angleInput, setAngleInput] = useState<string>('30');

  // 计算弧度值
  const radVal = useMemo(() => {
    const val = parseFloat(angleInput) || 0;
    return unit === 'deg' ? (val * Math.PI) / 180 : val;
  }, [unit, angleInput]);

  // 各项三角函数
  const trigValues = useMemo(() => {
    const s = Math.sin(radVal);
    const c = Math.cos(radVal);
    const t = Math.abs(c) < 1e-12 ? null : Math.tan(radVal);
    const cot = Math.abs(s) < 1e-12 ? null : 1 / Math.tan(radVal);
    const sec = Math.abs(c) < 1e-12 ? null : 1 / c;
    const csc = Math.abs(s) < 1e-12 ? null : 1 / s;

    const fmt = (num: number | null) => {
      if (num === null) return '无定义/无穷大';
      if (Math.abs(num) < 1e-10) return '0';
      return Math.round(num * 10000) / 10000;
    };

    return {
      sin: fmt(s),
      cos: fmt(c),
      tan: fmt(t),
      cot: fmt(cot),
      sec: fmt(sec),
      csc: fmt(csc),
    };
  }, [radVal]);

  const handleSpeak = () => {
    speakText(`输入角为${angleInput}${unit === 'deg' ? '度' : '弧度'}，正弦sin为${trigValues.sin}，余弦cos为${trigValues.cos}，正切tan为${trigValues.tan}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="三角函数计算器"
          subtitle="sin / cos / tan 与特殊角"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 输入区 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setUnit('deg')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                unit === 'deg'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              角度制 (DEG °)
            </button>
            <button
              onClick={() => setUnit('rad')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                unit === 'rad'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              弧度制 (RAD rad)
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500">输入角度 θ</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={angleInput}
                onChange={(e) => setAngleInput(e.target.value)}
                className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 text-lg"
              />
              <span className="text-sm font-black text-slate-400">
                {unit === 'deg' ? '°' : 'rad'}
              </span>
            </div>
          </div>
        </div>

        {/* 6 大三角函数结果 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">三角函数运算值</span>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-blue-500 block">sin(θ) 正弦</span>
              <span className="text-lg font-black text-blue-800">{trigValues.sin}</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-indigo-500 block">cos(θ) 余弦</span>
              <span className="text-lg font-black text-indigo-800">{trigValues.cos}</span>
            </div>
            <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-cyan-500 block">tan(θ) 正切</span>
              <span className="text-lg font-black text-cyan-800">{trigValues.tan}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block">cot(θ) 余切</span>
              <span className="text-lg font-black text-slate-700">{trigValues.cot}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block">sec(θ) 正割</span>
              <span className="text-lg font-black text-slate-700">{trigValues.sec}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block">csc(θ) 余割</span>
              <span className="text-lg font-black text-slate-700">{trigValues.csc}</span>
            </div>
          </div>
        </div>

        {/* 特殊角速查表 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-400">特殊角速查表</span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <th className="py-2 px-1">角度</th>
                  <th className="py-2 px-1">弧度</th>
                  <th className="py-2 px-1">sin</th>
                  <th className="py-2 px-1">cos</th>
                  <th className="py-2 px-1">tan</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_ANGLES.map(row => (
                  <tr
                    key={row.deg}
                    onClick={() => {
                      setUnit('deg');
                      setAngleInput(`${row.deg}`);
                    }}
                    className="border-b border-slate-100 hover:bg-blue-50/60 cursor-pointer font-bold text-slate-700"
                  >
                    <td className="py-2 text-blue-600">{row.deg}°</td>
                    <td className="py-2 text-slate-500">{row.rad}</td>
                    <td className="py-2">{row.sin}</td>
                    <td className="py-2">{row.cos}</td>
                    <td className="py-2">{row.tan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
