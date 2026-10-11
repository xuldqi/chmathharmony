import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

// 求最大公约数 (辗转相除法)
function getGcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

// 求最小公倍数
function getLcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / getGcd(a, b));
}

// 质因数分解
function primeFactors(n: number): { [prime: number]: number } {
  let num = Math.abs(n);
  const factors: { [prime: number]: number } = {};
  if (num <= 1) return factors;

  let d = 2;
  while (d * d <= num) {
    while (num % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      num /= d;
    }
    d++;
  }
  if (num > 1) {
    factors[num] = (factors[num] || 0) + 1;
  }
  return factors;
}

function formatFactors(factors: { [prime: number]: number }): string {
  const keys = Object.keys(factors).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return '无';
  return keys
    .map(p => (factors[p] > 1 ? `${p}^${factors[p]}` : `${p}`))
    .join(' × ');
}

export default function GcdLcmCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [numCount, setNumCount] = useState<2 | 3>(2);
  const [val1, setVal1] = useState<string>('24');
  const [val2, setVal2] = useState<string>('36');
  const [val3, setVal3] = useState<string>('60');

  const parsedNumbers = useMemo(() => {
    const n1 = parseInt(val1, 10);
    const n2 = parseInt(val2, 10);
    const n3 = parseInt(val3, 10);

    const validN1 = isNaN(n1) || n1 <= 0 ? 1 : n1;
    const validN2 = isNaN(n2) || n2 <= 0 ? 1 : n2;
    const validN3 = isNaN(n3) || n3 <= 0 ? 1 : n3;

    return numCount === 2 ? [validN1, validN2] : [validN1, validN2, validN3];
  }, [numCount, val1, val2, val3]);

  // 计算结果
  const result = useMemo(() => {
    if (parsedNumbers.length === 2) {
      const [a, b] = parsedNumbers;
      const gcd = getGcd(a, b);
      const lcm = getLcm(a, b);
      const factorsA = primeFactors(a);
      const factorsB = primeFactors(b);
      return {
        gcd,
        lcm,
        factors: [
          { num: a, text: formatFactors(factorsA) },
          { num: b, text: formatFactors(factorsB) },
        ],
        steps: `根据质因数分解：\n${a} = ${formatFactors(factorsA)}\n${b} = ${formatFactors(factorsB)}\n最大公因数即提取两者共有质因数的最低次幂之积 = ${gcd}；\n最小公倍数即提取所有质因数的最高次幂之积 = ${lcm}。`,
      };
    } else {
      const [a, b, c] = parsedNumbers;
      const gcd = getGcd(getGcd(a, b), c);
      const lcm = getLcm(getLcm(a, b), c);
      const factorsA = primeFactors(a);
      const factorsB = primeFactors(b);
      const factorsC = primeFactors(c);
      return {
        gcd,
        lcm,
        factors: [
          { num: a, text: formatFactors(factorsA) },
          { num: b, text: formatFactors(factorsB) },
          { num: c, text: formatFactors(factorsC) },
        ],
        steps: `根据质因数分解：\n${a} = ${formatFactors(factorsA)}\n${b} = ${formatFactors(factorsB)}\n${c} = ${formatFactors(factorsC)}\n三个数的最大公因数为 ${gcd}，最小公倍数为 ${lcm}。`,
      };
    }
  }, [parsedNumbers]);

  const handleSpeak = () => {
    const text = numCount === 2
      ? `${parsedNumbers[0]}与${parsedNumbers[1]}的最大公约数是${result.gcd}，最小公倍数是${result.lcm}。`
      : `${parsedNumbers[0]}、${parsedNumbers[1]}与${parsedNumbers[2]}的最大公约数是${result.gcd}，最小公倍数是${result.lcm}。`;
    speakText(text);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="公约数与公倍数"
          subtitle="GCD & LCM 与分解质因数"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 输入区 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setNumCount(2)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                numCount === 2
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              计算 2 个整数
            </button>
            <button
              onClick={() => setNumCount(3)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                numCount === 3
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              计算 3 个整数
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">第一个数 (A)</label>
              <input
                type="number"
                min="1"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                className="w-36 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">第二个数 (B)</label>
              <input
                type="number"
                min="1"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                className="w-36 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            {numCount === 3 && (
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">第三个数 (C)</label>
                <input
                  type="number"
                  min="1"
                  value={val3}
                  onChange={(e) => setVal3(e.target.value)}
                  className="w-36 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* 结果看板 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400">计算结果</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-emerald-600 mb-1">最大公因数 (GCD)</span>
              <span className="text-3xl font-black text-emerald-700">{result.gcd}</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-indigo-600 mb-1">最小公倍数 (LCM)</span>
              <span className="text-3xl font-black text-indigo-700">{result.lcm}</span>
            </div>
          </div>
        </div>

        {/* 质因数分解明细 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">质因数分解</span>
          <div className="flex flex-col gap-2">
            {result.factors.map(f => (
              <div
                key={f.num}
                className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-sm font-black text-slate-800"
              >
                <span>{f.num}</span>
                <span className="text-emerald-600 font-extrabold">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 推导原理解释 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">解析步骤：</span>
          <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {result.steps}
          </pre>
        </div>
      </main>
    </div>
  );
}
