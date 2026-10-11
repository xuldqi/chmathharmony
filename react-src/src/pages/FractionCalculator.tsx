import React, { useState, useCallback, useRef } from 'react';
import MainTabBar from '@/components/MainTabBar';
import { useAudio } from '@/hooks/useAudio';
import HistoryStorage from '@/lib/historyStorage';
import '../styles/calculator-page.css';

const BackspaceIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z" />
  </svg>
);

// 最大公约数
function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1n;
}

// ────────────────── 分数类 (移植自 newcal 验证算法) ──────────────────
class Fraction {
  public numerator: bigint;    // 分子 (绝对值)
  public denominator: bigint;  // 分母 (绝对值, >0)
  public sign: number;         // 符号: +1 或 -1

  constructor(numerator: bigint | number = 0n, denominator: bigint | number = 1n, sign: number = 1) {
    let num = BigInt(numerator);
    let den = BigInt(denominator);
    let s = sign;

    if (num < 0n) {
      num = -num;
      s = -s;
    }
    if (den < 0n) {
      den = -den;
      s = -s;
    }
    if (den === 0n) {
      den = 1n;
    }
    this.numerator = num;
    this.denominator = den;
    this.sign = num === 0n ? 1 : (s < 0 ? -1 : 1);
  }

  private findGCD(a: bigint, b: bigint): bigint {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1n;
  }

  simplify(): Fraction {
    if (this.numerator === 0n) {
      return new Fraction(0n, 1n, 1);
    }
    const gcd = this.findGCD(this.numerator, this.denominator);
    return new Fraction(
      this.numerator / gcd,
      this.denominator / gcd,
      this.sign
    );
  }

  add(other: Fraction): Fraction {
    const numA = this.numerator * BigInt(this.sign);
    const numB = other.numerator * BigInt(other.sign);
    const commonDen = this.denominator * other.denominator;
    const resNum = numA * other.denominator + numB * this.denominator;
    return new Fraction(
      resNum >= 0n ? resNum : -resNum,
      commonDen,
      resNum >= 0n ? 1 : -1
    ).simplify();
  }

  subtract(other: Fraction): Fraction {
    const numA = this.numerator * BigInt(this.sign);
    const numB = other.numerator * BigInt(other.sign);
    const commonDen = this.denominator * other.denominator;
    const resNum = numA * other.denominator - numB * this.denominator;
    return new Fraction(
      resNum >= 0n ? resNum : -resNum,
      commonDen,
      resNum >= 0n ? 1 : -1
    ).simplify();
  }

  multiply(other: Fraction): Fraction {
    const res = new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator,
      this.sign * other.sign
    );
    return res.simplify();
  }

  divide(other: Fraction): Fraction {
    if (other.numerator === 0n) {
      throw new Error('除数不能为0');
    }
    const res = new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator,
      this.sign * other.sign
    );
    return res.simplify();
  }

  toMixedNumber(): { wholePart: string; numerator: string; denominator: string; sign: number } {
    if (this.numerator === 0n) {
      return { wholePart: '0', numerator: '0', denominator: '1', sign: 1 };
    }
    if (this.denominator === 1n) {
      return {
        wholePart: this.numerator.toString(),
        numerator: '0',
        denominator: '1',
        sign: this.sign,
      };
    }
    if (this.numerator < this.denominator) {
      return {
        wholePart: '0',
        numerator: this.numerator.toString(),
        denominator: this.denominator.toString(),
        sign: this.sign,
      };
    }
    const whole = this.numerator / this.denominator;
    const rem = this.numerator % this.denominator;
    return {
      wholePart: whole.toString(),
      numerator: rem.toString(),
      denominator: this.denominator.toString(),
      sign: this.sign,
    };
  }

  toDecimal(): number {
    const val = Number(this.numerator) / Number(this.denominator);
    return this.sign === -1 ? -val : val;
  }

  isZero(): boolean {
    return this.numerator === 0n;
  }

  clone(): Fraction {
    return new Fraction(this.numerator, this.denominator, this.sign);
  }
}

