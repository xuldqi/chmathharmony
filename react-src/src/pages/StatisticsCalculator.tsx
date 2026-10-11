import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

export default function StatisticsCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [rawInput, setRawInput] = useState<string>('85, 92, 78, 92, 88, 95, 60, 88, 90');

  // 解析并清洗数据
  const numbers = useMemo(() => {
    return rawInput
      .split(/[\s,，、\n]+/)
      .map(Number)
      .filter(n => !isNaN(n));
  }, [rawInput]);

  // 统计指标计算
  const stats = useMemo(() => {
    const n = numbers.length;
    if (n === 0) return null;

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // 中位数
    let median = 0;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
    } else {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    // 众数
    const freq: { [key: number]: number } = {};
    let maxFreq = 0;
    sorted.forEach(val => {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxFreq) maxFreq = freq[val];
    });
    const modes: number[] = [];
    if (maxFreq > 1) {
      Object.keys(freq).forEach(k => {
        const num = Number(k);
        if (freq[num] === maxFreq) modes.push(num);
      });
    }

    // 极值与极差
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // 方差与标准差
    const sumSqDiff = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    const popVariance = sumSqDiff / n; // 总体方差
    const sampleVariance = n > 1 ? sumSqDiff / (n - 1) : 0; // 样本方差
    const popStdDev = Math.sqrt(popVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);

    return {
      n,
      sum,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      modes: modes.length > 0 ? modes.join(', ') : '无明显众数',
      min,
      max,
      range,
      popVariance: popVariance.toFixed(2),
      sampleVariance: sampleVariance.toFixed(2),
      popStdDev: popStdDev.toFixed(2),
      sampleStdDev: sampleStdDev.toFixed(2),
      sorted,
    };
  }, [numbers]);

  const handleSpeak = () => {
    if (!stats) {
      speakText('请输入有效的一组数字');
      return;
    }
    speakText(`共${stats.n}个数据，平均数为${stats.mean}，中位数为${stats.median}，极差为${stats.range}`);
  };

  const handleSetExample = (example: string) => {
    setRawInput(example);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="统计分析计算器"
          subtitle="均值/中位数/方差/标准差"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 数据输入框 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">输入数字样本 (逗号或空格隔开)</span>
            <span className="text-xs font-extrabold text-blue-600">
              已识别 {numbers.length} 个数
            </span>
          </div>

          <textarea
            rows={3}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="输入数字，如: 10, 20, 30, 40"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-2">
            <button
              onClick={() => handleSetExample('85, 92, 78, 92, 88, 95, 60, 88, 90')}
              className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl"
            >
              示例: 考试成绩
            </button>
            <button
              onClick={() => handleSetExample('12, 15, 18, 12, 14, 16, 20, 22, 19')}
              className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl"
            >
              示例: 气温变化
            </button>
            <button
              onClick={() => setRawInput('')}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 ml-auto"
            >
              清空
            </button>
          </div>
        </div>

        {/* 核心指标看板 */}
        {stats && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400">核心统计特征</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-blue-600 mb-0.5">平均数 (Mean)</span>
                  <span className="text-2xl font-black text-blue-800">{stats.mean}</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-indigo-600 mb-0.5">中位数 (Median)</span>
                  <span className="text-2xl font-black text-indigo-800">{stats.median}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-emerald-600 mb-0.5">样本标准差 (s)</span>
                  <span className="text-2xl font-black text-emerald-800">{stats.sampleStdDev}</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-600 mb-0.5">极差 (Range)</span>
                  <span className="text-2xl font-black text-amber-800">{stats.range}</span>
                </div>
              </div>
            </div>

            {/* 详细指标表格 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-400">详细指标清单</span>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">样本总和 (Σ)</span>
                  <span className="font-black text-slate-800">{stats.sum}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">众数 (Mode)</span>
                  <span className="font-black text-slate-800">{stats.modes}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">最小值 / 最大值</span>
                  <span className="font-black text-slate-800">{stats.min} ~ {stats.max}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">样本方差 (s²)</span>
                  <span className="font-black text-slate-800">{stats.sampleVariance}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">总体标准差 (σ)</span>
                  <span className="font-black text-slate-800">{stats.popStdDev}</span>
                </div>
              </div>
            </div>

            {/* 排序后数据展示 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400">从小到大排序 ({stats.n} 个)</span>
              <div className="flex flex-wrap gap-1.5">
                {stats.sorted.map((num, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
