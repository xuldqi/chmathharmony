import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import {
  processVoiceMathExpression,
  couldBeMathVoiceInput,
  isValidMathExpression,
  evaluateMathExpression,
} from '../utils/voiceUtils';
import StudyDataStorage from '../lib/studyDataStorage';
import HistoryStorage from '../lib/historyStorage';
import { AudioPlayer } from '../lib/audioPlayer';
import { isApproximateResult, simplifyApproxNumber } from '../utils/scientificEvaluator';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import MainTabBar from '@/components/MainTabBar';
import { AdControl } from '@/native/adControl';
import '../styles/calculator-page.css';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

const Calculator: React.FC = () => {
  const { playNumber, playOperator, playDelete, playAudio } = useAudio();

  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const pendingTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const [voiceResult, setVoiceResult] = useState<string>('');
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const {
    isListening,
    result: voiceText,
    partialResult: voicePartial,
    error: voiceError,
    startRecognition,
    stopRecognition,
    clearResult,
  } = useVoiceRecognition();

  const [historyText, setHistoryText] = useState<string>('');

  const calculationRef = useRef<{
    firstNumber: number | null;
    operator: string | null;
    secondNumber: number | null;
    startTime: Date | null;
  }>({ firstNumber: null, operator: null, secondNumber: null, startTime: null });

  const voicePressTimerRef = useRef<number | null>(null);
  const voiceAutoStopTimerRef = useRef<number | null>(null);
  const voiceModeRef = useRef(false);
  const voiceLongPressTriggeredRef = useRef(false);
  const lastProcessedVoiceRef = useRef<{ text: string; ts: number }>({ text: '', ts: 0 });
  const calculationCountRef = useRef(0);

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
          // 忽略播报失败，至少保证结果数字能播出来
        }
      }
      const valToSpeak = isApprox ? simplifyApproxNumber(value) : value;
      await playNumber(valToSpeak, { fast: true });
    },
    [playNumber, playOperator],
  );

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

  const clearPendingTimeouts = useCallback(() => {
    pendingTimeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    pendingTimeoutsRef.current.clear();
  }, []);

  const scheduleVoiceResultClear = useCallback((ms: number) => {
    const timeout = AudioPlayer.getInstance().createCancelableDelay(ms, () => {
      pendingTimeoutsRef.current.delete(timeout);
      setVoiceResult('');
    });
    pendingTimeoutsRef.current.add(timeout);
  }, []);

  const showVoiceResult = useCallback((message: string, ms = 2500) => {
    setVoiceResult(message);
    scheduleVoiceResultClear(ms);
  }, [scheduleVoiceResultClear]);

  const formatDisplayValue = useCallback((value: number): string => {
    if (!Number.isFinite(value)) {
      return '错误';
    }
    if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-9) {
      return Math.round(value).toString();
    }
    return parseFloat(value.toPrecision(8)).toString();
  }, []);

  const calculate = useCallback((firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  }, []);

  const handleMathError = useCallback((message: string) => {
    setState({
      display: '错误',
      previousValue: null,
      operation: null,
      waitingForOperand: true,
    });
    setHistoryText('');
    showVoiceResult(message);
  }, [showVoiceResult]);

  const handleNumber = useCallback(
    async (num: string) => {
      await unlockAudio();
      void playNumber(parseInt(num, 10));

      setState((prevState) => {
        if (prevState.waitingForOperand) {
          return {
            ...prevState,
            display: num,
            waitingForOperand: false,
          };
        }

        return {
          ...prevState,
          display:
            prevState.display === '0' || prevState.display === '错误'
              ? num
              : prevState.display + num,
        };
      });
    },
    [playNumber, unlockAudio],
  );

  const handleOperator = useCallback(
    async (nextOperation: string) => {
      await unlockAudio();
      const inputValue = parseFloat(state.display);
      if (Number.isNaN(inputValue)) {
        return;
      }

      switch (nextOperation) {
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
      }

      if (state.previousValue === null) {
        calculationRef.current = {
          firstNumber: inputValue,
          operator: nextOperation,
          secondNumber: null,
          startTime: new Date(),
        };

        setState({
          ...state,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForOperand: true,
        });
        return;
      }

      if (state.waitingForOperand) {
        calculationRef.current.operator = nextOperation;
        setState({
          ...state,
          operation: nextOperation,
        });
        return;
      } else if (state.operation) {
        const currentValue = state.previousValue;
        const newValue = calculate(currentValue, inputValue, state.operation);
        if (!Number.isFinite(newValue)) {
          handleMathError('不能除以0');
          return;
        }

        const formattedResult = formatDisplayValue(newValue);

        setState({
          display: formattedResult,
          previousValue: newValue,
          operation: nextOperation,
          waitingForOperand: true,
        });
      }
    },
    [state, playOperator, unlockAudio, calculate, formatDisplayValue, handleMathError],
  );

  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(state.display);
    if (Number.isNaN(inputValue)) {
      return;
    }

    if (state.previousValue !== null && state.operation) {
      const newValue = calculate(state.previousValue, inputValue, state.operation);
      if (!Number.isFinite(newValue)) {
        handleMathError('不能除以0');
        return;
      }

      if (calculationRef.current.firstNumber !== null && calculationRef.current.operator && calculationRef.current.startTime) {
        const question = `${calculationRef.current.firstNumber} ${calculationRef.current.operator} ${inputValue}`;
        const timeSpent = Date.now() - calculationRef.current.startTime.getTime();

        StudyDataStorage.recordAnswer(
          question,
          newValue.toString(),
          newValue.toString(),
          'addition',
          'medium',
          timeSpent,
        );

        calculationRef.current = { firstNumber: null, operator: null, secondNumber: null, startTime: null };
      }

      const isApprox = isApproximateResult(newValue);
      const formattedResult = formatDisplayValue(newValue);
      const opSymbol = isApprox ? '≈' : '=';

      const expression = `${state.previousValue} ${state.operation} ${inputValue} ${opSymbol}`;
      setHistoryText(expression);
      HistoryStorage.addRecord('standard', expression, formattedResult);

      setState({
        display: formattedResult,
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      });

      const timeout = AudioPlayer.getInstance().createCancelableDelay(12, () => {
        pendingTimeoutsRef.current.delete(timeout);
        void speakEqualsAndResult(newValue, isApprox);
      });
      pendingTimeoutsRef.current.add(timeout);

      // 运算计次触发插屏广告（每3次运算尝试请求一次广告，底层有频控）
      calculationCountRef.current += 1;
      if (calculationCountRef.current % 3 === 0) {
        setTimeout(() => {
          AdControl.showInterstitial().catch(() => {});
        }, 1500);
      }
    }
  }, [state, speakEqualsAndResult, calculate, formatDisplayValue, handleMathError]);

  const resetCalculator = useCallback((silent?: boolean) => {
    if (!silent) {
      void playAudio('clear').catch(() => {
        void playDelete();
      });
    }
    calculationRef.current = { firstNumber: null, operator: null, secondNumber: null, startTime: null };
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    });
    setHistoryText('');
  }, [playAudio, playDelete]);

  const handleClear = useCallback(() => {
    resetCalculator(false);
  }, [resetCalculator]);

  const handleDelete = useCallback(() => {
    void playDelete();
    setState((prevState) => ({
      ...prevState,
      display:
        prevState.display === '错误'
          ? '0'
          : (prevState.display.length > 1 ? prevState.display.slice(0, -1) : '0'),
    }));
  }, [playDelete]);

  const startVoiceInput = useCallback(async () => {
    AudioPlayer.getInstance().stopAllAudio();
    clearPendingTimeouts();
    clearResult();
    setVoiceResult('正在听取...');
    await startRecognition();
  }, [clearPendingTimeouts, startRecognition, clearResult]);

  const stopVoiceInput = useCallback(async () => {
    if (voiceAutoStopTimerRef.current !== null) {
      window.clearTimeout(voiceAutoStopTimerRef.current);
      voiceAutoStopTimerRef.current = null;
    }
    voiceLongPressTriggeredRef.current = false;
    voiceModeRef.current = false;
    await stopRecognition();
  }, [stopRecognition]);

  useEffect(() => {
    if (voiceError) {
      let message = '语音识别暂时不可用，可改用键盘输入';
      if (voiceError.includes('麦克风权限被拒绝') || voiceError.includes('permission')) {
        message = '麦克风权限被拒绝，请在系统设置里开启后再试';
      } else if (voiceError.includes('已取消听取')) {
        message = '已取消语音输入';
      } else if (voiceError.includes('识别超时') || voiceError.includes('未识别到语音')) {
        message = '没听清，可再试一次';
      } else if (voiceError.includes('浏览器不支持语音识别')) {
        message = '当前环境不支持语音识别，可改用键盘输入';
      } else if (
        voiceError.includes('当前设备或模拟器不支持原生语音识别') ||
        voiceError.includes('plugin is not implemented') ||
        voiceError.includes('not implemented') ||
        voiceError.includes('not available') ||
        voiceError.includes('unsupported') ||
        voiceError.includes('未响应') ||
        voiceError.includes('引擎创建失败')
      ) {
        message = '当前设备系统暂不支持语音识别，请改用键盘输入';
      }

      showVoiceResult(message, 3000);
    }
  }, [voiceError, showVoiceResult]);

  useEffect(() => {
    if (voicePartial && isListening) {
      setVoiceResult(`识别中: ${voicePartial}`);
    }
  }, [voicePartial, isListening]);

  useEffect(() => {
    if (!isListening) {
      setVoiceResult((prev) => {
        if (prev === '正在听取...' || prev.startsWith('识别中:')) {
          return '';
        }
        return prev;
      });
    }
  }, [isListening]);

  const processVoiceInput = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.trim();
    if (!normalizedTranscript) return;

    if (couldBeMathVoiceInput(normalizedTranscript)) {
      AudioPlayer.getInstance().stopAllAudio();
      clearPendingTimeouts();
      const processedExpression = processVoiceMathExpression(normalizedTranscript);

      if (processedExpression === 'clear') {
        handleClear();
        showVoiceResult('已清除', 1500);
        return;
      }
      if (processedExpression === 'delete') {
        handleDelete();
        showVoiceResult('已删除', 1500);
        return;
      }
      if (processedExpression === '=') {
        handleEquals();
        return;
      }

      if (processedExpression && isValidMathExpression(processedExpression)) {
        setVoiceResult(`识别: ${processedExpression}`);
        resetCalculator(true);

        const result = evaluateMathExpression(processedExpression);
        if (result !== null && Number.isFinite(result)) {
          const isApprox = isApproximateResult(result);
          const displayValue = formatDisplayValue(result);
          const opSymbol = isApprox ? '≈' : '=';
          const exprStr = `${processedExpression} ${opSymbol}`;

          setHistoryText(exprStr);
          HistoryStorage.addRecord('standard', exprStr, displayValue);

          setState((prev) => ({
            ...prev,
            display: displayValue,
            previousValue: null,
            operation: null,
            waitingForOperand: true,
          }));

          const timeout = AudioPlayer.getInstance().createCancelableDelay(80, () => {
            pendingTimeoutsRef.current.delete(timeout);
            void speakEqualsAndResult(result, isApprox);
          });
          pendingTimeoutsRef.current.add(timeout);
        } else {
          handleMathError('计算失败，请再说一次');
        }

        scheduleVoiceResultClear(3000);
        return;
      }

      const looksLikeFullExpression =
        /[加减乘除等于多少计算得点]|plus|add|minus|subtract|times|multiply|divide|equals|equal|point/i.test(normalizedTranscript) ||
        ((normalizedTranscript.match(/\d/g)?.length ?? 0) >= 2) ||
        ((normalizedTranscript.match(/[零一二三四五六七八九十百千万亿两]/g)?.length ?? 0) >= 2);

      if (looksLikeFullExpression) {
        showVoiceResult('没听清算式，请再说一次');
        return;
      }
    }

    const numberMap: Record<string, string> = {
      零: '0', 一: '1', 二: '2', 三: '3', 四: '4',
      五: '5', 六: '6', 七: '7', 八: '8', 九: '9',
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    };

    const operatorMap: Record<string, string> = {
      加: '+', 减: '-', 乘: '×', 除: '÷',
      等于: '=', 清除: 'clear', 删除: 'delete',
    };

    for (const [key, value] of Object.entries(numberMap)) {
      if (normalizedTranscript.includes(key)) {
        void handleNumber(value);
        return;
      }
    }

    for (const [key, value] of Object.entries(operatorMap)) {
      if (normalizedTranscript.includes(key)) {
        if (value === '=') {
          handleEquals();
        } else if (value === 'clear') {
          handleClear();
        } else if (value === 'delete') {
          handleDelete();
        } else {
          void handleOperator(value);
        }
        return;
      }
    }
  }, [
    clearPendingTimeouts,
    formatDisplayValue,
    handleClear,
    handleDelete,
    handleEquals,
    handleMathError,
    handleNumber,
    handleOperator,
    playNumber,
    resetCalculator,
    scheduleVoiceResultClear,
    showVoiceResult,
  ]);

  useEffect(() => {
    if (voiceText) {
      const text = voiceText.trim();
      if (!text) return;
      const now = Date.now();
      const { text: lastText, ts: lastTs } = lastProcessedVoiceRef.current;
      if (text === lastText && now - lastTs < 1500) {
        return;
      }
      lastProcessedVoiceRef.current = { text, ts: now };
      setVoiceResult(`识别结果: ${text}`);
      processVoiceInput(text);
    }
  }, [voiceText, processVoiceInput]);

  const handleDecimal = useCallback(() => {
    void playOperator('.');
    setState((prev) => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false,
        };
      }
      if (prev.display.includes('.')) {
        return prev;
      }
      return {
        ...prev,
        display: prev.display === '错误' ? '0.' : `${prev.display}.`,
      };
    });
  }, [playOperator]);

  const clearVoicePressTimer = useCallback(() => {
    if (voicePressTimerRef.current !== null) {
      window.clearTimeout(voicePressTimerRef.current);
      voicePressTimerRef.current = null;
    }
  }, []);

  const clearVoiceAutoStopTimer = useCallback(() => {
    if (voiceAutoStopTimerRef.current !== null) {
      window.clearTimeout(voiceAutoStopTimerRef.current);
      voiceAutoStopTimerRef.current = null;
    }
  }, []);

  const handleEqualsPressStart = useCallback((event?: React.PointerEvent<HTMLButtonElement>) => {
    event?.preventDefault();

    if (isListening) {
      voiceModeRef.current = false;
      voiceLongPressTriggeredRef.current = false;
      clearVoicePressTimer();
      clearVoiceAutoStopTimer();
      void stopVoiceInput();
      return;
    }

    voiceModeRef.current = false;
    voiceLongPressTriggeredRef.current = false;
    clearVoicePressTimer();
    clearVoiceAutoStopTimer();
    voicePressTimerRef.current = window.setTimeout(() => {
      voiceModeRef.current = true;
      voiceLongPressTriggeredRef.current = true;
      void startVoiceInput();
      clearVoiceAutoStopTimer();
      voiceAutoStopTimerRef.current = window.setTimeout(() => {
        voiceAutoStopTimerRef.current = null;
        void stopVoiceInput();
      }, 5000);
    }, 400);
  }, [clearVoiceAutoStopTimer, clearVoicePressTimer, isListening, startVoiceInput, stopVoiceInput]);

  const handleEqualsPressEnd = useCallback((event?: React.PointerEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    clearVoicePressTimer();

    if (voiceLongPressTriggeredRef.current) {
      voiceLongPressTriggeredRef.current = false;
      voiceModeRef.current = false;
      clearVoiceAutoStopTimer();
      voiceAutoStopTimerRef.current = window.setTimeout(() => {
        voiceAutoStopTimerRef.current = null;
        void stopVoiceInput();
      }, 1300);
      return;
    }

    if (voiceModeRef.current) {
      return;
    } else {
      handleEquals();
    }
  }, [clearVoiceAutoStopTimer, clearVoicePressTimer, handleEquals, stopVoiceInput]);

  const handleEqualsPressCancel = useCallback((event?: React.PointerEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    clearVoicePressTimer();
    if (voiceLongPressTriggeredRef.current) {
      voiceLongPressTriggeredRef.current = false;
      voiceModeRef.current = false;
      clearVoiceAutoStopTimer();
      voiceAutoStopTimerRef.current = window.setTimeout(() => {
        voiceAutoStopTimerRef.current = null;
        void stopVoiceInput();
      }, 1300);
    }
  }, [clearVoiceAutoStopTimer, clearVoicePressTimer, stopVoiceInput]);

  useEffect(() => {
    StudyDataStorage.startSession('calculator');
    AudioPlayer.getInstance().preloadCommonAudios();

    return () => {
      StudyDataStorage.endSession();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      StudyDataStorage.endSession();
      clearPendingTimeouts();
      AudioPlayer.getInstance().stopAllAudio();
      if (voicePressTimerRef.current !== null) {
        window.clearTimeout(voicePressTimerRef.current);
      }
      if (voiceAutoStopTimerRef.current !== null) {
        window.clearTimeout(voiceAutoStopTimerRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearPendingTimeouts();
      AudioPlayer.getInstance().stopAllAudio();
      if (voicePressTimerRef.current !== null) {
        window.clearTimeout(voicePressTimerRef.current);
      }
      if (voiceAutoStopTimerRef.current !== null) {
        window.clearTimeout(voiceAutoStopTimerRef.current);
      }
    };
  }, [clearPendingTimeouts]);

  return (
    <div className="calculator-page">
      <div className="app-container">

        <section className="display-area">
          <div className="calc-screen">
            <div className="history-text">{historyText}</div>
            <div className="current-text">{state.display}</div>
            <div className="voice-tip">长按 = 说出算式</div>
          </div>
          {voiceResult && <div className="voice-result-banner">{voiceResult}</div>}
        </section>

        <section className="keypad-area">
          <div className="keypad-grid">
            <button className="key-btn pink" onClick={handleClear}>
              C
            </button>
            <button
              className="key-btn yellow operator"
              onClick={() => void handleOperator('÷')}
            >
              ÷
            </button>
            <button
              className="key-btn yellow operator"
              onClick={() => void handleOperator('×')}
            >
              ×
            </button>
            <button className="key-btn yellow" onClick={handleDelete}>
              ⌫
            </button>

            <button className="key-btn lavender" onClick={() => void handleNumber('7')}>
              7
            </button>
            <button className="key-btn lavender" onClick={() => void handleNumber('8')}>
              8
            </button>
            <button className="key-btn lavender" onClick={() => void handleNumber('9')}>
              9
            </button>
            <button
              className="key-btn yellow operator"
              onClick={() => void handleOperator('-')}
            >
              -
            </button>

            <button className="key-btn lavender" onClick={() => void handleNumber('4')}>
              4
            </button>
            <button className="key-btn lavender" onClick={() => void handleNumber('5')}>
              5
            </button>
            <button className="key-btn lavender" onClick={() => void handleNumber('6')}>
              6
            </button>
            <button
              className="key-btn yellow operator"
              onClick={() => void handleOperator('+')}
            >
              +
            </button>

            <button className="key-btn lavender" onClick={() => void handleNumber('1')}>
              1
            </button>
            <button className="key-btn lavender" onClick={() => void handleNumber('2')}>
              2
            </button>
            <button className="key-btn lavender" onClick={() => void handleNumber('3')}>
              3
            </button>
            <button
              className="key-btn mint span-2-row"
              style={{ gridRow: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}
              onPointerDown={handleEqualsPressStart}
              onPointerUp={handleEqualsPressEnd}
              onPointerLeave={handleEqualsPressCancel}
              onPointerCancel={handleEqualsPressCancel}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mic className="w-6 h-6" />
                <span>=</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700 }}>按住说话</span>
            </button>

            <button
              className="key-btn lavender span-2-col"
              style={{ gridColumn: 'span 2' }}
              onClick={() => void handleNumber('0')}
            >
              0
            </button>
            <button className="key-btn lavender" onClick={handleDecimal}>
              .
            </button>
          </div>
        </section>

        <MainTabBar variant="inline" />
      </div>
    </div>
  );
};

export default Calculator;