// ────────────────── 分数标准水平线渲染组件（绝无斜杠 /） ──────────────────
const FractionVisual: React.FC<{
  fraction: Fraction;
  size?: 'large' | 'formula' | 'medium' | 'small';
}> = ({ fraction, size = 'formula' }) => {
  if (fraction.isZero()) {
    return (
      <span className={size === 'large' ? 'text-4xl font-extrabold' : size === 'formula' ? 'text-2xl font-bold' : 'font-bold'}>
        0
      </span>
    );
  }

  const mixed = fraction.toMixedNumber();
  const hasWhole = mixed.wholePart !== '0';
  const hasFrac = mixed.numerator !== '0';
  const isNeg = mixed.sign === -1;

  if (!hasFrac) {
    // 纯整数
    return (
      <span className={size === 'large' ? 'text-4xl font-extrabold' : size === 'formula' ? 'text-2xl font-bold' : 'font-bold'}>
        {isNeg ? '-' : ''}{mixed.wholePart}
      </span>
    );
  }

  const wholeClass =
    size === 'large'
      ? 'text-4xl font-extrabold mr-1.5'
      : size === 'formula'
      ? 'text-2xl font-extrabold mr-1'
      : size === 'small'
      ? 'text-xs font-bold mr-0.5'
      : 'text-xl font-bold mr-1';

  const numDenClass =
    size === 'large'
      ? 'text-2xl font-black leading-none'
      : size === 'formula'
      ? 'text-base font-black leading-none'
      : size === 'small'
      ? 'text-[11px] font-bold leading-none'
      : 'text-sm font-black leading-none';

  const barClass =
    size === 'large'
      ? 'w-full h-[2.5px] bg-current my-0.5 rounded-full'
      : size === 'formula'
      ? 'w-full h-[2px] bg-current my-0.5 rounded-full'
      : size === 'small'
      ? 'w-full h-[1px] bg-current my-0.5 rounded-full'
      : 'w-full h-[1.5px] bg-current my-0.5 rounded-full';

  return (
    <span className="inline-flex items-center align-middle">
      {isNeg && (
        <span className={size === 'large' ? 'text-3xl font-bold mr-0.5' : size === 'formula' ? 'text-xl font-bold mr-0.5' : 'mr-0.5 font-bold'}>
          -
        </span>
      )}
      {hasWhole && <span className={wholeClass}>{mixed.wholePart}</span>}
      <span className="inline-flex flex-col items-center justify-center">
        <span className={numDenClass}>{mixed.numerator}</span>
        <span className={barClass} />
        <span className={numDenClass}>{mixed.denominator}</span>
      </span>
    </span>
  );
};

// 格式化为历史可读文本（无混淆斜杠，带汉字“又”）
function formatFractionToText(f: Fraction): string {
  if (f.isZero()) return '0';
  const mixed = f.toMixedNumber();
  const hasWhole = mixed.wholePart !== '0';
  const hasFrac = mixed.numerator !== '0';
  const signStr = mixed.sign === -1 ? '-' : '';
  if (hasWhole && hasFrac) {
    return `${signStr}${mixed.wholePart}又${mixed.numerator}/${mixed.denominator}`;
  }
  if (hasWhole) {
    return `${signStr}${mixed.wholePart}`;
  }
  return `${signStr}${mixed.numerator}/${mixed.denominator}`;
}

interface HistoryEntry {
  first: Fraction;
  operator: string;
  second?: Fraction;
  hasEquals?: boolean;
}

