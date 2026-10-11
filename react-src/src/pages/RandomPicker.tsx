import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type PickerMode = 'decision' | 'number';

const PRESETS = [
  { name: '今天吃什么', items: ['火锅', '麻辣烫', '炸鸡汉堡', '健康轻食', '牛肉拉面', '日式料理', '家常小炒'] },
  { name: '家务大转盘', items: ['洗碗', '倒垃圾', '拖地扫地', '洗衣服', '铲猫砂', '今天免做!'] },
  { name: '猜拳与掷骰', items: ['石头', '剪刀', '布'] },
];

export default function RandomPicker() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [mode, setMode] = useState<PickerMode>('decision');

  // 决策项
  const [candidates, setCandidates] = useState<string[]>(PRESETS[0].items);
  const [newCandidate, setNewCandidate] = useState<string>('');
  const [pickedItem, setPickedItem] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [highlightIdx, setHighlightIdx] = useState<number>(-1);

  // 随机数范围
  const [minNum, setMinNum] = useState<string>('1');
  const [maxNum, setMaxNum] = useState<string>('100');
  const [countNum, setCountNum] = useState<string>('1');
  const [allowDup, setAllowDup] = useState<boolean>(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);

  const animTimerRef = useRef<number | null>(null);

  // 开始抽签跳动
  const handleStartSpin = () => {
    if (candidates.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setPickedItem(null);

    let current = 0;
    let speed = 60;
    let count = 0;
    const totalSpins = 25 + Math.floor(Math.random() * 10);

    const step = () => {
      current = (current + 1) % candidates.length;
      setHighlightIdx(current);
      count++;

      if (count >= totalSpins) {
        setIsSpinning(false);
        const finalItem = candidates[current];
        setPickedItem(finalItem);
        speakText(`抽签结果是：${finalItem}！`);
      } else {
        if (count > totalSpins - 8) {
          speed += 40; // 减速冲刺
        }
        animTimerRef.current = window.setTimeout(step, speed);
      }
    };

    step();
  };

  // 添加选项
  const handleAddCandidate = () => {
    const trimmed = newCandidate.trim();
    if (!trimmed) return;
    if (candidates.includes(trimmed)) return;
    setCandidates(prev => [...prev, trimmed]);
    setNewCandidate('');
  };

  // 删除选项
  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 2) {
      speakText('至少保留两个选项哦');
      return;
    }
    setCandidates(prev => prev.filter((_, i) => i !== index));
  };

  // 应用预设
  const handleApplyPreset = (items: string[]) => {
    setCandidates(items);
    setPickedItem(null);
    setHighlightIdx(-1);
  };

  // 生成随机数
  const handleGenerateNumbers = () => {
    const min = parseInt(minNum, 10) || 1;
    const max = parseInt(maxNum, 10) || 100;
    const count = Math.max(1, parseInt(countNum, 10) || 1);

    if (min >= max) {
      speakText('最小值必须小于最大值');
      return;
    }

    if (!allowDup && count > (max - min + 1)) {
      speakText('不重复抽取时，数量不能大于数值范围');
      return;
    }

    const res: number[] = [];
    if (allowDup) {
      for (let i = 0; i < count; i++) {
        res.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
    } else {
      const pool: number[] = [];
      for (let i = min; i <= max; i++) pool.push(i);
      for (let i = 0; i < count; i++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        res.push(pool[randIdx]);
        pool.splice(randIdx, 1);
      }
    }

    setGeneratedNumbers(res);
    speakText(`已为您生成随机数：${res.slice(0, 3).join('，')}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="随机抽签决策"
          subtitle="摇号与随机转盘助手"
          onBack={() => navigate(-1)}
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 模式选择 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setMode('decision')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                mode === 'decision'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              �幸运抽签决策
            </button>
            <button
              onClick={() => setMode('number')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                mode === 'number'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              �随机数摇号器
            </button>
          </div>

          {mode === 'decision' ? (
            <div className="flex flex-col gap-3">
              {/* 预设快捷方式 */}
              <div className="flex gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handleApplyPreset(p.items)}
                    className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* 候选列表卡片网格 */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {candidates.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-center font-black text-sm transition-all flex items-center justify-between ${
                      highlightIdx === idx
                        ? 'bg-rose-500 border-rose-500 text-white scale-105 shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="truncate flex-1 text-left pl-1">{item}</span>
                    <button
                      onClick={() => handleRemoveCandidate(idx)}
                      disabled={isSpinning}
                      className="text-slate-300 hover:text-rose-500 text-xs px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* 添加新项 */}
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newCandidate}
                  onChange={(e) => setNewCandidate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCandidate()}
                  placeholder="添加新选项..."
                  disabled={isSpinning}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
                <button
                  onClick={handleAddCandidate}
                  disabled={isSpinning}
                  className="bg-slate-200 text-slate-700 text-xs font-black px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                >
                  添加
                </button>
              </div>

              {/* 开始抽签按钮 */}
              <button
                type="button"
                onClick={handleStartSpin}
                disabled={isSpinning}
                className="mt-2 w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-lg shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                style={{ boxShadow: '0 5px 0 #E11D48' }}
              >
                <span>{isSpinning ? '正在摇动...' : '�立即抽取决策'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* 随机数设置 */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">范围 (最小值 ~ 最大值)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minNum}
                    onChange={(e) => setMinNum(e.target.value)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-center font-black text-slate-800 text-xs"
                  />
                  <span className="text-xs text-slate-400">至</span>
                  <input
                    type="number"
                    value={maxNum}
                    onChange={(e) => setMaxNum(e.target.value)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-center font-black text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">抽取数量</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={countNum}
                  onChange={(e) => setCountNum(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-right font-black text-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">允许出现重复数字</label>
                <input
                  type="checkbox"
                  checked={allowDup}
                  onChange={(e) => setAllowDup(e.target.checked)}
                  className="w-4 h-4 text-rose-500 rounded-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateNumbers}
                className="mt-2 w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-lg shadow-md active:scale-98 transition-all"
                style={{ boxShadow: '0 5px 0 #E11D48' }}
              >
                生成随机数
              </button>
            </div>
          )}
        </div>

        {/* 结果浮层 */}
        {mode === 'decision' && pickedItem && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg text-center flex flex-col items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest opacity-80">
              PICKED RESULT
            </span>
            <div className="text-3xl font-black">{pickedItem}</div>
            <button
              onClick={handleStartSpin}
              className="mt-2 bg-white text-rose-600 text-xs font-black px-5 py-2 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              重新抽取
            </button>
          </div>
        )}

        {mode === 'number' && generatedNumbers.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">
                生成结果 ({generatedNumbers.length} 个)
              </span>
              <button
                onClick={() => setGeneratedNumbers(prev => [...prev].sort((a, b) => a - b))}
                className="text-[11px] font-bold text-rose-600"
              >
                按升序排列
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {generatedNumbers.map((num, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl text-base font-black"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
