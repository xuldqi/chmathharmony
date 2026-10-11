import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import '@/styles/visual-math-page.css';
import AppPageHeader from '@/components/AppPageHeader';

interface Question {
  id: number;
  type: 'addition' | 'subtraction';
  object: string;
  label: string;
  bg: string;
  quantifier: string;
  num1: number;
  num2: number;
  answer: number;
}

interface Stats {
  correct: number;
  total: number;
  stars: number;
}

const QUESTION_TEMPLATES = [
  { object: '小猫', label: '喵', bg: 'bg-amber-400 text-white', quantifier: '只' },
  { object: '苹果', label: '果', bg: 'bg-rose-500 text-white', quantifier: '个' },
  { object: '香蕉', label: '蕉', bg: 'bg-amber-400 text-amber-900', quantifier: '根' },
  { object: '汽车', label: '车', bg: 'bg-blue-500 text-white', quantifier: '辆' },
  { object: '气球', label: '球', bg: 'bg-pink-400 text-white', quantifier: '个' },
  { object: '花朵', label: '花', bg: 'bg-emerald-400 text-white', quantifier: '朵' },
  { object: '小鸟', label: '鸟', bg: 'bg-sky-400 text-white', quantifier: '只' },
  { object: '蝴蝶', label: '蝶', bg: 'bg-purple-400 text-white', quantifier: '只' },
];

