import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';

export default function VectorCalculator() {
  const navigate = useNavigate();

  const [dim, setDim] = useState<2 | 3>(3); // 二维 / 三维
  const [x1, setX1] = useState<string>('3');
  const [y1, setY1] = useState<string>('4');
  const [z1, setZ1] = useState<string>('0');

  const [x2, setX2] = useState<string>('1');
  const [y2, setY2] = useState<string>('2');
  const [z2, setZ2] = useState<string>('2');

  const ax = parseFloat(x1) || 0;
  const ay = parseFloat(y1) || 0;
  const az = dim === 3 ? (parseFloat(z1) || 0) : 0;

  const bx = parseFloat(x2) || 0;
  const by = parseFloat(y2) || 0;
  const bz = dim === 3 ? (parseFloat(z2) || 0) : 0;

  // 向量模长 |a| 和 |b|
  const magA = Math.sqrt(ax * ax + ay * ay + az * az);
  const magB = Math.sqrt(bx * bx + by * by + bz * bz);

  // 点乘（内积 a · b）
  const dotProduct = ax * bx + ay * by + az * bz;

  // 叉乘（外积 a × b，仅三维）
  const crossX = ay * bz - az * by;
  const crossY = az * bx - ax * bz;
  const crossZ = ax * by - ay * bx;

  // 夹角 cosθ = (a·b) / (|a| * |b|)
  let cosTheta = 0;
  let angleDeg = 0;
  let angleRad = 0;
  if (magA > 0 && magB > 0) {
    cosTheta = Math.max(-1, Math.min(1, dotProduct / (magA * magB)));
    angleRad = Math.acos(cosTheta);
    angleDeg = (angleRad * 180) / Math.PI;
  }

  // 向量加法与减法
  const addVec = `(${ax + bx}, ${ay + by}${dim === 3 ? `, ${az + bz}` : ''})`;
  const subVec = `(${ax - bx}, ${ay - by}${dim === 3 ? `, ${az - bz}` : ''})`;

  return (
    <div className="bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] min-h-screen w-full flex flex-col text-slate-700">
      <main className="flex-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-12 w-full max-w-md mx-auto flex flex-col gap-4">
        <AppPageHeader title="空间与平面向量运算" onBack={() => navigate(-1)} />

        {/* 维度切换 */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
          <button
            type="button"
            onClick={() => setDim(2)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              dim === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            二维平面向量 (2D)
          </button>
          <button
            type="button"
            onClick={() => setDim(3)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              dim === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            三维空间向量 (3D)
          </button>
        </div>

        {/* 向量输入表单 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3.5">
          {/* 向量 a */}
          <div>
            <span className="text-xs font-bold text-indigo-700 mb-1.5 block">向量 a 分量</span>
            <div className={`grid ${dim === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">X</label>
                <input
                  type="number"
                  value={x1}
                  onChange={(e) => setX1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Y</label>
                <input
                  type="number"
                  value={y1}
                  onChange={(e) => setY1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center"
                />
              </div>
              {dim === 3 && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Z</label>
                  <input
                    type="number"
                    value={z1}
                    onChange={(e) => setZ1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 向量 b */}
          <div>
            <span className="text-xs font-bold text-purple-700 mb-1.5 block">向量 b 分量</span>
            <div className={`grid ${dim === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">X</label>
                <input
                  type="number"
                  value={x2}
                  onChange={(e) => setX2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Y</label>
                <input
                  type="number"
                  value={y2}
                  onChange={(e) => setY2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center"
                />
              </div>
              {dim === 3 && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Z</label>
                  <input
                    type="number"
                    value={z2}
                    onChange={(e) => setZ2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 bg-slate-50 text-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 运算结果展示 */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_6px_0_#DED6E0] border border-white flex flex-col gap-3 font-mono">
          <span className="text-sm font-black text-slate-700 font-sans">计算结果分析</span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400 font-sans">模长 |a|</span>
              <span className="text-base font-black text-indigo-700 mt-0.5">{magA.toFixed(4).replace(/\.?0+$/, '')}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400 font-sans">模长 |b|</span>
              <span className="text-base font-black text-purple-700 mt-0.5">{magB.toFixed(4).replace(/\.?0+$/, '')}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-sans font-bold text-slate-600">点乘内积 a · b</span>
              <span className="text-lg font-black text-indigo-800">{dotProduct.toFixed(4).replace(/\.?0+$/, '')}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-indigo-100">
              <span className="font-sans font-bold text-slate-600">两向量夹角 θ</span>
              <span className="text-sm font-black text-indigo-800">
                {angleDeg.toFixed(2)}° ({angleRad.toFixed(3)} rad)
              </span>
            </div>
          </div>

          {dim === 3 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
              <span className="font-sans font-bold text-slate-600">叉乘法向量 a × b</span>
              <span className="text-sm font-black text-slate-800">({crossX}, {crossY}, {crossZ})</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400 font-sans">向量加 a + b</span>
              <span className="text-xs font-black text-slate-800 mt-0.5">{addVec}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-slate-400 font-sans">向量减 a - b</span>
              <span className="text-xs font-black text-slate-800 mt-0.5">{subVec}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
