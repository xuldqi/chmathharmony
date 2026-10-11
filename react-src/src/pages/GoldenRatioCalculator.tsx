import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

const PHI = (Math.sqrt(5) - 1) / 2; // 约 0.6180339887

export default function GoldenRatioCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [calcMode, setCalcMode] = useState<'total' | 'body' | 'scale'>('total');

  // 模式1：已知总长
  const [totalLen, setTotalLen] = useState<string>('100');

  // 模式2：身材美学黄金比例
  const [height, setHeight] = useState<string>('165');
  const [legLen, setLegLen] = useState<string>('100');

  // 模式3：比例尺
  const [scaleRatio, setScaleRatio] = useState<string>('100'); // 1:100
  const [mapVal, setMapVal] = useState<string>('5'); // 5cm

  // 计算分割点
  const goldenParts = useMemo(() => {
    const total = parseFloat(totalLen) || 0;
    const major = total * PHI;
    const minor = total * (1 - PHI);
    return {
      total,
      major: major.toFixed(2),
      minor: minor.toFixed(2),
    };
  }, [totalLen]);

  // 身材比例分析
  const bodyStats = useMemo(() => {
    const h = parseFloat(height) || 0;
    const leg = parseFloat(legLen) || 0;
    if (h <= 0) return null;
    const ratio = leg / h;
    const idealLeg = h * PHI;
    const diff = idealLeg - leg;
    return {
      ratio: ratio.toFixed(3),
      idealLeg: idealLeg.toFixed(1),
      diff: Math.abs(diff).toFixed(1),
      needHeel: diff > 0 ? (diff / (1 - PHI)).toFixed(1) : '0', // 建议鞋跟高度
    };
  }, [height, legLen]);

  // 比例尺计算
  const scaleStats = useMemo(() => {
    const ratio = parseFloat(scaleRatio) || 1;
    const map = parseFloat(mapVal) || 0; // 图上距离 cm
    const realCm = map * ratio;
    const realM = realCm / 100;
    const realKm = realM / 1000;
    return {
      realCm: realCm.toFixed(1),
      realM: realM.toFixed(2),
      realKm: realKm.toFixed(4),
    };
  }, [scaleRatio, mapVal]);

  const handleSpeak = () => {
    if (calcMode === 'total') {
      speakText(`总长${goldenParts.total}的黄金分割长段约为${goldenParts.major}，短段约为${goldenParts.minor}`);
    } else if (calcMode === 'body' && bodyStats) {
      speakText(`当前身材下半身比例为${bodyStats.ratio}，理想黄金腿长为${bodyStats.idealLeg}厘米`);
    } else {
      speakText(`图上${mapVal}厘米在1比${scaleRatio}比例尺下对应实际距离${scaleStats.realM}米`);
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
          <h1 className="text-lg font-black text-slate-800">黄金分割与比例</h1>
          <span className="text-xs font-semibold text-amber-600">0.618 美学与比例尺</span>
        </div>
        <button
          onClick={handleSpeak}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          语音播报
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 模式选择 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setCalcMode('total')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                calcMode === 'total' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              黄金分割点
            </button>
            <button
              onClick={() => setCalcMode('body')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                calcMode === 'body' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              身材美学比例
            </button>
            <button
              onClick={() => setCalcMode('scale')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                calcMode === 'scale' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              比例尺换算
            </button>
          </div>

          {calcMode === 'total' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">输入总长度 (L)</label>
                <input
                  type="number"
                  step="any"
                  value={totalLen}
                  onChange={(e) => setTotalLen(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>

              {/* 可视化分割示意条 */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                  <div className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-black text-white w-[61.8%]">
                    长段 61.8%
                  </div>
                  <div className="bg-amber-300 h-full flex items-center justify-center text-[10px] font-black text-amber-900 w-[38.2%]">
                    短段 38.2%
                  </div>
                </div>
              </div>
            </div>
          )}

          {calcMode === 'body' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">身高 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">下半身长 (肚脐至脚底 cm)</label>
                <input
                  type="number"
                  value={legLen}
                  onChange={(e) => setLegLen(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            </div>
          )}

          {calcMode === 'scale' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">比例尺 1 :</label>
                <input
                  type="number"
                  value={scaleRatio}
                  onChange={(e) => setScaleRatio(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">图纸测量距离 (cm 厘米)</label>
                <input
                  type="number"
                  step="any"
                  value={mapVal}
                  onChange={(e) => setMapVal(e.target.value)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* 结果展示看板 */}
        {calcMode === 'total' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400">黄金分割长度结果</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-amber-600 mb-0.5">长段 A (约61.8%)</span>
                <span className="text-2xl font-black text-amber-800">{goldenParts.major}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-amber-600 mb-0.5">短段 B (约38.2%)</span>
                <span className="text-2xl font-black text-amber-800">{goldenParts.minor}</span>
              </div>
            </div>
          </div>
        )}

        {calcMode === 'body' && bodyStats && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400">身材黄金比例诊断</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex flex-col items-center">
                <span className="text-[11px] font-bold text-amber-600">当前下半身比率</span>
                <span className="text-2xl font-black text-amber-800">{bodyStats.ratio}</span>
                <span className="text-[10px] text-amber-500">标准黄金值 0.618</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex flex-col items-center">
                <span className="text-[11px] font-bold text-rose-600">理想黄金下半身</span>
                <span className="text-2xl font-black text-rose-800">{bodyStats.idealLeg} cm</span>
                <span className="text-[10px] text-rose-500">建议鞋跟 ≈ {bodyStats.needHeel} cm</span>
              </div>
            </div>
          </div>
        )}

        {calcMode === 'scale' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400">实际距离换算</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-indigo-600 mb-0.5">实际米数 (m)</span>
                <span className="text-2xl font-black text-indigo-800">{scaleStats.realM} m</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-indigo-600 mb-0.5">实际公里数 (km)</span>
                <span className="text-2xl font-black text-indigo-800">{scaleStats.realKm} km</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
