import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type Shape2D = 'circle' | 'rectangle' | 'triangle' | 'trapezoid';
type Shape3D = 'sphere' | 'cylinder' | 'cuboid' | 'cone';

export default function GeometryCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [dimension, setDimension] = useState<'2d' | '3d'>('2d');
  const [shape2D, setShape2D] = useState<Shape2D>('circle');
  const [shape3D, setShape3D] = useState<Shape3D>('sphere');

  // 2D 参数
  const [radius2D, setRadius2D] = useState<string>('5');
  const [rectW, setRectW] = useState<string>('6');
  const [rectH, setRectH] = useState<string>('4');
  const [triA, setTriA] = useState<string>('3');
  const [triB, setTriB] = useState<string>('4');
  const [triC, setTriC] = useState<string>('5');
  const [trapTop, setTrapTop] = useState<string>('4');
  const [trapBottom, setTrapBottom] = useState<string>('8');
  const [trapH, setTrapH] = useState<string>('5');

  // 3D 参数
  const [radius3D, setRadius3D] = useState<string>('3');
  const [cylR, setCylR] = useState<string>('3');
  const [cylH, setCylH] = useState<string>('6');
  const [coneR, setConeR] = useState<string>('3');
  const [coneH, setConeH] = useState<string>('4');
  const [boxL, setBoxL] = useState<string>('5');
  const [boxW, setBoxW] = useState<string>('4');
  const [boxH, setBoxH] = useState<string>('3');

  // 计算 2D
  const res2D = useMemo(() => {
    if (shape2D === 'circle') {
      const r = parseFloat(radius2D) || 0;
      const perimeter = 2 * Math.PI * r;
      const area = Math.PI * r * r;
      return {
        name: '圆形',
        c: perimeter.toFixed(2),
        s: area.toFixed(2),
        formula: '周长 C = 2πr\n面积 S = πr²',
      };
    } else if (shape2D === 'rectangle') {
      const w = parseFloat(rectW) || 0;
      const h = parseFloat(rectH) || 0;
      const perimeter = 2 * (w + h);
      const area = w * h;
      return {
        name: '矩形',
        c: perimeter.toFixed(2),
        s: area.toFixed(2),
        formula: '周长 C = 2(长 + 宽)\n面积 S = 长 × 宽',
      };
    } else if (shape2D === 'triangle') {
      const a = parseFloat(triA) || 0;
      const b = parseFloat(triB) || 0;
      const c = parseFloat(triC) || 0;
      const perimeter = a + b + c;
      const p = perimeter / 2;
      const areaVal = p * (p - a) * (p - b) * (p - c);
      const area = areaVal > 0 ? Math.sqrt(areaVal) : 0;
      return {
        name: '三角形',
        c: perimeter.toFixed(2),
        s: area > 0 ? area.toFixed(2) : '无法构成有效三角形',
        formula: '周长 C = a + b + c\n面积 S = √(p(p-a)(p-b)(p-c)) (海伦公式)',
      };
    } else {
      const top = parseFloat(trapTop) || 0;
      const btm = parseFloat(trapBottom) || 0;
      const h = parseFloat(trapH) || 0;
      const area = ((top + btm) * h) / 2;
      return {
        name: '梯形',
        c: '需根据腰长确定',
        s: area.toFixed(2),
        formula: '面积 S = (上底 + 下底) × 高 ÷ 2',
      };
    }
  }, [shape2D, radius2D, rectW, rectH, triA, triB, triC, trapTop, trapBottom, trapH]);

  // 计算 3D
  const res3D = useMemo(() => {
    if (shape3D === 'sphere') {
      const r = parseFloat(radius3D) || 0;
      const surface = 4 * Math.PI * r * r;
      const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
      return {
        name: '球体',
        area: surface.toFixed(2),
        vol: volume.toFixed(2),
        formula: '表面积 S = 4πr²\n体积 V = 4/3πr³',
      };
    } else if (shape3D === 'cylinder') {
      const r = parseFloat(cylR) || 0;
      const h = parseFloat(cylH) || 0;
      const surface = 2 * Math.PI * r * h + 2 * Math.PI * r * r;
      const volume = Math.PI * r * r * h;
      return {
        name: '圆柱体',
        area: surface.toFixed(2),
        vol: volume.toFixed(2),
        formula: '表面积 S = 2πrh + 2πr²\n体积 V = πr²h',
      };
    } else if (shape3D === 'cone') {
      const r = parseFloat(coneR) || 0;
      const h = parseFloat(coneH) || 0;
      const l = Math.sqrt(r * r + h * h);
      const surface = Math.PI * r * l + Math.PI * r * r;
      const volume = (1 / 3) * Math.PI * r * r * h;
      return {
        name: '圆锥体',
        area: surface.toFixed(2),
        vol: volume.toFixed(2),
        formula: '母线 l = √(r² + h²)\n表面积 S = πrl + πr²\n体积 V = 1/3πr²h',
      };
    } else {
      const l = parseFloat(boxL) || 0;
      const w = parseFloat(boxW) || 0;
      const h = parseFloat(boxH) || 0;
      const surface = 2 * (l * w + l * h + w * h);
      const volume = l * w * h;
      return {
        name: '长方体',
        area: surface.toFixed(2),
        vol: volume.toFixed(2),
        formula: '表面积 S = 2(长宽 + 长高 + 宽高)\n体积 V = 长 × 宽 × 高',
      };
    }
  }, [shape3D, radius3D, cylR, cylH, coneR, coneH, boxL, boxW, boxH]);

  const handleSpeak = () => {
    if (dimension === '2d') {
      speakText(`${res2D.name}的周长约为${res2D.c}，面积约为${res2D.s}`);
    } else {
      speakText(`${res3D.name}的表面积约为${res3D.area}，体积约为${res3D.vol}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="几何周长面积体积"
          subtitle="2D平面与3D立体几何"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 维度切换 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setDimension('2d')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                dimension === '2d'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              �2D 平面图形
            </button>
            <button
              onClick={() => setDimension('3d')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                dimension === '3d'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              �3D 立体几何
            </button>
          </div>

          {/* 图形类型选择 */}
          {dimension === '2d' ? (
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { key: 'circle', label: '圆形' },
                  { key: 'rectangle', label: '矩形' },
                  { key: 'triangle', label: '三角形' },
                  { key: 'trapezoid', label: '梯形' },
                ] as const
              ).map(item => (
                <button
                  key={item.key}
                  onClick={() => setShape2D(item.key)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    shape2D === item.key
                      ? 'bg-teal-50 border-teal-400 text-teal-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { key: 'sphere', label: '球体' },
                  { key: 'cylinder', label: '圆柱体' },
                  { key: 'cone', label: '圆锥体' },
                  { key: 'cuboid', label: '长方体' },
                ] as const
              ).map(item => (
                <button
                  key={item.key}
                  onClick={() => setShape3D(item.key)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    shape3D === item.key
                      ? 'bg-teal-50 border-teal-400 text-teal-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* 参数输入 */}
          <div className="flex flex-col gap-3 pt-1">
            {dimension === '2d' && shape2D === 'circle' && (
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">半径 (r)</label>
                <input
                  type="number"
                  min="0"
                  value={radius2D}
                  onChange={(e) => setRadius2D(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            )}
            {dimension === '2d' && shape2D === 'rectangle' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">长度 (长)</label>
                  <input
                    type="number"
                    min="0"
                    value={rectW}
                    onChange={(e) => setRectW(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">宽度 (宽)</label>
                  <input
                    type="number"
                    min="0"
                    value={rectH}
                    onChange={(e) => setRectH(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
            {dimension === '2d' && shape2D === 'triangle' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">边长 a</label>
                  <input
                    type="number"
                    min="0"
                    value={triA}
                    onChange={(e) => setTriA(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">边长 b</label>
                  <input
                    type="number"
                    min="0"
                    value={triB}
                    onChange={(e) => setTriB(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">边长 c</label>
                  <input
                    type="number"
                    min="0"
                    value={triC}
                    onChange={(e) => setTriC(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
            {dimension === '2d' && shape2D === 'trapezoid' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">上底</label>
                  <input
                    type="number"
                    min="0"
                    value={trapTop}
                    onChange={(e) => setTrapTop(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">下底</label>
                  <input
                    type="number"
                    min="0"
                    value={trapBottom}
                    onChange={(e) => setTrapBottom(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">高度</label>
                  <input
                    type="number"
                    min="0"
                    value={trapH}
                    onChange={(e) => setTrapH(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}

            {dimension === '3d' && shape3D === 'sphere' && (
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">球半径 (r)</label>
                <input
                  type="number"
                  min="0"
                  value={radius3D}
                  onChange={(e) => setRadius3D(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            )}
            {dimension === '3d' && shape3D === 'cylinder' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">底面半径 (r)</label>
                  <input
                    type="number"
                    min="0"
                    value={cylR}
                    onChange={(e) => setCylR(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">高度 (h)</label>
                  <input
                    type="number"
                    min="0"
                    value={cylH}
                    onChange={(e) => setCylH(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
            {dimension === '3d' && shape3D === 'cone' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">底面半径 (r)</label>
                  <input
                    type="number"
                    min="0"
                    value={coneR}
                    onChange={(e) => setConeR(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">锥高 (h)</label>
                  <input
                    type="number"
                    min="0"
                    value={coneH}
                    onChange={(e) => setConeH(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
            {dimension === '3d' && shape3D === 'cuboid' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">长</label>
                  <input
                    type="number"
                    min="0"
                    value={boxL}
                    onChange={(e) => setBoxL(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">宽</label>
                  <input
                    type="number"
                    min="0"
                    value={boxW}
                    onChange={(e) => setBoxW(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">高</label>
                  <input
                    type="number"
                    min="0"
                    value={boxH}
                    onChange={(e) => setBoxH(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 结果展示 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">计算结果</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-teal-600 mb-1">
                {dimension === '2d' ? '周长 (C)' : '表面积 (S)'}
              </span>
              <span className="text-2xl font-black text-teal-700">
                {dimension === '2d' ? res2D.c : res3D.area}
              </span>
            </div>
            <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-cyan-600 mb-1">
                {dimension === '2d' ? '面积 (S)' : '体积 (V)'}
              </span>
              <span className="text-2xl font-black text-cyan-700">
                {dimension === '2d' ? res2D.s : res3D.vol}
              </span>
            </div>
          </div>
        </div>

        {/* 公式与原理解析 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">�计算公式：</span>
          <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {dimension === '2d' ? res2D.formula : res3D.formula}
          </pre>
        </div>
      </main>
    </div>
  );
}
