import AppPageHeader from '@/components/AppPageHeader';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

type Operator = '+' | '-' | '×' | '÷';

interface CardItem {
  id: number;
  val: number;
  used: boolean;
}

// 24点穷举求解器
function solve24All(nums: number[]): string[] {
  if (nums.length !== 4) return [];
  const results = new Set<string>();
  const ops: Operator[] = ['+', '-', '×', '÷'];

  const calc = (a: number, b: number, op: Operator): number | null => {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '×') return a * b;
    if (op === '÷') return Math.abs(b) < 1e-7 ? null : a / b;
    return null;
  };

  // 全排列
  const permute = (arr: number[]): number[][] => {
    if (arr.length <= 1) return [arr];
    const res: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of permute(rest)) {
        res.push([arr[i], ...p]);
      }
    }
    return res;
  };

  const perms = permute(nums);
  // 遍历所有排列
  for (const [a, b, c, d] of perms) {
    for (const op1 of ops) {
      for (const op2 of ops) {
        for (const op3 of ops) {
          // 结构 1: ((a op1 b) op2 c) op3 d
          const r1 = calc(a, b, op1);
          if (r1 !== null) {
            const r2 = calc(r1, c, op2);
            if (r2 !== null) {
              const r3 = calc(r2, d, op3);
              if (r3 !== null && Math.abs(r3 - 24) < 1e-6) {
                results.add(`((${a} ${op1} ${b}) ${op2} ${c}) ${op3} ${d}`);
              }
            }
          }

          // 结构 2: (a op1 (b op2 c)) op3 d
          const r4 = calc(b, c, op2);
          if (r4 !== null) {
            const r5 = calc(a, r4, op1);
            if (r5 !== null) {
              const r6 = calc(r5, d, op3);
              if (r6 !== null && Math.abs(r6 - 24) < 1e-6) {
                results.add(`(${a} ${op1} (${b} ${op2} ${c})) ${op3} ${d}`);
              }
            }
          }

          // 结构 3: (a op1 b) op2 (c op3 d)
          const r7 = calc(a, b, op1);
          const r8 = calc(c, d, op3);
          if (r7 !== null && r8 !== null) {
            const r9 = calc(r7, r8, op2);
            if (r9 !== null && Math.abs(r9 - 24) < 1e-6) {
              results.add(`(${a} ${op1} ${b}) ${op2} (${c} ${op3} ${d})`);
            }
          }

          // 结构 4: a op1 ((b op2 c) op3 d)
          const r10 = calc(b, c, op2);
          if (r10 !== null) {
            const r11 = calc(r10, d, op3);
            if (r11 !== null) {
              const r12 = calc(a, r11, op1);
              if (r12 !== null && Math.abs(r12 - 24) < 1e-6) {
                results.add(`${a} ${op1} ((${b} ${op2} ${c}) ${op3} ${d})`);
              }
            }
          }

          // 结构 5: a op1 (b op2 (c op3 d))
          const r13 = calc(c, d, op3);
          if (r13 !== null) {
            const r14 = calc(b, r13, op2);
            if (r14 !== null) {
              const r15 = calc(a, r14, op1);
              if (r15 !== null && Math.abs(r15 - 24) < 1e-6) {
                results.add(`${a} ${op1} (${b} ${op2} (${c} ${op3} ${d}))`);
              }
            }
          }
        }
      }
    }
  }

  return Array.from(results);
}

// 生成保证有解的4个数字 (1~10)
function generateSolvable24(): number[] {
  for (let attempt = 0; attempt < 500; attempt++) {
    const nums = [
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
    ];
    if (solve24All(nums).length > 0) {
      return nums;
    }
  }
  return [3, 3, 8, 8];
}

interface Token {
  type: 'card' | 'op' | 'paren';
  cardId?: number;
  val: string;
  num?: number;
}

