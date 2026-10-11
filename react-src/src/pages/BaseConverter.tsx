import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

export default function BaseConverter() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 当前主数值（以 32 位无符号整数存储）
  const [value, setValue] = useState<number>(42);

  // 位运算副数值
  const [opValB, setOpValB] = useState<number>(15);

  // 格式化输出
  const decStr = useMemo(() => value.toString(10), [value]);
  const binStr = useMemo(() => (value >>> 0).toString(2), [value]);
  const hexStr = useMemo(() => (value >>> 0).toString(16).toUpperCase(), [value]);
  const octStr = useMemo(() => (value >>> 0).toString(8), [value]);

  // 生成 16 位数组 (从高位到低位: bit 15 down to 0)
  const bits16 = useMemo(() => {
    const arr: number[] = [];
    for (let i = 15; i >= 0; i--) {
      arr.push((value >> i) & 1);
    }
    return arr;
  }, [value]);

  // 翻转某一指定 bit
  const handleToggleBit = (bitIndexFromRight: number) => {
    const mask = 1 << bitIndexFromRight;
    const nextVal = value ^ mask;
    setValue(nextVal >= 0 ? nextVal : 0);
  };

  // 用户修改输入
  const handleDecChange = (v: string) => {
    const n = parseInt(v, 10);
    setValue(isNaN(n) ? 0 : Math.max(0, n));
  };

  const handleBinChange = (v: string) => {
    const clean = v.replace(/[^01]/g, '');
    const n = parseInt(clean, 2);
    setValue(isNaN(n) ? 0 : n);
  };

  const handleHexChange = (v: string) => {
    const clean = v.replace(/[^0-9a-fA-F]/g, '');
    const n = parseInt(clean, 16);
    setValue(isNaN(n) ? 0 : n);
  };

  const handleOctChange = (v: string) => {
    const clean = v.replace(/[^0-7]/g, '');
    const n = parseInt(clean, 8);
    setValue(isNaN(n) ? 0 : n);
  };

  // 位运算结果
  const bitwiseResults = useMemo(() => {
    const a = value;
    const b = opValB;
    return {
      and: a & b,
      or: a | b,
      xor: a ^ b,
      notA: ~a >>> 0,
      shl: (a << 1) >>> 0,
      shr: a >> 1,
    };
  }, [value, opValB]);

  const handleSpeak = () => {
    speakText(`十进制为${decStr}，二进制为${binStr}，十六进制为${hexStr}`);
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
          <h1 className="text-lg font-black text-slate-800">进制转换与位运算</h1>
          <span className="text-xs font-semibold text-cyan-600">BIN / OCT / DEC / HEX</span>
        </div>
        <button
          onClick={handleSpeak}
          className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          语音播报
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {/* 四大进制输入输出 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3.5">
          <span className="text-xs font-bold text-slate-400">四大进制实时互转</span>

          <div className="flex flex-col gap-2.5">
            {/* 十进制 */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-black text-slate-500 w-24">10进制 (DEC)</span>
              <input
                type="text"
                value={decStr}
                onChange={(e) => handleDecChange(e.target.value)}
                className="flex-1 bg-transparent text-right font-black text-slate-800 text-lg focus:outline-hidden"
              />
            </div>

            {/* 二进制 */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-black text-cyan-600 w-24">2进制 (BIN)</span>
              <input
                type="text"
                value={binStr}
                onChange={(e) => handleBinChange(e.target.value)}
                className="flex-1 bg-transparent text-right font-mono font-black text-cyan-700 text-base focus:outline-hidden"
              />
            </div>

            {/* 十六进制 */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-black text-indigo-600 w-24">16进制 (HEX)</span>
              <input
                type="text"
                value={hexStr}
                onChange={(e) => handleHexChange(e.target.value)}
                className="flex-1 bg-transparent text-right font-mono font-black text-indigo-700 text-lg focus:outline-hidden"
              />
            </div>

            {/* 八进制 */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-black text-amber-600 w-24">8进制 (OCT)</span>
              <input
                type="text"
                value={octStr}
                onChange={(e) => handleOctChange(e.target.value)}
                className="flex-1 bg-transparent text-right font-mono font-black text-amber-700 text-lg focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 交互式 Bit 开关面板 (16位) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">位开关交互 (点击任意位翻转 0/1)</span>
            <span className="text-[10px] text-cyan-600 font-extrabold">低位 0 ~ 高位 15</span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 bg-slate-100 p-2.5 rounded-2xl">
            {bits16.map((b, idx) => {
              const bitPos = 15 - idx;
              return (
                <button
                  key={bitPos}
                  type="button"
                  onClick={() => handleToggleBit(bitPos)}
                  className={`py-2 rounded-xl flex flex-col items-center justify-center font-black transition-all active:scale-95 ${
                    b === 1
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'bg-white text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{b}</span>
                  <span className="text-[9px] opacity-75">{bitPos}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 常用位运算演示 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">位运算操作 (与数值 B 联动)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">B =</span>
              <input
                type="number"
                min="0"
                value={opValB}
                onChange={(e) => setOpValB(parseInt(e.target.value, 10) || 0)}
                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-right font-black text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">A & B (AND)</span>
              <span className="text-base font-black text-slate-800">{bitwiseResults.and}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">A | B (OR)</span>
              <span className="text-base font-black text-slate-800">{bitwiseResults.or}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">A ^ B (XOR)</span>
              <span className="text-base font-black text-slate-800">{bitwiseResults.xor}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">A &lt;&lt; 1 (左移)</span>
              <span className="text-base font-black text-slate-800">{bitwiseResults.shl}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">A &gt;&gt; 1 (右移)</span>
              <span className="text-base font-black text-slate-800">{bitwiseResults.shr}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">~A (取反)</span>
              <span className="text-base font-black text-slate-800 truncate" title={`${bitwiseResults.notA}`}>
                {bitwiseResults.notA}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
