import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

// 计算阶乘
function factorial(num: number): number {
  if (num < 0) return 0;
  if (num === 0 || num === 1) return 1;
  let res = 1;
  for (let i = 2; i <= num; i++) {
    res *= i;
  }
  return res;
}

// 排列数 A(n, m)
function permutation(n: number, m: number): number {
  if (m < 0 || m > n) return 0;
  let res = 1;
  for (let i = 0; i < m; i++) {
    res *= (n - i);
  }
  return res;
}

// 组合数 C(n, m)
function combination(n: number, m: number): number {
  if (m < 0 || m > n) return 0;
  const k = Math.min(m, n - m);
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

// 生成杨辉三角前 rows 行
function generatePascal(rows: number): number[][] {
  const triangle: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [1];
    for (let c = 1; c < r; c++) {
      row.push(triangle[r - 1][c - 1] + triangle[r - 1][c]);
    }
    if (r > 0) row.push(1);
    triangle.push(row);
  }
  return triangle;
}

export default function PermutationCombination() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [valN, setValN] = useState<string>('6');
  const [valM, setValM] = useState<string>('2');

  const n = Math.max(0, parseInt(valN, 10) || 0);
  const m = Math.max(0, parseInt(valM, 10) || 0);

  const result = useMemo(() => {
    if (m > n) {
      return {
        error: '选取数 m 不能大于总数 n',
        pVal: 0,
        cVal: 0,
        nFact: 0,
        mFact: 0,
      };
    }

    const pVal = permutation(n, m);
    const cVal = combination(n, m);
    const nFact = n <= 20 ? factorial(n) : Infinity;
    const mFact = m <= 20 ? factorial(m) : Infinity;

    return {
      error: null,
      pVal,
      cVal,
      nFact,
      mFact,
      steps: `排列公式：A(${n}, ${m}) = ${n}! / (${n}-${m})! = ${pVal}\n组合公式：C(${n}, ${m}) = ${n}! / (${m}! × (${n}-${m})!) = ${cVal}\n根据互补性质：C(${n}, ${m}) = C(${n}, ${n - m}) = ${cVal}`,
    };
  }, [n, m]);

  // 杨辉三角预览
  const pascalTriangle = useMemo(() => generatePascal(Math.min(7, Math.max(4, n + 1))), [n]);

  const handleSpeak = () => {
    if (result.error) {
      speakText(result.error);
      return;
    }
    speakText(`从${n}个元素中选${m}个，排列数A为${result.pVal}，组合数C为${result.cVal}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-12">
      {/* 顶部导航 */}
      <AppPageHeader
          title="排列组合与概率"
          subtitle="A(n,m) 与 C(n,m) 计算"
          onBack={() => navigate(-1)}
          rightElement={
            <button onClick={handleSpeak} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all">语音播报</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 输入参数 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400">参数设定 (0 ≤ m ≤ n)</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">总数 (n)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={valN}
                onChange={(e) => setValN(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-black text-slate-800 text-lg"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">抽取数 (m)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={valM}
                onChange={(e) => setValM(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-black text-slate-800 text-lg"
              />
            </div>
          </div>
        </div>

        {/* 结果展示 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">计算结果</span>
          {result.error ? (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-center text-xs font-bold border border-rose-100">
              {result.error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-purple-600 mb-0.5">排列数 A(n, m)</span>
                <span className="text-2xl font-black text-purple-800">{result.pVal}</span>
                <span className="text-[10px] text-purple-400 mt-1">考虑前后顺序</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-indigo-600 mb-0.5">组合数 C(n, m)</span>
                <span className="text-2xl font-black text-indigo-800">{result.cVal}</span>
                <span className="text-[10px] text-indigo-400 mt-1">不考虑顺序</span>
              </div>
            </div>
          )}

          {!result.error && (
            <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">详细公式步骤：</span>
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{result.steps}</pre>
            </div>
          )}
        </div>

        {/* 杨辉三角展开与二项式系数 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">杨辉三角 (二项式展开系数)</span>
            <span className="text-[10px] font-bold text-purple-600">第 {n} 行即为 C({n}, k)</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center gap-1.5 overflow-x-auto">
            {pascalTriangle.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-2 justify-center">
                {row.map((val, cIdx) => (
                  <span
                    key={cIdx}
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      rIdx === n && (cIdx === m || cIdx === n - m)
                        ? 'bg-purple-600 text-white font-black shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {val}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