const shuffleNumbers = (values: number[]) => {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const VisualMath: React.FC = () => {
  const navigate = useNavigate();
  const { playCorrect, playWrong } = useAudio();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, stars: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [options, setOptions] = useState<number[]>([]);
  const celebrationParticles = useMemo(
    () => Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${1 + Math.random()}s`,
      icon: ['★', '✦', '▲', '●'][Math.floor(Math.random() * 4)],
    })),
    [],
  );

  const buildOptions = useCallback((correctAnswer: number) => {
    const options = new Set([correctAnswer]);
    let attempts = 0;
    
    while (options.size < 4) {
      attempts++;
      let wrongAnswer;
      
      if (attempts < 20) {
        // Try to generate a random nearby number
        wrongAnswer = Math.max(0, correctAnswer + Math.floor(Math.random() * 8) - 3);
      } else {
        // Fallback to sequential numbers to guarantee loop termination
        wrongAnswer = attempts - 20; 
      }
      
      options.add(wrongAnswer);
    }

    return shuffleNumbers(Array.from(options));
  }, []);

  // 生成新题目
  const generateQuestion = useCallback(() => {
    const template = QUESTION_TEMPLATES[Math.floor(Math.random() * QUESTION_TEMPLATES.length)];
    const type = Math.random() > 0.3 ? 'addition' : 'subtraction'; // 70%加法，30%减法
    
    let num1, num2, answer;
    
    if (type === 'addition') {
      num1 = Math.floor(Math.random() * 5) + 1; // 1-5
      num2 = Math.floor(Math.random() * 5) + 1; // 1-5
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 8) + 3; // 3-10
      num2 = Math.floor(Math.random() * num1) + 1; // 1到num1-1
      answer = num1 - num2;
    }

    const question: Question = {
      id: Date.now(),
      type,
      object: template.object,
      label: template.label,
      bg: template.bg,
      quantifier: template.quantifier,
      num1,
      num2,
      answer
    };

    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setShowCelebration(false);
    setOptions(buildOptions(answer));
  }, [buildOptions]);

  // 处理答案选择
  const handleAnswerSelect = async (answer: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const correct = answer === currentQuestion?.answer;
    setIsCorrect(correct);
    
    // 更新统计
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      stars: prev.stars + (correct ? 1 : 0)
    }));
    
    // 播放音效
    if (correct) {
      playCorrect();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      playWrong();
    }

    // 2秒后自动生成下一题
    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  // 渲染物体
  const renderObjects = (
    count: number,
    label: string,
    bg: string,
    options?: { muted?: boolean; bounce?: boolean }
  ) => {
    const { muted, bounce } = options || {};

    // 数量较多（> 5）时做成两行展示（例如 9 个拆为 5 + 4，6 个拆为 3 + 3）
    let rows: number[] = [count];
    if (count > 5) {
      const firstRow = Math.ceil(count / 2);
      rows = [firstRow, count - firstRow];
    }

    let globalIndex = 0;

    return (
      <div
        className={`flex flex-col items-center gap-1.5 mb-2 ${
          bounce ? 'flower-bounce' : ''
        } ${muted ? 'opacity-70 grayscale-[30%]' : ''}`}
      >
        {rows.map((rowCount, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {Array.from({ length: rowCount }).map(() => {
              const curIndex = globalIndex++;
              return (
                <motion.div
                  key={curIndex}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: curIndex * 0.08 }}
                  className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center font-black text-sm shadow-sm select-none`}
                >
                  {label}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // 初始化
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  if (!currentQuestion) {
    return <div>加载中...</div>;
  }

  const correctRate =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const optionStylePresets = [
    'bg-[#7C4DFF] border-b-[6px] border-[#512DA8] shadow-lg shadow-indigo-200',
    'bg-[#FF4081] border-b-[6px] border-[#C2185B] shadow-lg shadow-pink-200',
    'bg-[#00BCD4] border-b-[6px] border-[#0097A7] shadow-lg shadow-cyan-200',
    'bg-[#66BB6A] border-b-[6px] border-[#388E3C] shadow-lg shadow-green-200',
  ];

  return (
    <div className="visual-math-page w-full h-full overflow-hidden bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] text-slate-700 select-none">
      <div className="w-full h-full flex flex-col relative">
        {/* 背景光斑 */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-[#D8EFE7] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-[#E5D7F7] rounded-full blur-3xl pointer-events-none" />

        {/* 顶部导航 */}
        <div className="px-6 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 relative z-20 shrink-0">
          <AppPageHeader
            title="学数学"
            onBack={() => navigate(-1)}
          />
        </div>

        {/* 统计信息 */}
        <div className="px-6 mb-6 relative z-20 shrink-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 pl-4 pr-2 shadow-sm border border-white flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 drop-shadow-sm" />
                <span className="text-amber-500 font-black text-lg">{stats.stars}</span>
              </div>

              <div className="flex flex-col text-[11px] font-bold text-slate-400 leading-tight">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>正确率: {correctRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>已完成: {stats.total} 题</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={generateQuestion}
              className="btn-3d bg-indigo-100 border-b-[3px] border-indigo-200 active:border-b-0 text-indigo-600 px-4 py-2 rounded-full text-xs font-black tracking-wide hover:bg-indigo-200/50"
            >
              换一题
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 flex flex-col relative z-10">
          {/* 题目卡片 */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] border border-white flex-1 flex flex-col items-center justify-center p-6 mb-6 relative overflow-hidden min-h-[340px]">
            <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-purple-200 via-pink-200 to-teal-200" />

            <h2 className="text-xl font-extrabold text-slate-700 mb-8 text-center bg-slate-50 px-6 py-2 rounded-full">
              {currentQuestion.num1}
              {currentQuestion.quantifier}
              {currentQuestion.object}{' '}
              <span className="text-indigo-400 mx-1">
                {currentQuestion.type === 'addition' ? '加上' : '拿走'}
              </span>
              {currentQuestion.num2}
              {currentQuestion.quantifier}
              {currentQuestion.object}
            </h2>

            <div className="flex flex-col items-center w-full gap-4">
              {/* 第一组物体 */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase">
                  {currentQuestion.num1}
                  {currentQuestion.quantifier}
                  {currentQuestion.object}
                </span>
                {renderObjects(currentQuestion.num1, currentQuestion.label, currentQuestion.bg, { bounce: true })}
              </div>

              {/* 运算符 */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 my-1 text-2xl">
                {currentQuestion.type === 'addition' ? '+' : '-'}
              </div>

              {/* 第二组物体 */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase">
                  {currentQuestion.num2}
                  {currentQuestion.quantifier}
                  {currentQuestion.object}
                </span>
                {renderObjects(currentQuestion.num2, currentQuestion.label, currentQuestion.bg, { muted: true })}
              </div>

              {/* 等号 */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 my-1 text-2xl">
                =
              </div>

              {/* 结果 */}
              <div className="relative mt-1">
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50" />
                <div className="text-7xl font-black text-orange-400 drop-shadow-sm relative z-10 transform -rotate-6">
                  {showResult ? currentQuestion.answer : '?'}
                </div>
              </div>
            </div>
          </div>

          {/* 选项按钮 */}
          <div className="grid grid-cols-2 gap-4 mt-auto">
            {options.map((option, index) => {
              const colorPreset =
                optionStylePresets[index % optionStylePresets.length];

              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`btn-3d h-20 rounded-2xl ${colorPreset} text-white text-3xl font-black flex items-center justify-center relative overflow-hidden group ${
                    showResult ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.96 } : {}}
                >
                  <span className="relative z-10">{option}</span>

                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {showResult && option === currentQuestion.answer && (
                    <div className="absolute top-2 right-2 text-emerald-300 font-extrabold text-base">✓</div>
                  )}
                  {showResult &&
                    option === selectedAnswer &&
                    option !== currentQuestion.answer && (
                      <div className="absolute top-2 right-2 text-rose-300 font-extrabold text-base">✕</div>
                    )}
                </motion.button>
              );
            })}
          </div>

          {/* 结果反馈 */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-2xl text-center ${
                isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <div
                className={`text-lg font-bold mb-1 ${
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isCorrect ? '太棒了！答对了！' : '再想想哦~'}
              </div>
              {!isCorrect && (
                <div className="text-sm text-gray-600">
                  正确答案是 {currentQuestion.answer}
                </div>
              )}
            </motion.div>
          )}

          {/* 庆祝动画 */}
          {showCelebration && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {celebrationParticles.map((particle, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    animationDelay: particle.animationDelay,
                    animationDuration: particle.animationDuration,
                  }}
                >
                  {particle.icon}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualMath;