export default function Game24() {
  const navigate = useNavigate();
  const { speakText } = useAudio();
  const isTab = useIsCurrentTab('/game-24');

  const [cards, setCards] = useState<CardItem[]>(() => {
    const initial = generateSolvable24();
    return initial.map((v, i) => ({ id: i, val: v, used: false }));
  });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [customInputMode, setCustomInputMode] = useState<boolean>(false);
  const [customNumbers, setCustomNumbers] = useState<string>('3 3 8 8');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 所有可能解法
  const allSolutions = useMemo(() => {
    const rawNums = cards.map(c => c.val);
    return solve24All(rawNums);
  }, [cards]);

  // 新一局
  const handleNewDeal = useCallback(() => {
    const nextNums = generateSolvable24();
    setCards(nextNums.map((v, i) => ({ id: i, val: v, used: false })));
    setTokens([]);
    setShowSolutions(false);
    setStatusMessage(null);
    speakText('新一局24点，开始挑战吧！');
  }, [speakText]);

  // 自定义生成
  const handleApplyCustom = () => {
    const parts = customNumbers.trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 13);
    if (parts.length !== 4) {
      setStatusMessage({ text: '请输入4个1~13之间的数字，用空格隔开', isError: true });
      return;
    }
    setCards(parts.map((v, i) => ({ id: i, val: v, used: false })));
    setTokens([]);
    setShowSolutions(false);
    setStatusMessage(null);
    setCustomInputMode(false);
    speakText('已生成自定义题目');
  };

  // 点击数字牌
  const handleCardClick = (card: CardItem) => {
    if (card.used) return;
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, used: true } : c));
    setTokens(prev => [...prev, { type: 'card', cardId: card.id, val: `${card.val}`, num: card.val }]);
    setStatusMessage(null);
  };

  // 点击操作符或括号
  const handleSymbolClick = (symbol: string, type: 'op' | 'paren') => {
    setTokens(prev => [...prev, { type, val: symbol }]);
    setStatusMessage(null);
  };

  // 回退上一步
  const handleBackspace = () => {
    if (tokens.length === 0) return;
    const last = tokens[tokens.length - 1];
    if (last.type === 'card' && last.cardId !== undefined) {
      setCards(prev => prev.map(c => c.id === last.cardId ? { ...c, used: false } : c));
    }
    setTokens(prev => prev.slice(0, -1));
    setStatusMessage(null);
  };

  // 清空表达式
  const handleClear = () => {
    setCards(prev => prev.map(c => ({ ...c, used: false })));
    setTokens([]);
    setStatusMessage(null);
  };

  // 计算并验证算式
  const handleVerify = () => {
    // 检查是否用完了 4 张卡牌
    const usedCount = cards.filter(c => c.used).length;
    if (usedCount < 4) {
      setStatusMessage({ text: `还有 ${4 - usedCount} 张卡牌没有使用哦，每张牌必须用一次！`, isError: true });
      speakText('每张牌必须刚好使用一次哦');
      return;
    }

    // 将当前表达式拼装并安全计算
    const expr = tokens.map(t => {
      if (t.val === '×') return '*';
      if (t.val === '÷') return '/';
      return t.val;
    }).join(' ');

    try {
      // 语法安全性检测：只允许数字、括号与四则运算符
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        throw new Error('无效字符');
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('计算错误');
      }

      if (Math.abs(result - 24) < 1e-6) {
        setStatusMessage({ text: '太棒了！算式等于 24，挑战成功！', isError: false });
        setWinStreak(prev => prev + 1);
        speakText('太棒了！成功算出24点！');
      } else {
        const formatted = Number.isInteger(result) ? result : result.toFixed(2);
        setStatusMessage({ text: `当前算式结果为 ${formatted}，不等于 24，再试一次吧！`, isError: true });
        speakText(`算式结果是${formatted}，再试试吧`);
      }
    } catch {
      setStatusMessage({ text: '算式语法不正确，请检查括号与运算符！', isError: true });
      speakText('算式不完整或括号不匹配');
    }
  };

  return (
    <div className={`min-h-screen bg-[#F3F4F6] text-slate-700 flex flex-col font-sans select-none px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? "pb-28" : "pb-12"}`}>
      {/* 顶部标题栏 */}
      <AppPageHeader
          title="24点益智速算"
          subtitle={`连胜: {winStreak} 局`}
          showBack={!isTab}
          onBack={isTab ? undefined : () => navigate(-1)}
          rightElement={
            <button onClick={handleNewDeal} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition-all">重新发牌</button>
          }
        />

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4">
        {/* 卡牌展示区 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-400">点击卡牌放入算式</span>
            <button
              onClick={() => setCustomInputMode(prev => !prev)}
              className="text-xs font-bold text-indigo-500 hover:underline"
            >
              {customInputMode ? '关闭自定义' : '自定义数字'}
            </button>
          </div>

          {customInputMode && (
            <div className="bg-indigo-50/60 p-3 rounded-2xl flex flex-col gap-2 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700">输入4个数字 (1~13，空格隔开)：</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customNumbers}
                  onChange={(e) => setCustomNumbers(e.target.value)}
                  placeholder="例如: 3 3 8 8"
                  className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleApplyCustom}
                  className="bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  确定
                </button>
              </div>
            </div>
          )}

          {/* 4张卡牌 */}
          <div className="grid grid-cols-4 gap-3">
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={c.used}
                onClick={() => handleCardClick(c)}
                className={`aspect-3/4 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  c.used
                    ? 'bg-slate-100 border-2 border-dashed border-slate-200 opacity-40 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-b from-white to-rose-50/40 border-2 border-rose-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer'
                }`}
                style={{
                  boxShadow: c.used ? 'none' : '0 4px 0 #FECDD3',
                }}
              >
                <span className="text-xs text-rose-400 font-extrabold mb-1">♠</span>
                <span className="text-3xl font-black text-rose-600">{c.val}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 算式输入与预览区 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
            <span>当前拼装算式</span>
            <span>目标: 24</span>
          </div>
          <div className="min-h-[64px] bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-center flex-wrap gap-1.5 text-xl font-black text-slate-800">
            {tokens.length === 0 ? (
              <span className="text-slate-300 text-sm font-medium">请点击卡牌与运算符构建算式</span>
            ) : (
              tokens.map((t, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-lg ${
                    t.type === 'card'
                      ? 'bg-rose-100 text-rose-700 font-black'
                      : t.type === 'op'
                      ? 'bg-amber-100 text-amber-800 font-black'
                      : 'bg-indigo-100 text-indigo-700 font-black'
                  }`}
                >
                  {t.val}
                </span>
              ))
            )}
          </div>

          {/* 状态反馈 */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-center text-xs font-bold ${
                statusMessage.isError
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* 符号操作键盘 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2.5">
            {(['+', '-', '×', '÷'] as const).map(op => (
              <button
                key={op}
                type="button"
                onClick={() => handleSymbolClick(op, 'op')}
                className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-2xl font-black shadow-md active:scale-95 transition-all"
                style={{ boxShadow: '0 4px 0 #D97706' }}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => handleSymbolClick('(', 'paren')}
              className="py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xl font-black active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 0 #CBD5E1' }}
            >
              (
            </button>
            <button
              type="button"
              onClick={() => handleSymbolClick(')', 'paren')}
              className="py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xl font-black active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 0 #CBD5E1' }}
            >
              )
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-black active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 0 #FECDD3' }}
            >
              ⌫ 撤销
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-600 text-sm font-black active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 0 #CBD5E1' }}
            >
              清空
            </button>
          </div>

          {/* 提交验证按钮 */}
          <button
            type="button"
            onClick={handleVerify}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-black shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '0 5px 0 #059669' }}
          >
            <span>验证结果 = 24</span>
          </button>
        </div>

        {/* 提示与解法区 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">想不出答案？</span>
            <button
              onClick={() => {
                const nextState = !showSolutions;
                setShowSolutions(nextState);
                if (nextState) {
                  if (allSolutions.length > 0) {
                    speakText(`这道题共有${allSolutions.length}种解法，比如：${allSolutions[0]}`);
                  } else {
                    speakText('这组数字无解哦');
                  }
                }
              }}
              className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 active:scale-95 transition-all"
            >
              {showSolutions ? '收起解法' : `查看解法 (${allSolutions.length} 种)`}
            </button>
          </div>

          {showSolutions && (
            <div className="mt-2 bg-slate-50 rounded-2xl p-3 border border-slate-200 max-h-48 overflow-y-auto">
              {allSolutions.length === 0 ? (
                <div className="text-xs text-rose-500 font-bold text-center py-2">
                  经计算机全排列搜索，这4个数字无解！
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1">
                    系统为您找到的解法：
                  </div>
                  {allSolutions.slice(0, 10).map((sol, index) => (
                    <div
                      key={index}
                      className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 flex justify-between items-center"
                    >
                      <span>{sol} = 24</span>
                      <button
                        onClick={() => speakText(sol.replace(/×/g, '乘').replace(/÷/g, '除以'))}
                        className="text-[10px] text-indigo-600 hover:underline"
                      >
                        朗读
                      </button>
                    </div>
                  ))}
                  {allSolutions.length > 10 && (
                    <div className="text-[10px] text-slate-400 text-center py-1">
                      仅展示前 10 种解法
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {isTab && <MainTabBar />}
    </div>
  );
}
