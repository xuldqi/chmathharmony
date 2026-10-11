import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Delete, Users, ArrowRightLeft, HelpCircle } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import relationship from 'relationship.js';

export default function KinshipCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 我的性别: 1=男, 0=女
  const [sex, setSex] = useState<0 | 1>(1);
  // 称呼模式: false=我叫对方, true=对方叫我
  const [reverse, setReverse] = useState<boolean>(false);
  // 关系链 tokens
  const [tokens, setTokens] = useState<string[]>([]);

  // 关系文本表达式
  const expression = useMemo(() => {
    if (tokens.length === 0) return '';
    return tokens.join('的');
  }, [tokens]);

  // 计算结果
  const result = useMemo(() => {
    if (!expression) return [];
    try {
      const res = relationship({
        text: expression,
        sex,
        reverse,
      });
      return Array.isArray(res) ? res : [res];
    } catch {
      return [];
    }
  }, [expression, sex, reverse]);

  // 添加关系
  const handleAdd = (role: string) => {
    setTokens((prev) => [...prev, role]);
  };

  // 退格
  const handleBackspace = () => {
    setTokens((prev) => prev.slice(0, -1));
  };

  // 清空
  const handleClear = () => {
    setTokens([]);
  };

  // 语音播报
  const handleSpeak = () => {
    if (result.length > 0) {
      const modeText = reverse ? '对方应该叫你' : '你应该叫';
      const titles = result.join('或者');
      speakText(`${modeText}：${titles}`);
    } else {
      speakText('未知称呼，可能关系较远');
    }
  };

  const KEY_BTNS = [
    { label: '父', value: '爸爸' },
    { label: '母', value: '妈妈' },
    { label: '兄', value: '哥哥' },
    { label: '弟', value: '弟弟' },
    { label: '姐', value: '姐姐' },
    { label: '妹', value: '妹妹' },
    { label: '夫', value: '老公' },
    { label: '妻', value: '老婆' },
    { label: '子', value: '儿子' },
    { label: '女', value: '女儿' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
      <AppPageHeader title="亲戚称谓计算器" onBack={() => navigate(-1)} />

      <main className="flex-1 w-full space-y-4">
        {/* 性别与称呼方向设置 */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 pl-1">
            <span>我的性别:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-xl">
              <button
                onClick={() => setSex(1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sex === 1 ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                男
              </button>
              <button
                onClick={() => setSex(0)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sex === 0 ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                女
              </button>
            </div>
          </div>

          <button
            onClick={() => setReverse(!reverse)}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all active:scale-95"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>{reverse ? '对方称呼我' : '我称呼对方'}</span>
          </button>
        </div>

        {/* 关系链与结果卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-1">关系链</div>
            <div className="min-h-[2.5rem] bg-slate-50 p-3 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 break-all flex items-center">
              {expression ? `我 的 ${expression}` : '点击下方按钮输入关系链...'}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold text-slate-400">
                {reverse ? '对方应称呼你为：' : '你应称呼对方为：'}
              </span>
              {result.length > 0 && (
                <button
                  onClick={handleSpeak}
                  className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 transition-all"
                  title="朗读称谓"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="min-h-[3.5rem] flex items-center justify-center bg-indigo-50/60 rounded-2xl border border-indigo-100 p-3">
              {result.length > 0 ? (
                <span className="text-2xl font-black text-indigo-600 tracking-tight">
                  {result.join(' 或 ')}
                </span>
              ) : expression ? (
                <span className="text-xs font-bold text-slate-400">
                  关系较远或称呼复杂，暂未查询到标准称谓
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-300">等待输入</span>
              )}
            </div>
          </div>
        </div>

        {/* 关系键盘 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5">
          <div className="grid grid-cols-5 gap-2">
            {KEY_BTNS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => handleAdd(btn.value)}
                className="py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-2xl text-base font-black text-slate-700 hover:text-indigo-600 active:scale-95 transition-all shadow-sm"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleBackspace}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Delete className="w-4 h-4" />
              回退一步
            </button>
            <button
              onClick={handleClear}
              className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              清空
            </button>
          </div>
        </div>

        {/* 说明 */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>支持多层亲戚关系链解析，涵盖近亲与远亲标准称呼规范</span>
        </div>
      </main>
      </div>
    </div>
  );
}
