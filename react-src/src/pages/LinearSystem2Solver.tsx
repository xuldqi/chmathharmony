import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';
import { Volume2, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';

export default function LinearSystem2Solver() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 方程 1: a1*x + b1*y = c1
  const [a1, setA1] = useState<string>('2');
  const [b1, setB1] = useState<string>('3');
  const [c1, setC1] = useState<string>('7');

  // 方程 2: a2*x + b2*y = c2
  const [a2, setA2] = useState<string>('1');
  const [b2, setB2] = useState<string>('-1');
  const [c2, setC2] = useState<string>('1');

  const solution = useMemo(() => {
    const numA1 = parseFloat(a1);
    const numB1 = parseFloat(b1);
    const numC1 = parseFloat(c1);

    const numA2 = parseFloat(a2);
    const numB2 = parseFloat(b2);
    const numC2 = parseFloat(c2);

    if (isNaN(numA1) || isNaN(numB1) || isNaN(numC1) || isNaN(numA2) || isNaN(numB2) || isNaN(numC2)) {
      return null;
    }

    // 主行列式 D = a1*b2 - a2*b1
    const D = numA1 * numB2 - numA2 * numB1;
    // Dx = c1*b2 - c2*b1
    const Dx = numC1 * numB2 - numC2 * numB1;
    // Dy = a1*c2 - a2*c1
    const Dy = numA1 * numC2 - numA2 * numC1;

    const EPS = 1e-9;

    if (Math.abs(D) < EPS) {
      if (Math.abs(Dx) < EPS && Math.abs(Dy) < EPS) {
        return {
          type: 'infinite',
          statusText: '方程组有无穷多个解 (两直线重合)',
          D, Dx, Dy,
          a1: numA1, b1: numB1, c1: numC1, a2: numA2, b2: numB2, c2: numC2,
        };
      } else {
        return {
          type: 'none',
          statusText: '方程组无解 (两直线平行无交点)',
          D, Dx, Dy,
          a1: numA1, b1: numB1, c1: numC1, a2: numA2, b2: numB2, c2: numC2,
        };
      }
    }

    const xVal = Dx / D;
    const yVal = Dy / D;

    return {
      type: 'unique',
      statusText: '方程组有唯一解',
      x: xVal,
      y: yVal,
      D, Dx, Dy,
      a1: numA1, b1: numB1, c1: numC1, a2: numA2, b2: numB2, c2: numC2,
    };
  }, [a1, b1, c1, a2, b2, c2]);

  const handleVoiceReport = () => {
    if (!solution) {
      speakText('请输入完整的方程组系数');
      return;
    }
    if (solution.type === 'unique') {
      const formatNum = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(2);
      speakText(`方程组解得：x等于${formatNum(solution.x!)}，y等于${formatNum(solution.y!)}`);
    } else {
      speakText(solution.statusText);
    }
  };

  const handleReset = () => {
    setA1('2');
    setB1('3');
    setC1('7');
    setA2('1');
    setB2('-1');
    setC2('1');
  };

  const formatCoeff = (val: number, isFirst: boolean, varName: string) => {
    if (val === 0) return '';
    let sign = '';
    if (!isFirst) {
      sign = val > 0 ? '+ ' : '- ';
    } else if (val < 0) {
      sign = '-';
    }
    const absVal = Math.abs(val);
    const numPart = absVal === 1 ? '' : absVal.toString();
    return `${sign}${numPart}${varName} `;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <AppPageHeader
        title="二元一次方程组求解"
        onBack={() => navigate(-1)}
        rightElement={
          <div className="flex items-center gap-1">
            <button
              onClick={handleVoiceReport}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="语音播报"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="重置"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* 解卡片展示 */}
        {solution && (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-indigo-100 font-medium">解题结果</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-md text-xs font-semibold">
                {solution.statusText}
              </span>
            </div>

            {solution.type === 'unique' ? (
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
                  <div className="text-xs text-indigo-200">未知数 x</div>
                  <div className="text-2xl font-bold mt-0.5">
                    {Number.isInteger(solution.x!) ? solution.x : solution.x!.toFixed(4)}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
                  <div className="text-xs text-indigo-200">未知数 y</div>
                  <div className="text-2xl font-bold mt-0.5">
                    {Number.isInteger(solution.y!) ? solution.y : solution.y!.toFixed(4)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-sm font-medium text-indigo-100">
                {solution.statusText}
              </div>
            )}

            <div className="text-xs text-indigo-200 pt-1 border-t border-white/20 flex justify-between">
              <span>行列式 D = {solution.D}</span>
              <span>Dx = {solution.Dx}</span>
              <span>Dy = {solution.Dy}</span>
            </div>
          </div>
        )}

        {/* 输入两个方程 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            方程组系数设定
          </div>

          {/* 方程 1 */}
          <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div className="text-xs font-medium text-slate-500">方程 ①：a₁x + b₁y = c₁</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={a1}
                onChange={(e) => setA1(e.target.value)}
                placeholder="a1"
                className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold"
              />
              <span className="text-sm font-semibold">x +</span>
              <input
                type="number"
                value={b1}
                onChange={(e) => setB1(e.target.value)}
                placeholder="b1"
                className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold"
              />
              <span className="text-sm font-semibold">y =</span>
              <input
                type="number"
                value={c1}
                onChange={(e) => setC1(e.target.value)}
                placeholder="c1"
                className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold"
              />
            </div>
          </div>

          {/* 方程 2 */}
          <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div className="text-xs font-medium text-slate-500">方程 ②：a₂x + b₂y = c₂</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={a2}
                onChange={(e) => setA2(e.target.value)}
                placeholder="a2"
                className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold"
              />
              <span className="text-sm font-semibold">x +</span>
              <input
                type="number"
                value={b2}
                onChange={(e) => setB2(e.target.value)}
                placeholder="b2"
                className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold"
              />
              <span className="text-sm font-semibold">y =</span>
              <input
                type="number"
                value={c2}
                onChange={(e) => setC2(e.target.value)}
                placeholder="c2"
                className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* 逐步推导解析 */}
        {solution && solution.type === 'unique' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              克莱姆法则 (Cramer) 推导步骤
            </div>
            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-mono">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-slate-400">步骤 1 · 主行列式：</span>
                <br />
                D = a₁·b₂ - a₂·b₁ = ({solution.a1})×({solution.b2}) - ({solution.a2})×({solution.b1}) = {solution.D}
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-slate-400">步骤 2 · x 的行列式：</span>
                <br />
                Dx = c₁·b₂ - c₂·b₁ = ({solution.c1})×({solution.b2}) - ({solution.c2})×({solution.b1}) = {solution.Dx}
                <br />
                x = Dx / D = {solution.Dx} / {solution.D} = {Number.isInteger(solution.x!) ? solution.x : solution.x!.toFixed(4)}
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-slate-400">步骤 3 · y 的行列式：</span>
                <br />
                Dy = a₁·c₂ - a₂·c₁ = ({solution.a1})×({solution.c2}) - ({solution.a2})×({solution.c1}) = {solution.Dy}
                <br />
                y = Dy / D = {solution.Dy} / {solution.D} = {Number.isInteger(solution.y!) ? solution.y : solution.y!.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
