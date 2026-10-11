import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';
import { AudioPlayer } from '../lib/audioPlayer';
import { ScientificEvaluator, isApproximateResult, simplifyApproxNumber } from '../utils/scientificEvaluator';
import HistoryStorage from '../lib/historyStorage';
import MainTabBar from '@/components/MainTabBar';
import '../styles/calculator-page.css';

type SciKeyItem = {
  label: string;
  icon?: React.ReactNode;
  color: string;
  onClick: () => void;
  isBadge?: boolean;
};

const ScientificCalculator: React.FC = () => {
  const { playNumber, playOperator, playDelete, playAudio, speakText } = useAudio();

  // ── 科学计算器状态 (移植自 newcal FixedScientificCalculator) ──
  const [sciExpr, setSciExpr] = useState<string>(''); // 正在输入的算式
  const [sciAutoResult, setSciAutoResult] = useState<string>(''); // 实时预览结果 (= xxx)
  const [sciAutoIsApprox, setSciAutoIsApprox] = useState<boolean>(false); // 实时预览是否为约等于
  const [sciFinalResult, setSciFinalResult] = useState<string>(''); // 按等号后的最终结果
  const [sciHistoryText, setSciHistoryText] = useState<string>(''); // 按等号后的历史公式
  const [isSciFinalized, setIsSciFinalized] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg'); // 默认角度制
  const [isInverseMode, setIsInverseMode] = useState<boolean>(false); // fx 反函数模式
  const sciEvaluatorRef = useRef<ScientificEvaluator>(new ScientificEvaluator('deg'));

  const pendingTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // ─────────────────────────────────────────────────
  // 音频工具
  // ─────────────────────────────────────────────────
  const unlockAudio = useCallback(async () => {
    if (!isAudioUnlocked) {
      try {
        await AudioPlayer.getInstance().unlockAudio();
        setIsAudioUnlocked(true);
      } catch (error) {
        console.warn('音频解锁失败:', error);
      }
    }
  }, [isAudioUnlocked]);

  const speakEqualsAndResult = useCallback(
    async (value: number, isApprox = false) => {
      try {
        if (isApprox) {
          await playOperator('≈');
        } else {
          await playOperator('=');
        }
      } catch {
        try {
          await AudioPlayer.getInstance().speakText(isApprox ? '约等于' : '等于');
        } catch {
          // ignore
        }
      }
      const valToSpeak = isApprox ? simplifyApproxNumber(value) : value;
      await playNumber(valToSpeak, { fast: true });
    },
    [playNumber, playOperator],
  );

  // ─────────────────────────────────────────────────
  // 实时自动预览计算
  // ─────────────────────────────────────────────────
  const updateSciPreview = useCallback((exprToEvaluate: string, currentAngleMode: 'deg' | 'rad') => {
    if (!exprToEvaluate || exprToEvaluate.trim() === '') {
      setSciAutoResult('');
      return;
    }

    sciEvaluatorRef.current.setAngleMode(currentAngleMode);

    let cleaned = exprToEvaluate;
    if (/[+×÷\-^%]$/.test(cleaned)) {
      cleaned = cleaned.slice(0, -1);
    }
    if (!cleaned) {
      setSciAutoResult('');
      return;
    }

    const res = sciEvaluatorRef.current.evaluate(cleaned, true);
    if (res.success && res.formatted && res.value !== undefined) {
      setSciAutoResult(res.formatted);
      setSciAutoIsApprox(isApproximateResult(res.value));
    } else if (res.error === '0 不能做除数') {
      setSciAutoResult('0 不能做除数');
      setSciAutoIsApprox(false);
    } else {
      setSciAutoResult('');
      setSciAutoIsApprox(false);
    }
  }, []);

  // 切换角度制 (DEG <-> RAD)
  const toggleAngleMode = useCallback(() => {
    const nextMode = angleMode === 'deg' ? 'rad' : 'deg';
    setAngleMode(nextMode);
    sciEvaluatorRef.current.setAngleMode(nextMode);
    if (sciExpr) {
      updateSciPreview(sciExpr, nextMode);
    }
  }, [angleMode, sciExpr, updateSciPreview]);

  // 切换反函数模式 (fx)
  const toggleInverseMode = useCallback(() => {
    setIsInverseMode((prev) => !prev);
  }, []);

  // ─────────────────────────────────────────────────
  // 按键交互逻辑
  // ─────────────────────────────────────────────────
  const handleButtonClick = useCallback(
    async (btn: string) => {
      await unlockAudio();

      // C: 清空
      if (btn === 'C') {
        void playAudio('clear').catch(() => void playDelete());
        setSciExpr('');
        setSciAutoResult('');
        setSciFinalResult('');
        setSciHistoryText('');
        setIsSciFinalized(false);
        return;
      }

      // ⌫: 删除
      if (btn === '⌫') {
        void playDelete();
        if (isSciFinalized) {
          setIsSciFinalized(false);
          setSciExpr(sciFinalResult.length > 1 ? sciFinalResult.slice(0, -1) : '');
          setSciFinalResult('');
          return;
        }
        setSciExpr((prev) => {
          if (!prev) return '';
          const funcPattern = /(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|cot⁻¹\(|asin\(|acos\(|atan\(|acot\(|sin\(|cos\(|tan\(|cot\(|lg\(|ln\(|log\(|√\()$/;
          const match = prev.match(funcPattern);
          if (match) {
            const next = prev.slice(0, prev.length - match[0].length);
            updateSciPreview(next, angleMode);
            return next;
          }
          const next = prev.slice(0, -1);
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // =: 求最终结果
      if (btn === '=') {
        let exprToCalc = sciExpr;
        if (isSciFinalized) return;
        if (!exprToCalc) {
          if (sciFinalResult) exprToCalc = sciFinalResult;
          else return;
        }

        sciEvaluatorRef.current.setAngleMode(angleMode);
        const evalRes = sciEvaluatorRef.current.evaluate(exprToCalc, true);

        if (evalRes.success && evalRes.value !== undefined) {
          const isApprox = isApproximateResult(evalRes.value);
          const formatted = evalRes.formatted || evalRes.value.toString();
          const opSymbol = isApprox ? '≈' : '=';
          const exprStr = `${exprToCalc} ${opSymbol}`;
          setSciHistoryText(exprStr);
          setSciFinalResult(formatted);
          setIsSciFinalized(true);
          setSciExpr('');
          setSciAutoResult('');
          setSciAutoIsApprox(false);

          HistoryStorage.addRecord('scientific', exprStr, formatted);

          const timeout = AudioPlayer.getInstance().createCancelableDelay(12, () => {
            pendingTimeoutsRef.current.delete(timeout);
            if (evalRes.value !== undefined) {
              void speakEqualsAndResult(evalRes.value, isApprox);
            }
          });
          pendingTimeoutsRef.current.add(timeout);
        } else {
          setSciHistoryText(exprToCalc + ' =');
          setSciFinalResult(evalRes.error || '错误');
          setIsSciFinalized(true);
          setSciExpr('');
          setSciAutoResult('');
          setSciAutoIsApprox(false);
        }
        return;
      }

      // 倒数: 1/x
      if (btn === '1/x') {
        void playOperator('divide');
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized && sciFinalResult && sciFinalResult !== '错误') {
            base = sciFinalResult;
            setIsSciFinalized(false);
          }
          const next = base ? `1/(${base})` : '1/';
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 幂次: x^y
      if (btn === 'x^y') {
        void speakText('次方');
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized && sciFinalResult && sciFinalResult !== '错误') {
            base = sciFinalResult;
            setIsSciFinalized(false);
          }
          if (!base) return '';
          const next = base + '^';
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 阶乘: x!
      if (btn === 'x!') {
        void speakText('阶乘');
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized && sciFinalResult && sciFinalResult !== '错误') {
            base = sciFinalResult;
            setIsSciFinalized(false);
          }
          if (!base) return '';
          const next = base + '!';
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 开方: √
      if (btn === '√') {
        void speakText('根号');
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized) {
            base = '';
            setIsSciFinalized(false);
          }
          const next = base + '√(';
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 对数: lg, ln
      if (btn === 'lg' || btn === 'ln') {
        void speakText(btn);
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized) {
            base = '';
            setIsSciFinalized(false);
          }
          const next = base + btn + '(';
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 三角函数 / 反三角函数
      if (['sin', 'cos', 'tan', 'cot'].includes(btn)) {
        void speakText(btn);
        const funcName = isInverseMode ? `${btn}⁻¹` : btn;
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized) {
            base = '';
            setIsSciFinalized(false);
          }
          const next = base + `${funcName}(`;
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 常数: π, e
      if (btn === 'π' || btn === 'e') {
        void speakText(btn === 'π' ? '派' : 'e');
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized) {
            base = '';
            setIsSciFinalized(false);
          }
          const next = base + btn;
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 运算符: +, -, ×, ÷, %
      if (['+', '-', '×', '÷', '%'].includes(btn)) {
        switch (btn) {
          case '+':
            void playOperator('add');
            break;
          case '-':
            void playOperator('subtract');
            break;
          case '×':
            void playOperator('multiply');
            break;
          case '÷':
            void playOperator('divide');
            break;
          default:
            void playOperator('multiply');
            break;
        }

        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized && sciFinalResult && sciFinalResult !== '错误') {
            base = sciFinalResult;
            setIsSciFinalized(false);
          }
          if (!base && btn !== '-') return '';
          if (base && /[+×÷\-]$/.test(base) && btn !== '-') {
            base = base.slice(0, -1);
          }
          const next = base + btn;
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 括号: (, )
      if (btn === '(' || btn === ')') {
        void playOperator('multiply');
        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized) {
            base = '';
            setIsSciFinalized(false);
          }
          const next = base + btn;
          updateSciPreview(next, angleMode);
          return next;
        });
        return;
      }

      // 数字 & 小数点: 0-9, .
      if (/[0-9.]/.test(btn)) {
        if (btn !== '.') {
          void playNumber(parseInt(btn, 10));
        } else {
          void playOperator('.');
        }

        setSciExpr((prev) => {
          let base = prev;
          if (isSciFinalized) {
            base = '';
            setIsSciFinalized(false);
          }
          const next = base + btn;
          updateSciPreview(next, angleMode);
          return next;
        });
      }
    },
    [
      unlockAudio,
      isSciFinalized,
      sciFinalResult,
      sciExpr,
      angleMode,
      isInverseMode,
      updateSciPreview,
      playAudio,
      playDelete,
      speakEqualsAndResult,
      playOperator,
      playNumber,
    ],
  );

  useEffect(() => {
    AudioPlayer.getInstance().preloadCommonAudios();
  }, []);

  // ─────────────────────────────────────────────────
  // 7行 × 5列 科学按键数据
  // ─────────────────────────────────────────────────
  const sinLabel = isInverseMode ? 'sin⁻¹' : 'sin';
  const cosLabel = isInverseMode ? 'cos⁻¹' : 'cos';
  const tanLabel = isInverseMode ? 'tan⁻¹' : 'tan';
  const cotLabel = isInverseMode ? 'cot⁻¹' : 'cot';

  const backspaceIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );

  const sciKeyRows: SciKeyItem[][] = [
    // 行 1
    [
      { label: 'fx', color: isInverseMode ? 'yellow' : 'lavender', onClick: toggleInverseMode },
      { label: 'xʸ', color: 'lavender', onClick: () => void handleButtonClick('x^y') },
      { label: '√', color: 'lavender', onClick: () => void handleButtonClick('√') },
      { label: 'x!', color: 'lavender', onClick: () => void handleButtonClick('x!') },
      { label: '1/x', color: 'lavender', onClick: () => void handleButtonClick('1/x') },
    ],
    // 行 2
    [
      { label: angleMode.toUpperCase(), color: 'lavender', onClick: toggleAngleMode, isBadge: true },
      { label: 'lg', color: 'lavender', onClick: () => void handleButtonClick('lg') },
      { label: 'ln', color: 'lavender', onClick: () => void handleButtonClick('ln') },
      { label: '(', color: 'lavender', onClick: () => void handleButtonClick('(') },
      { label: ')', color: 'lavender', onClick: () => void handleButtonClick(')') },
    ],
    // 行 3
    [
      { label: sinLabel, color: 'lavender', onClick: () => void handleButtonClick('sin') },
      { label: 'C', color: 'pink', onClick: () => void handleButtonClick('C') },
      { label: '⌫', icon: backspaceIcon, color: 'yellow', onClick: () => void handleButtonClick('⌫') },
      { label: '%', color: 'yellow', onClick: () => void handleButtonClick('%') },
      { label: '÷', color: 'yellow operator', onClick: () => void handleButtonClick('÷') },
    ],
    // 行 4
    [
      { label: cosLabel, color: 'lavender', onClick: () => void handleButtonClick('cos') },
      { label: '7', color: 'lavender', onClick: () => void handleButtonClick('7') },
      { label: '8', color: 'lavender', onClick: () => void handleButtonClick('8') },
      { label: '9', color: 'lavender', onClick: () => void handleButtonClick('9') },
      { label: '×', color: 'yellow operator', onClick: () => void handleButtonClick('×') },
    ],
    // 行 5
    [
      { label: tanLabel, color: 'lavender', onClick: () => void handleButtonClick('tan') },
      { label: '4', color: 'lavender', onClick: () => void handleButtonClick('4') },
      { label: '5', color: 'lavender', onClick: () => void handleButtonClick('5') },
      { label: '6', color: 'lavender', onClick: () => void handleButtonClick('6') },
      { label: '-', color: 'yellow operator', onClick: () => void handleButtonClick('-') },
    ],
    // 行 6
    [
      { label: cotLabel, color: 'lavender', onClick: () => void handleButtonClick('cot') },
      { label: '1', color: 'lavender', onClick: () => void handleButtonClick('1') },
      { label: '2', color: 'lavender', onClick: () => void handleButtonClick('2') },
      { label: '3', color: 'lavender', onClick: () => void handleButtonClick('3') },
      { label: '+', color: 'yellow operator', onClick: () => void handleButtonClick('+') },
    ],
    // 行 7
    [
      { label: 'π', color: 'lavender', onClick: () => void handleButtonClick('π') },
      { label: 'e', color: 'lavender', onClick: () => void handleButtonClick('e') },
      { label: '0', color: 'lavender', onClick: () => void handleButtonClick('0') },
      { label: '.', color: 'lavender', onClick: () => void handleButtonClick('.') },
      { label: '=', color: 'mint', onClick: () => void handleButtonClick('=') },
    ],
  ];

  return (
    <div className="calculator-page sci-mode">
      <div className="app-container">

        {/* ── 屏幕显示区域 ── */}
        <section className="display-area">
          <div className="calc-screen">
            <div className="calc-screen-header">
              <div
                className="sci-mode-tip"
                onClick={toggleAngleMode}
                role="button"
                tabIndex={0}
              >
                {angleMode === 'deg' ? '角度制 (DEG)' : '弧度制 (RAD)'}
                {isInverseMode && ' · 反函数'}
              </div>
            </div>

            {/* 当前算式或历史算式 */}
            <div className="history-text sci-history">
              {isSciFinalized ? sciHistoryText : sciExpr || ' '}
            </div>

            {/* 结果显示：完成后显示结果，输入中如果有预览显示预览 */}
            <div className="current-text sci-display">
              {isSciFinalized
                ? sciFinalResult
                : sciAutoResult
                ? `${sciAutoIsApprox ? '≈' : '='} ${sciAutoResult}`
                : '0'}
            </div>
          </div>
        </section>

        {/* ── 科学键盘 7×5 正方形区域 ── */}
        <section className="keypad-area">
          <div className="keypad-grid-sci-7x5">
            {sciKeyRows.map((row, rowIdx) => (
              <div key={rowIdx} className="sci-row">
                {row.map((item, colIdx) => (
                  <button
                    key={colIdx}
                    type="button"
                    className={`key-btn key-btn-sci ${item.color} ${item.isBadge ? 'badge-key' : ''} ${item.label.length > 3 ? 'small-text' : ''}`}
                    onClick={item.onClick}
                  >
                    {item.icon ? item.icon : item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── 底部主导航 ── */}
        <MainTabBar variant="inline" />
      </div>
    </div>
  );
};

export default ScientificCalculator;
