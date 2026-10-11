import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'rush60' | 'survival'; // 60秒冲刺 vs 连击生存(单题8秒)

interface Question {
  expression: string;
  answer: number;
  options: number[];
}

// 题目生成器
function generateQuestion(diff: Difficulty): Question {
  let expr = '';
  let ans = 0;

  if (diff === 'easy') {
    // 20 以内加减
    const isAdd = Math.random() > 0.5;
    if (isAdd) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      expr = `${a} + ${b}`;
      ans = a + b;
    } else {
      const a = Math.floor(Math.random() * 15) + 5;
      const b = Math.floor(Math.random() * a) + 1;
      expr = `${a} - ${b}`;
      ans = a - b;
    }
  } else if (diff === 'medium') {
    // 100 以内加减或九九乘法
    const mode = Math.random();
    if (mode < 0.4) {
      // 乘法
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      expr = `${a} × ${b}`;
      ans = a * b;
    } else if (mode < 0.7) {
      // 100以内加法
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 40) + 10;
      expr = `${a} + ${b}`;
      ans = a + b;
    } else {
      // 100以内减法
      const a = Math.floor(Math.random() * 60) + 30;
      const b = Math.floor(Math.random() * (a - 10)) + 10;
      expr = `${a} - ${b}`;
      ans = a - b;
    }
  } else {
    // 混合心算（两步运算或带乘除）
    const mode = Math.random();
    if (mode < 0.5) {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      const c = Math.floor(Math.random() * 20) + 1;
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        expr = `${a} × ${b} + ${c}`;
        ans = a * b + c;
      } else {
        expr = `${a} × ${b} - ${c}`;
        ans = a * b - c;
      }
    } else {
      const a = Math.floor(Math.random() * 40) + 20;
      const b = Math.floor(Math.random() * 20) + 10;
      const c = Math.floor(Math.random() * 15) + 5;
      expr = `${a} + ${b} - ${c}`;
      ans = a + b - c;
    }
  }

  // 生成 4 个干扰选项
  const optionsSet = new Set<number>([ans]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = ans + delta;
    if (candidate !== ans) {
      optionsSet.add(candidate);
    }
  }

  // 打乱选项
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { expression: expr, answer: ans, options };
}