export default function FractionCalculator() {
  const { playNumber, playOperator, playDelete, playAudio } = useAudio();

  // 1. 输入状态（完全对齐 newcal 核心算法）
  const [fracWhole, setFracWhole] = useState<string>('0');
  const [fracNum, setFracNum] = useState<string>('0');
  const [fracDen, setFracDen] = useState<string>('0');
  const [fracIsNegative, setFracIsNegative] = useState<boolean>(false);

  // 2. 运算与历史状态
  const [storedFraction, setStoredFraction] = useState<Fraction | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [historyEntry, setHistoryEntry] = useState<HistoryEntry | null>(null);
  const [finalResult, setFinalResult] = useState<Fraction | null>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [memoryValue, setMemoryValue] = useState<Fraction | null>(null);

  const clearOnNextDigitRef = useRef<boolean>(false);

  // 获取当前正在编辑的分数对象 (对齐 newcal 混合数与真分数解析)
  const getCurrentFraction = useCallback((): Fraction => {
    const hasFraction = fracNum !== '0' || fracDen !== '0';
    const hasWhole = fracWhole !== '0';
    const sign = fracIsNegative ? -1 : 1;

    const w = BigInt(fracWhole.split('.')[0] || '0');
    const n = BigInt(fracNum || '0');
    const d = BigInt(fracDen && fracDen !== '0' ? fracDen : '1');

    if (!hasFraction && !hasWhole) {
      return new Fraction(0n, 1n, 1);
    }

    if (!hasWhole && hasFraction) {
      // 纯分数，如 3/5
      return new Fraction(n, d, sign).simplify();
    }

    // 混合数或纯整数，如 6 又 3/5，转换为假分数 (6 * 5 + 3) / 5
    const totalNum = w * d + n;
    return new Fraction(totalNum, d, sign).simplify();
  }, [fracWhole, fracNum, fracDen, fracIsNegative]);

  const clearFracInput = useCallback(() => {
    setFracWhole('0');
    setFracNum('0');
    setFracDen('0');
    setFracIsNegative(false);
  }, []);

  // ────────────────── 左侧整数键盘处理 ──────────────────
  const onWholeDigit = useCallback(
    (d: string) => {
      void playNumber(parseInt(d, 10) || 0);
      if (clearOnNextDigitRef.current) {
        clearFracInput();
        clearOnNextDigitRef.current = false;
      }
      setIsCalculated(false);
      setFracWhole((prev) => {
        if (prev === '0' && d !== '.') return d;
        if (d === '.' && prev.includes('.')) return prev;
        return prev + d;
      });
    },
    [clearFracInput, playNumber],
  );

  const onWholeBackspace = useCallback(() => {
    void playDelete();
    setIsCalculated(false);
    setFracWhole((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, [playDelete]);

  const onToggleSign = useCallback(() => {
    void playAudio('click');
    setFracIsNegative((prev) => !prev);
  }, [playAudio]);

  const onClear = useCallback(() => {
    void playDelete();
    const hasInput = fracWhole !== '0' || fracNum !== '0' || fracDen !== '0';
    if (hasInput) {
      clearFracInput();
    } else {
      setStoredFraction(null);
      setPendingOp(null);
      setHistoryEntry(null);
      setFinalResult(null);
      setIsCalculated(false);
    }
  }, [clearFracInput, fracWhole, fracNum, fracDen, playDelete]);

  // ────────────────── 右侧分子键盘处理 ──────────────────
  const onNumDigit = useCallback(
    (d: string) => {
      void playNumber(parseInt(d, 10));
      if (clearOnNextDigitRef.current) {
        clearFracInput();
        clearOnNextDigitRef.current = false;
      }
      setIsCalculated(false);
      setFracNum((prev) => (prev === '0' ? d : prev + d));
    },
    [clearFracInput, playNumber],
  );

  const onNumBackspace = useCallback(() => {
    void playDelete();
    setIsCalculated(false);
    setFracNum((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }, [playDelete]);

  const onNumClear = useCallback(() => {
    void playDelete();
    setIsCalculated(false);
    setFracNum('0');
  }, [playDelete]);

  // ────────────────── 右侧分母键盘处理 ──────────────────
  const onDenDigit = useCallback(
    (d: string) => {
      void playNumber(parseInt(d, 10));
      if (clearOnNextDigitRef.current) {
        clearFracInput();
        clearOnNextDigitRef.current = false;
      }
      setIsCalculated(false);
      setFracDen((prev) => (prev === '0' ? d : prev + d));
    },
    [clearFracInput, playNumber],
  );

  const onDenBackspace = useCallback(() => {
    void playDelete();
    setIsCalculated(false);
    setFracDen((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }, [playDelete]);

  const onDenClear = useCallback(() => {
    void playDelete();
    setIsCalculated(false);
    setFracDen('0');
  }, [playDelete]);

  const executeFracOp = (a: Fraction, b: Fraction, op: string): Fraction => {
    switch (op) {
      case '+':
        return a.add(b);
      case '−':
      case '-':
        return a.subtract(b);
      case '×':
        return a.multiply(b);
      case '÷':
        return a.divide(b);
      default:
        return b;
    }
  };

  // ────────────────── 运算符处理 ──────────────────
  const onOperator = useCallback(
    (op: string) => {
      void playOperator(op);
      try {
        const cur = getCurrentFraction();
        let newStored = cur;
        if (storedFraction !== null && pendingOp !== null && !clearOnNextDigitRef.current) {
          newStored = executeFracOp(storedFraction, cur, pendingOp);
        }
        setStoredFraction(newStored);
        setPendingOp(op);
        setHistoryEntry({ first: newStored, operator: op });
        clearOnNextDigitRef.current = true;
        setIsCalculated(false);
      } catch (e: any) {
        alert(e.message || '计算出错');
      }
    },
    [getCurrentFraction, storedFraction, pendingOp, playOperator],
  );

  // ────────────────── 等号处理 ──────────────────
  const onEqual = useCallback(() => {
    void playOperator('=');
    if (storedFraction === null || pendingOp === null) return;
    try {
      const cur = getCurrentFraction();
      const res = executeFracOp(storedFraction, cur, pendingOp);
      setHistoryEntry({
        first: storedFraction,
        operator: pendingOp,
        second: cur,
        hasEquals: true,
      });
      setFinalResult(res);
      setIsCalculated(true);

      // 写入持久化计算历史
      const exprStr = `${formatFractionToText(storedFraction)} ${pendingOp} ${formatFractionToText(cur)}`;
      const approxStr = res.denominator !== 1n ? ` (≈ ${res.toDecimal().toFixed(4).replace(/\.?0+$/, '')})` : '';
      const resStr = `${formatFractionToText(res)}${approxStr}`;
      HistoryStorage.addRecord('fraction', exprStr, resStr);

      setStoredFraction(null);
      setPendingOp(null);
      clearOnNextDigitRef.current = true;
    } catch (e: any) {
      alert(e.message || '计算出错');
    }
  }, [getCurrentFraction, storedFraction, pendingOp, playOperator]);

  // ────────────────── 内存键处理 ──────────────────
  const onMC = useCallback(() => {
    void playAudio('click');
    setMemoryValue(null);
  }, [playAudio]);

  const onMPlus = useCallback(() => {
    void playAudio('click');
    const cur = isCalculated && finalResult ? finalResult : getCurrentFraction();
    setMemoryValue((prev) => (prev ? prev.add(cur) : cur));
  }, [isCalculated, finalResult, getCurrentFraction, playAudio]);

  const onMMinus = useCallback(() => {
    void playAudio('click');
    const cur = isCalculated && finalResult ? finalResult : getCurrentFraction();
    setMemoryValue((prev) => (prev ? prev.subtract(cur) : new Fraction(cur.numerator, cur.denominator, -cur.sign)));
  }, [isCalculated, finalResult, getCurrentFraction, playAudio]);

  const onMR = useCallback(() => {
    void playAudio('click');
    if (!memoryValue) return;
    const mixed = memoryValue.toMixedNumber();
    setFracWhole(mixed.wholePart);
    setFracNum(mixed.numerator);
    setFracDen(mixed.denominator);
    setFracIsNegative(mixed.sign === -1);
    setIsCalculated(false);
  }, [memoryValue, playAudio]);

  return (
    <div className="calculator-page frac-mode">
      <div className="app-container">
        {/* ── 屏幕显示区域：自适应高度 ── */}
        <section className="display-area">
          <div className="calc-screen compact">
            {/* 历史公式显示：清晰大字号上下横线分数，空间充裕舒适 */}
            <div className="history-text flex items-center justify-end flex-wrap gap-2 text-[#8E7B96]">
              {historyEntry ? (
                <div className="inline-flex items-center gap-2">
                  <FractionVisual fraction={historyEntry.first} size="formula" />
                  <span className="text-2xl font-black mx-1">{historyEntry.operator}</span>
                  {historyEntry.second && (
                    <FractionVisual fraction={historyEntry.second} size="formula" />
                  )}
                  {historyEntry.hasEquals && <span className="text-2xl font-black mx-1">=</span>}
                </div>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>

            {/* 当前主输入或计算结果展示 */}
            <div className="current-text flex items-center justify-end gap-1.5 flex-wrap">
              {isCalculated && finalResult ? (
                <div className="flex items-center gap-2">
                  <FractionVisual fraction={finalResult} size="large" />
                  <span className="text-xs font-semibold opacity-60">
                    ≈ {finalResult.toDecimal().toFixed(4).replace(/\.?0+$/, '')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {fracIsNegative && <span className="text-3xl font-bold mr-0.5">-</span>}
                  
                  {/* 整数部分：只有当没有输入分数，或者整数不为0时才显示整数部分（避免只输分数时前面出现 0） */}
                  {(fracWhole !== '0' || (fracNum === '0' && fracDen === '0')) && (
                    <span className="text-4xl font-extrabold">{fracWhole}</span>
                  )}

                  {/* 分数部分：上下堆叠，中间水平分数线，绝对不使用斜杠 / */}
                  {(fracNum !== '0' || fracDen !== '0') && (
                    <div className="inline-flex flex-col items-center justify-center leading-none ml-1">
                      <span className="text-2xl font-black">{fracNum}</span>
                      <div className="w-full h-[2.5px] bg-current my-0.5 rounded-full" />
                      <span className="text-2xl font-black">{fracDen === '0' ? '1' : fracDen}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] font-bold text-[#8E7B96] opacity-80 mt-auto pt-1 w-full text-left">
              左侧输入整数 · 右侧输入分子/分母
            </div>
          </div>
        </section>

        {/* ── 双分栏键盘区域 ── */}
        <section className="keypad-area">
          {/* 中部双分栏：左侧整数(2列×6行) + 右侧分子分母(3列×4行×2) */}
          <div className="frac-columns">
            {/* 左侧：整数输入 (占 2 列，共 12 键) */}
            <div className="frac-col-whole">
              <div className="frac-whole-grid">
                <button
                  type="button"
                  onClick={onClear}
                  className="key-btn-frac pink"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={onToggleSign}
                  className="key-btn-frac lavender text-xs font-black"
                >
                  +/-
                </button>

                <button
                  type="button"
                  onClick={() => onWholeDigit('1')}
                  className="key-btn-frac lavender"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => onWholeDigit('2')}
                  className="key-btn-frac lavender"
                >
                  2
                </button>

                <button
                  type="button"
                  onClick={() => onWholeDigit('3')}
                  className="key-btn-frac lavender"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => onWholeDigit('4')}
                  className="key-btn-frac lavender"
                >
                  4
                </button>

                <button
                  type="button"
                  onClick={() => onWholeDigit('5')}
                  className="key-btn-frac lavender"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => onWholeDigit('6')}
                  className="key-btn-frac lavender"
                >
                  6
                </button>

                <button
                  type="button"
                  onClick={() => onWholeDigit('7')}
                  className="key-btn-frac lavender"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => onWholeDigit('8')}
                  className="key-btn-frac lavender"
                >
                  8
                </button>

                <button
                  type="button"
                  onClick={() => onWholeDigit('9')}
                  className="key-btn-frac lavender"
                >
                  9
                </button>
                <button
                  type="button"
                  onClick={() => onWholeDigit('0')}
                  className="key-btn-frac lavender"
                >
                  0
                </button>
              </div>
            </div>

            {/* 右侧：分子分母 (占 3 列) */}
            <div className="frac-col-fraction">
              {/* 分子键盘 (Numerator, 3列 × 4行) */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="frac-part-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={`num-${digit}`}
                      type="button"
                      onClick={() => onNumDigit(digit)}
                      className="key-btn-frac lavender"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onNumDigit('0')}
                    className="key-btn-frac lavender"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={onNumBackspace}
                    className="key-btn-frac yellow col-span-2 flex items-center justify-center"
                    title="退格"
                  >
                    <BackspaceIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 中间简洁分数线分割 */}
              <div className="h-[2px] bg-slate-300/80 dark:bg-slate-600/80 rounded-full my-0.5 mx-1" />

              {/* 分母键盘 (Denominator, 3列 × 4行) */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="frac-part-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={`den-${digit}`}
                      type="button"
                      onClick={() => onDenDigit(digit)}
                      className="key-btn-frac lavender"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onDenDigit('0')}
                    className="key-btn-frac lavender"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={onDenBackspace}
                    className="key-btn-frac yellow col-span-2 flex items-center justify-center"
                    title="退格"
                  >
                    <BackspaceIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 底部运算符行 (+, −, ×, ÷, =) */}
          <div className="frac-operators-row">
            <button
              type="button"
              onClick={() => onOperator('+')}
              className="key-btn-frac yellow"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => onOperator('−')}
              className="key-btn-frac yellow"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => onOperator('×')}
              className="key-btn-frac yellow"
            >
              ×
            </button>
            <button
              type="button"
              onClick={() => onOperator('÷')}
              className="key-btn-frac yellow"
            >
              ÷
            </button>
            <button
              type="button"
              onClick={onEqual}
              className="key-btn-frac mint"
            >
              =
            </button>
          </div>
        </section>

        {/* 底部 Tab：与基础计算器、科学计算器完全共享同一套 Tab 栏 */}
        <MainTabBar variant="inline" />
      </div>
    </div>
  );
}
