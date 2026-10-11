import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Heart, Zap } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

// 题目类型
interface Question {
  id: number;
  question: string;
  options: number[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 关卡信息
interface LevelInfo {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // 秒
  questionsCount: number;
  starsToUnlock: number;
}

interface GameChallengeProps {
  level: LevelInfo;
  onComplete: (stars: number, coins: number, timeUsed: number) => void;
  onExit: () => void;
  autoStart?: boolean;
}

const getInitialHearts = (levelId: number) => {
  const difficultyLevel = Math.min(5, Math.floor((levelId - 1) / 3) + 1);
  return Math.max(1, 4 - Math.floor(difficultyLevel / 2));
};

const shuffleNumbers = (values: number[]) => {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const buildQuestionOptions = (
  correctAnswer: number,
  candidateOffsets: number[],
  allowNegative: boolean,
) => {
  const uniqueOptions: number[] = [];
  const addOption = (value: number) => {
    if (!allowNegative && value < 0) return;
    if (!uniqueOptions.includes(value)) uniqueOptions.push(value);
  };

  addOption(correctAnswer);
  candidateOffsets.forEach(offset => addOption(correctAnswer + offset));

  let offset = 1;
  while (uniqueOptions.length < 4) {
    addOption(correctAnswer + offset);
    if (uniqueOptions.length >= 4) break;
    addOption(correctAnswer - offset);
    offset += 1;
  }

  return shuffleNumbers(uniqueOptions).slice(0, 4);
};

export default function GameChallenge({ level, onComplete, onExit, autoStart = false }: GameChallengeProps) {
  const { playNumber, playOperator, playCorrect, playWrong, playButtonClick } = useAudio();
  const initialHearts = useMemo(() => getInitialHearts(level.id), [level.id]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'completed' | 'failed'>(autoStart ? 'playing' : 'ready');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hearts, setHearts] = useState(initialHearts); // 生命值
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0); // 连击数
  const [, setCharacterEmotion] = useState<'happy' | 'excited' | 'thinking' | 'sad' | 'celebrating'>('thinking');
  const [, setCharacterMessage] = useState<string>('');
  const [, setShowCharacterMessage] = useState(false);
  // 语音播报控制：通过递增序列/清理定时器来中断任何进行中的播报
  const speechSeqRef = useRef(0);
  const speakTimerRef = useRef<number | null>(null);
  
  // 生成题目
  const generateQuestions = useCallback((): Question[] => {
    const questions: Question[] = [];
    
    // 根据关卡ID动态调整难度参数
    const difficultyLevel = Math.min(5, Math.floor((level.id - 1) / 3) + 1);
    const difficultyConfig = {
      1: { maxNum: 10, operators: ['+', '-'], hasNegative: false, complexity: 'simple' },
      2: { maxNum: 20, operators: ['+', '-'], hasNegative: false, complexity: 'simple' },
      3: { maxNum: 50, operators: ['+', '-', '*'], hasNegative: true, complexity: 'medium' },
      4: { maxNum: 100, operators: ['+', '-', '*'], hasNegative: true, complexity: 'medium' },
      5: { maxNum: 100, operators: ['+', '-', '*', '/'], hasNegative: true, complexity: 'complex' }
    };
    
    const config = difficultyConfig[difficultyLevel as keyof typeof difficultyConfig] || difficultyConfig[1];
    
    for (let i = 0; i < level.questionsCount; i++) {
      let question: Question;
      
      if (config.complexity === 'simple') {
        // 简单加减法
        const a = Math.floor(Math.random() * config.maxNum) + 1;
        const b = Math.floor(Math.random() * config.maxNum) + 1;
        const isAddition = Math.random() > 0.5;
        
        if (isAddition) {
          const answer = a + b;
          question = {
            id: i + 1,
            question: `${a} + ${b} = ?`,
            options: buildQuestionOptions(answer, [1, -1, 2], false),
            correctAnswer: answer,
            difficulty: level.difficulty
          };
        } else {
          const answer = Math.max(a, b) - Math.min(a, b);
          question = {
            id: i + 1,
            question: `${Math.max(a, b)} - ${Math.min(a, b)} = ?`,
            options: buildQuestionOptions(answer, [1, -1, 2], false),
            correctAnswer: answer,
            difficulty: level.difficulty
          };
        }
      } else if (config.complexity === 'medium') {
        // 乘法或较大数加减法
        const operator = config.operators[Math.floor(Math.random() * config.operators.length)];
        
        if (operator === '*') {
          const a = Math.floor(Math.random() * 12) + 1;
          const b = Math.floor(Math.random() * 12) + 1;
          const answer = a * b;
          question = {
            id: i + 1,
            question: `${a} × ${b} = ?`,
            options: buildQuestionOptions(answer, [a, -a, b], false),
            correctAnswer: answer,
            difficulty: level.difficulty
          };
        } else {
          const num1 = Math.floor(Math.random() * config.maxNum) + 10;
          const num2 = Math.floor(Math.random() * (config.maxNum / 2)) + 5;
          const answer = operator === '+' ? num1 + num2 : num1 - num2;
          question = {
            id: i + 1,
            question: `${num1} ${operator} ${num2} = ?`,
            options: buildQuestionOptions(answer, [5, -5, 10], config.hasNegative),
            correctAnswer: answer,
            difficulty: level.difficulty
          };
        }
      } else {
        // 复杂运算
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = Math.floor(Math.random() * 8) + 1;
        const answer = a + b * c;
        question = {
          id: i + 1,
          question: `${a} + ${b} × ${c} = ?`,
          options: buildQuestionOptions(answer, [(a + b) * c - answer, a * b + c - answer, 5], true),
          correctAnswer: answer,
          difficulty: level.difficulty
        };
      }
      
      questions.push(question);
    }
    
    return questions;
  }, [level.id, level.difficulty, level.questionsCount]);
  
  const [questions, setQuestions] = useState<Question[]>(() => generateQuestions());
  const currentQuestion = questions[currentQuestionIndex];

  const resetChallenge = useCallback((nextGameState: 'ready' | 'playing' = 'ready') => {
    setQuestions(generateQuestions());
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(level.timeLimit);
    setSelectedAnswer(null);
    setShowResult(false);
    setHearts(initialHearts);
    setCoins(0);
    setCombo(0);
    setCharacterEmotion('thinking');
    setCharacterMessage('');
    setShowCharacterMessage(false);
    speechSeqRef.current++;
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    setGameState(nextGameState);
  }, [generateQuestions, level.timeLimit, initialHearts]);

  useEffect(() => {
    resetChallenge(autoStart ? 'playing' : 'ready');
  }, [level.id, autoStart, resetChallenge]);

  // 播报题目内容
  const speakQuestion = useCallback(async (question: string) => {
    // 启动一次全新的播报序列
    const mySeq = ++speechSeqRef.current;
    // 解析题目中的数字和运算符
    const parts = question.split(' ');
    for (let i = 0; i < parts.length; i++) {
      // 若序列已变化，立即中断
      if (speechSeqRef.current !== mySeq) return;
      const part = parts[i].trim();
      if (part === '') continue;
      
      if (!isNaN(Number(part))) {
        // 播放数字
        await playNumber(Number(part));
      } else if (['+', '-', '×', '÷', '=', '*', '/'].includes(part)) {
        // 播放运算符
        await playOperator(part);
      } else if (part === '?') {
        // 跳过"?"的播报，避免怪异语音；仅保留轻微停顿
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // 在每个部分之间添加短暂停顿
      if (i < parts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }, [playNumber, playOperator]);
  
  // 倒计时
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);
  
  // 开始游戏
  const handleStartGame = () => {
    resetChallenge('playing');
    setCharacterEmotion('excited');
    setCharacterMessage('开始挑战！');
    setShowCharacterMessage(true);
    
    setTimeout(() => {
      setCharacterEmotion('thinking');
      setShowCharacterMessage(false);
    }, 1500);
  };

  // 当题目切换时播报题目内容
  useEffect(() => {
    const speechSeq = speechSeqRef;
    if (gameState === 'playing' && currentQuestion) {
      // 清理上一次的延迟
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      // 延迟播报，让用户有时间看到题目
      const t = window.setTimeout(() => {
        speakQuestion(currentQuestion.question);
      }, 600);
      speakTimerRef.current = t as unknown as number;
      return () => {
        if (speakTimerRef.current) {
          clearTimeout(speakTimerRef.current);
          speakTimerRef.current = null;
        }
        // 递增序列，终止任何正在进行的播报
        speechSeq.current++;
      };
    } else {
      // 非playing状态，终止播报
      speechSeq.current++;
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
    }
  }, [currentQuestionIndex, gameState, currentQuestion, speakQuestion]);
  
  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    // 立刻终止任何题目播报，避免选中后还在说话
    speechSeqRef.current++;
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }

    playButtonClick();
    setSelectedAnswer(answer);
    setShowResult(true);
    
    setTimeout(() => {
      const isCorrect = answer === currentQuestion.correctAnswer;
      
      if (isCorrect) {
          const nextCombo = combo + 1;
          playCorrect();
          setScore(prev => prev + 1);
          setCombo(nextCombo);
          
          // 角色庆祝
          if (nextCombo >= 3) {
            setCharacterEmotion('excited');
            setCharacterMessage(`太棒了！连击 x${nextCombo}`);
          } else {
            setCharacterEmotion('happy');
            setCharacterMessage('答对了！');
          }
          setShowCharacterMessage(true);
          
          // 奖励金币
          const coinReward = 10 + (nextCombo - 1) * 2;
          setCoins(prev => prev + coinReward);
        
        // 下一题或完成
        if (currentQuestionIndex < questions.length - 1) {
          setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setCharacterEmotion('thinking');
          setShowCharacterMessage(false);
        }, 1500);
        } else {
          setTimeout(() => {
            setCharacterEmotion('celebrating');
            setCharacterMessage('恭喜完成！');
            setShowCharacterMessage(true);
            setTimeout(() => {
              setGameState('completed');
            }, 1000);
          }, 1500);
        }
      } else {
          playWrong();
          setCombo(0);
          
          // 角色难过
          setCharacterEmotion('sad');
          setCharacterMessage('再想想看...');
          setShowCharacterMessage(true);
          
          setHearts(prev => {
            const newHearts = prev - 1;
            if (newHearts <= 0) {
              setGameState('failed');
            } else {
            // 继续下一题
            setTimeout(() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setCharacterEmotion('thinking');
                  setShowCharacterMessage(false);
                } else {
                  setGameState('completed');
                }
              }, 1500);
          }
          return newHearts;
        });
      }
    }, 500);
  };
  
  const calculateStars = () => {
    if (questions.length === 0) return 0;
    const accuracy = score / questions.length;
    const timeBonus = timeLeft > level.timeLimit * 0.5 ? 1 : 0;
    
    if (accuracy >= 0.9 && timeBonus) return 3;
    if (accuracy >= 0.7) return 2;
    if (accuracy >= 0.5) return 1;
    return 0;
  };
  
  const handleComplete = () => {
    const stars = calculateStars();
    const timeUsed = level.timeLimit - timeLeft;
    onComplete(stars, coins, timeUsed);
  };
  
  if (gameState === 'ready') {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] p-4 flex items-center justify-center"
        onClick={onExit}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 text-center pop-shadow max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-bold text-slate-400 mb-4">[挑战]</div>
          <h2 className="text-3xl font-bold text-[#4B454E] mb-4">{level.name}</h2>
          <p className="text-gray-500 mb-6 font-semibold">
            准备好挑战了吗？<br />
            你有 {level.timeLimit} 秒时间完成 {level.questionsCount} 道题目！
          </p>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-100 rounded-lg p-3">
                <div className="text-blue-600 font-bold">难度</div>
                <div className="text-2xl font-bold text-blue-800 capitalize">
                  {level.difficulty === 'easy' ? '简单' : level.difficulty === 'medium' ? '中等' : '困难'}
                </div>
              </div>
              
              <div className="bg-yellow-100 rounded-lg p-3">
                <div className="text-yellow-600 font-bold">时间限制</div>
                <div className="text-2xl font-bold text-yellow-800">
                  {level.timeLimit}s
                </div>
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleStartGame}
            className="w-full bg-[#66DDB3] text-white font-black py-3 px-6 rounded-xl text-lg pop-shadow-btn-primary active-press"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            开始挑战
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'completed') {
    const stars = calculateStars();
    const timeUsed = level.timeLimit - timeLeft;
    const accuracyPercent = questions.length ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="bg-[#F0F4F8] w-full min-h-screen overflow-hidden relative flex flex-col">
        {/* 背景：占位栏 + 彩色卡片网格 */}
        <div className="absolute inset-0 z-0 flex flex-col p-6 gap-6 overflow-hidden">
          <div className="flex justify-between items-center opacity-80">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm" />
            <div className="h-8 w-32 bg-white rounded-full shadow-sm" />
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {['#FF9F9F', '#FFD97D', '#66DDB3', '#9F85F0', '#60A5FA', '#F472B6'].map((bg) => (
              <div
                key={bg}
                className="h-48 rounded-[32px] relative overflow-hidden flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: bg }}
              >
                <div className="w-16 h-16 bg-white/30 rounded-full" />
                <div className="w-24 h-4 bg-white/30 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* 遮罩 */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px] z-10" />

        {/* 弹窗 */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-[340px] rounded-[32px] pop-shadow p-8 flex flex-col items-center animate-bounce-in">
            {/* 奖杯图标 */}
            <div className="w-20 h-20 rounded-full bg-[#FFF8E7] flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFBE5C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="translate-y-[-1px]"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>

            <h1 className="text-3xl font-black text-[#4B454E] mb-2 tracking-tight">关卡完成！</h1>

            {/* 三星 */}
            <div className="flex items-center gap-3 mb-8">
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill={i < stars ? '#FFBE5C' : 'none'}
                  stroke={i < stars ? '#FFBE5C' : '#E2E8F0'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* 正确率 / 用时 */}
            <div className="grid grid-cols-2 gap-3 w-full mb-8">
              <div className="bg-white border-2 border-slate-50 rounded-[20px] p-3 flex flex-col items-center justify-center pop-shadow-sm h-24">
                <span className="text-[11px] font-bold text-gray-400 mb-1">正确率</span>
                <span className="text-xl font-black text-[#3CC9A0]">{accuracyPercent}%</span>
              </div>
              <div className="bg-white border-2 border-slate-50 rounded-[20px] p-3 flex flex-col items-center justify-center pop-shadow-sm h-24">
                <span className="text-[11px] font-bold text-gray-400 mb-1">用时</span>
                <span className="text-xl font-black text-[#9F85F0]">{timeUsed}s</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                type="button"
                onClick={handleComplete}
                className="w-full h-14 bg-[#66DDB3] rounded-[20px] pop-shadow-btn-primary flex items-center justify-center text-white font-black text-lg tracking-wide active-press transition-transform"
              >
                继续冒险 →
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex-shrink-0 w-10 h-10 bg-white rounded-full mx-auto flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E]"
                aria-label="返回"
              >
                <span className="text-xl leading-none">←</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (gameState === 'failed') {
    const timeUsed = level.timeLimit - timeLeft;
    const failReasonText = timeLeft <= 0 ? '时间到了！' : '生命值耗尽了！';

    return (
      <div className="w-full h-screen bg-[#F8FAFC] overflow-hidden relative">
        {/* 背景内容：顶部栏 + 关卡卡片网格 */}
        <div className="absolute inset-0 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
          {/* 顶部返回 + 星星总数 */}
          <div className="flex justify-between items-center w-full mt-2">
            <button
              type="button"
              onClick={onExit}
              className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E]"
              aria-label="返回"
            >
              <span className="text-xl leading-none">←</span>
            </button>
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-black">
                ★
              </div>
              <span className="font-black text-gray-600 text-lg">{coins}</span>
            </div>
          </div>

          {/* 关卡卡片网格（占位展示） */}
          <div className="grid grid-cols-2 gap-5 mt-4">
            {/* 01 */}
            <div className="aspect-[4/5] bg-[#66DDB3] rounded-[32px] shadow-[0_6px_0_#4BC29A] p-5 flex flex-col items-center justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full" />
              <span className="text-white/90 font-black text-5xl mt-4">01</span>
              <div className="w-full h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-white rounded-full" />
                  <div className="w-3 h-3 bg-white rounded-full" />
                  <div className="w-3 h-3 bg-white/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* 02 */}
            <div className="aspect-[4/5] bg-[#FCD34D] rounded-[32px] shadow-[0_6px_0_#F59E0B] p-5 flex flex-col items-center justify-between relative overflow-hidden">
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/20 rounded-full" />
              <span className="text-white/90 font-black text-5xl mt-4">02</span>
              <div className="w-full h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-white rounded-full" />
                  <div className="w-3 h-3 bg-white/50 rounded-full" />
                  <div className="w-3 h-3 bg-white/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* 03 */}
            <div className="aspect-[4/5] bg-[#2DD4BF] rounded-[32px] shadow-[0_6px_0_#14B8A6] p-5 flex flex-col items-center justify-between relative overflow-hidden">
              <span className="text-white/90 font-black text-5xl mt-4">03</span>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* 04 */}
            <div className="aspect-[4/5] bg-[#F472B6] rounded-[32px] shadow-[0_6px_0_#DB2777] p-5 flex flex-col items-center justify-between relative overflow-hidden">
              <span className="text-white/90 font-black text-5xl mt-4">04</span>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* 05 */}
            <div className="aspect-[4/5] bg-[#A78BFA] rounded-[32px] shadow-[0_6px_0_#8B5CF6] p-5 flex flex-col items-center justify-between relative overflow-hidden">
              <span className="text-white/90 font-black text-5xl mt-4">05</span>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* 06 */}
            <div className="aspect-[4/5] bg-[#FB923C] rounded-[32px] shadow-[0_6px_0_#EA580C] p-5 flex flex-col items-center justify-between relative overflow-hidden">
              <span className="text-white/90 font-black text-5xl mt-4">06</span>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 失败弹窗遮罩 + 弹窗 */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center px-6">
          <div className="w-full max-w-[340px] bg-white rounded-[32px] shadow-modal px-7 py-8 flex flex-col items-center animate-[bounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)]">
            {/* 表情图标 */}
            <div className="w-16 h-16 rounded-full bg-[#FFEAEA] flex items-center justify-center mb-5 shrink-0">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform scale-75"
              >
                <circle cx="22" cy="26" r="4" fill="#FF8585" />
                <circle cx="42" cy="26" r="4" fill="#FF8585" />
                <path
                  d="M22 42C22 42 32 32 42 42"
                  stroke="#FF8585"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 标题与文案 */}
            <h2 className="text-3xl font-black text-[#4B454E] mb-2 tracking-tight">挑战失败</h2>
            <div className="flex flex-col items-center gap-1 mb-8">
              <p className="text-gray-400 text-[15px] font-bold">{failReasonText}</p>
              <p className="text-gray-400 text-[15px] font-bold">
                不要灰心，<span className="text-[#3CC9A0]">再试一次</span>吧！
              </p>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-white border border-gray-100 rounded-[20px] shadow-card py-4 px-2 flex flex-col items-center justify-center">
                <span className="text-gray-400 text-xs font-bold mb-1">答对</span>
                <span className="text-[#3CC9A0] text-2xl font-black">{score} 题</span>
              </div>

              <div className="bg-white border border-gray-100 rounded-[20px] shadow-card py-4 px-2 flex flex-col items-center justify-center">
                <span className="text-gray-400 text-xs font-bold mb-1">用时</span>
                <span className="text-[#F59E0B] text-2xl font-black">{timeUsed}s</span>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex flex-col gap-4 w-full">
              <button
                type="button"
                onClick={() => resetChallenge('playing')}
                className="w-full h-14 bg-[#66DDB3] rounded-[20px] shadow-btn-primary text-white text-lg font-black flex items-center justify-center btn-press transition-all outline-none group"
              >
                <span>重试</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                type="button"
                onClick={onExit}
                className="flex-shrink-0 w-10 h-10 bg-white rounded-full mx-auto flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E]"
                aria-label="返回"
              >
                <span className="text-xl leading-none">←</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] flex items-center justify-center text-[#4B454E] font-bold">
        准备题目中...
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] flex flex-col items-center">
      <div className="w-full h-full max-w-md flex flex-col px-5 pt-10 pb-8 relative">
        {/* 顶部状态栏：第一行 退出 + 生命值/等级 */}
        <div className="flex items-center justify-between w-full mb-3">
          <motion.button
            onClick={onExit}
            className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full shadow-game-header transition-all shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4 text-[#4B454E]" />
            <span className="text-[15px] font-extrabold text-[#4B454E]">退出</span>
          </motion.button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.max(1, initialHearts) }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < hearts ? 'text-[#FF6B6B] fill-[#FF6B6B]' : 'text-[#FF6B6B]/30'
                  }`}
                />
              ))}
            </div>
            <div className="bg-[#6EE7B7] px-2.5 py-1 rounded-full shadow-game-header flex items-center justify-center">
              <span className="text-xs font-black text-[#14532D]">L{level.id}</span>
            </div>
          </div>
        </div>

        {/* 第二行：时间 */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full shadow-game-header">
            <Clock className="w-4 h-4 text-[#4B454E]" />
            <span className="text-[15px] font-black text-[#4B454E]">{timeLeft}s</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full flex flex-col gap-2 mb-8">
          <div className="w-full h-4 bg-white/70 rounded-full p-1 shadow-game-header">
            <div className="h-full bg-[#E5E7EB] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#4F46E5] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <p className="text-center text-[#4B454E]/60 text-sm font-bold tracking-wide">
            第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
          </p>
        </div>

        {/* 题目大卡片 */}
        <main className="w-full bg-white rounded-[32px] shadow-game-card-lg flex items-center justify-center py-10 mb-8 relative z-10">
          <h1 className="text-4xl font-black text-[#4B454E] tracking-tight text-center px-4">
            {currentQuestion.question}
          </h1>
        </main>

        {/* 连击提示 */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -10 }}
              className="text-center mb-4"
            >
              <div className="inline-flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded-full font-bold text-sm">
                <Zap className="w-4 h-4" />
                连击 x{combo}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 选项按钮区 */}
        <div className="grid grid-cols-2 gap-4 w-full mt-auto">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;

            let bgClass = 'bg-white';
            let textClass = 'text-[#4B454E]';

            if (showResult) {
              if (isCorrect) {
                bgClass = 'bg-[#4F46E5]';
                textClass = 'text-white';
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-[#EF4444]';
                textClass = 'text-white';
              } else {
                bgClass = 'bg-white';
                textClass = 'text-[#D1D5DB]';
              }
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`${bgClass} h-24 rounded-[24px] shadow-game-card flex items-center justify-center transition-all ${
                  showResult ? 'cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                }`}
                whileHover={!showResult ? { scale: 1.03 } : {}}
                whileTap={!showResult ? { scale: 0.97 } : {}}
              >
                <span className={`text-4xl font-black ${textClass}`}>{option}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