export default function MentalSpeedMath() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<GameMode>('rush60');

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<number | null>(null);

  // 本地历史最高分
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('mental_math_high_score') || '0', 10);
  });

  // 结束游戏
  const finishGame = useCallback((finalScore: number, finalMaxCombo: number) => {
    setGameState('ended');
    if (timerRef.current) clearInterval(timerRef.current);

    const savedBest = parseInt(localStorage.getItem('mental_math_high_score') || '0', 10);
    if (finalScore > savedBest) {
      localStorage.setItem('mental_math_high_score', `${finalScore}`);
      setHighScore(finalScore);
      speakText(`太厉害了！创造新纪录，得分 ${finalScore} 分！`);
    } else {
      speakText(`挑战结束，最终得分 ${finalScore} 分！连击 ${finalMaxCombo} 次！`);
    }
  }, [speakText]);

  // 开始新挑战
  const startGame = () => {
    const initialTime = mode === 'rush60' ? 60 : 8;
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalAnswered(0);
    setCorrectCount(0);
    setTimeLeft(initialTime);
    setAnswerFeedback(null);

    const q = generateQuestion(difficulty);
    setCurrentQuestion(q);
    speakText('口算擂台开始，预备，冲刺！');
  };

  // 倒计时主循环
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (mode === 'survival') {
            // 生存模式单题超时，直接结束
            finishGame(score, maxCombo);
            return 0;
          } else {
            // 60秒冲刺时间到
            finishGame(score, maxCombo);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode, score, maxCombo, finishGame]);

  // 回答选项
  const handleSelectOption = (chosen: number) => {
    if (gameState !== 'playing' || !currentQuestion) return;

    const isCorrect = chosen === currentQuestion.answer;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo(prev => Math.max(prev, nextCombo));
      setCorrectCount(prev => prev + 1);

      // 加分逻辑：基础 10 分 + 连击加成
      const gain = 10 + Math.min(nextCombo * 2, 20);
      setScore(prev => prev + gain);
      setAnswerFeedback('correct');

      // 连击语音鼓励
      if (nextCombo === 3) speakText('三连击！太棒了！');
      else if (nextCombo === 5) speakText('五连击！无人能挡！');
      else if (nextCombo === 10) speakText('十连击！数学之神！');

      // 模式重置题库
      if (mode === 'survival') {
        setTimeLeft(8); // 重置单题计时
      }

      setTimeout(() => {
        setAnswerFeedback(null);
        setCurrentQuestion(generateQuestion(difficulty));
      }, 150);
    } else {
      setCombo(0);
      setAnswerFeedback('wrong');
      speakText('不对哦，加油');

      if (mode === 'survival') {
        // 生存模式一错即止
        setTimeout(() => {
          finishGame(score, maxCombo);
        }, 300);
      } else {
        setTimeout(() => {
          setAnswerFeedback(null);
          setCurrentQuestion(generateQuestion(difficulty));
        }, 200);
      }
    }
  };

  // 结算评级
  const getRating = (finalScore: number) => {
    if (finalScore >= 300) return '🏆 数学最强王者';
    if (finalScore >= 200) return '🥇 心算特级大师';
    if (finalScore >= 100) return '🥈 口算速算能手';
    return '🥉 心算新星学员';
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-slate-700 flex flex-col font-sans select-none">
      {/* 顶部标题栏 */}
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
          <h1 className="text-lg font-black text-slate-800">口算限时擂台</h1>
          <span className="text-xs font-semibold text-emerald-600">最高分: {highScore}</span>
        </div>
        <div className="w-12" />
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        {gameState === 'idle' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
            <div className="text-center">
              <span className="text-4xl block mb-2">⚡</span>
              <h2 className="text-xl font-black text-slate-800">极速心算大挑战</h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                在有限时间内抢答口算题，挑战手速与心算极限！
              </p>
            </div>

            {/* 模式选择 */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500">挑战模式</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('rush60')}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    mode === 'rush60'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-black text-sm">⏱️ 60秒冲刺</div>
                  <div className="text-[11px] opacity-75">1分钟看谁答对最多</div>
                </button>
                <button
                  onClick={() => setMode('survival')}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    mode === 'survival'
                      ? 'bg-rose-50 border-rose-400 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-black text-sm">🔥 连击生存</div>
                  <div className="text-[11px] opacity-75">每题8秒·一错即止</div>
                </button>
              </div>
            </div>

            {/* 难度选择 */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500">题目难度</span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'easy', label: '青铜', desc: '20以内加减' },
                    { key: 'medium', label: '白银', desc: '百内加减乘' },
                    { key: 'hard', label: '黄金', desc: '四则混合' },
                  ] as const
                ).map(d => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`p-2.5 rounded-2xl text-center border transition-all ${
                      difficulty === d.key
                        ? 'bg-amber-50 border-amber-400 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="font-black text-xs">{d.label}</div>
                    <div className="text-[10px] opacity-75">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="mt-3 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-lg active:scale-98 transition-all"
              style={{ boxShadow: '0 5px 0 #059669' }}
            >
              开始冲刺挑战
            </button>
          </div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <div className="flex flex-col gap-4">
            {/* 顶栏状态面板 */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400">得分</span>
                <span className="text-2xl font-black text-emerald-600">{score}</span>
              </div>

              {combo > 1 && (
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black animate-bounce">
                  🔥 {combo} 连击!
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-400">倒计时</span>
                <span
                  className={`text-2xl font-black ${
                    timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-800'
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* 大字算式展示卡片 */}
            <div
              className={`bg-white rounded-3xl p-8 shadow-md border-2 transition-all flex flex-col items-center justify-center min-h-[170px] ${
                answerFeedback === 'correct'
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : answerFeedback === 'wrong'
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-100'
              }`}
            >
              <div className="text-4xl font-black text-slate-800 tracking-wide">
                {currentQuestion.expression} = ?
              </div>
            </div>

            {/* 4 选 1 极速答题大按键 */}
            <div className="grid grid-cols-2 gap-3.5">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="py-5 bg-white hover:bg-slate-50 text-slate-800 text-3xl font-black rounded-2xl border border-slate-200 active:scale-95 transition-all shadow-md cursor-pointer"
                  style={{ boxShadow: '0 5px 0 #CBD5E1' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-black text-slate-800">挑战结束</h2>
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black">
              {getRating(score)}
            </div>

            {/* 成绩统计卡片 */}
            <div className="w-full grid grid-cols-2 gap-3 my-2 text-left">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block">最终得分</span>
                <span className="text-xl font-black text-emerald-600">{score}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block">最高连击</span>
                <span className="text-xl font-black text-orange-500">{maxCombo} 连击</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block">答对题目</span>
                <span className="text-xl font-black text-slate-800">{correctCount} 道</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block">准确率</span>
                <span className="text-xl font-black text-slate-800">
                  {totalAnswered > 0 ? `${Math.round((correctCount / totalAnswered) * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-lg active:scale-98 transition-all"
              style={{ boxShadow: '0 5px 0 #059669' }}
            >
              再战一局
            </button>
            <button
              onClick={() => setGameState('idle')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              返回难度与模式选择
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
