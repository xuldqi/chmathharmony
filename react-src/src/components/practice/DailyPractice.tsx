import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '../../hooks/useAudio';
import GameStorage from '../../lib/gameStorage';
import StudyDataStorage from '../../lib/studyDataStorage';
import MathPracticeLayout, { MathPracticeQuestion, MathPracticeStats } from './MathPracticeLayout';
import { Award, Home, Star } from 'lucide-react';

interface DailyPracticeProps {
  onBack: () => void;
}

interface MixedQuestion extends MathPracticeQuestion {
  type: 'addition' | 'subtraction';
}

const DailyPractice: React.FC<DailyPracticeProps> = ({ onBack }) => {
  const { playNumber, playOperator } = useAudio();
  const [question, setQuestion] = useState<MixedQuestion>({ num1: 0, num2: 0, answer: 0, type: 'addition' });
  const [userAnswer, setUserAnswer] = useState('');
  const [stats, setStats] = useState<MathPracticeStats>({ correct: 0, total: 0, stars: 0 });
  
  // 挑战状态
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1); // 1 to 20
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isChallengeComplete, setIsChallengeComplete] = useState(false);
  
  const [sessionId] = useState(() => StudyDataStorage.startSession('practice'));
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const celebrationParticles = useMemo(
    () => Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 1.5}s`,
      animationDuration: `${1.5 + Math.random()}s`,
      icon: ['⭐', '🎉', '✨', '🌟', '💰', '🦌'][Math.floor(Math.random() * 6)],
    })),
    [],
  );

  const playQuestionAudio = useCallback(async (num1: number, num2: number, type: 'addition' | 'subtraction') => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playNumber(num1);
      await new Promise(resolve => setTimeout(resolve, 400));
      await playOperator(type === 'addition' ? 'add' : 'subtract');
      await new Promise(resolve => setTimeout(resolve, 400));
      await playNumber(num2);
    } catch (error) {
      console.error('播放题目语音失败:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  }, [playNumber, playOperator, isPlayingAudio]);

  const replayQuestion = useCallback(() => {
    playQuestionAudio(question.num1, question.num2, question.type);
  }, [playQuestionAudio, question.num1, question.num2, question.type]);

  const generateQuestion = useCallback((index: number, playAudio = true) => {
    const isAddition = Math.random() > 0.5;
    let num1 = 0;
    let num2 = 0;
    let answer = 0;

    if (isAddition) {
      num1 = Math.floor(Math.random() * 15) + 1; // 1-15
      num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 18) + 3; // 3-20
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // ensure answer > 0
      answer = num1 - num2;
    }

    setQuestion({ num1, num2, answer, type: isAddition ? 'addition' : 'subtraction' });
    setUserAnswer('');
    setShowResult(false);
    setShowCelebration(false);
    setFeedback('');
    setIsPlayingAudio(false);
    
    if (playAudio) {
      setTimeout(() => playQuestionAudio(num1, num2, isAddition ? 'addition' : 'subtraction'), 600);
    }
  }, [playQuestionAudio]);

  useEffect(() => {
    const timer = setTimeout(() => generateQuestion(1, true), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => StudyDataStorage.endSession();
  }, [sessionId]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= 20) {
      // 挑战完成
      localStorage.setItem('math_daily_completed_date', new Date().toDateString());
      setIsChallengeComplete(true);
      setShowCelebration(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      generateQuestion(currentQuestionIndex + 1, true);
    }
  };

  const playAnswerFeedback = useCallback(async (correct: boolean, answer: number, correctAnswer: number) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      if (correct) {
        await new Promise(resolve => setTimeout(resolve, 300));
        await playNumber(answer);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsPlayingAudio(false);
        setTimeout(() => {
          handleNextQuestion();
        }, 900);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        await playNumber(correctAnswer);
        setIsPlayingAudio(false);
      }
    } catch (error) {
      console.error('播放反馈语音失败:', error);
      setIsPlayingAudio(false);
    }
  }, [playNumber, isPlayingAudio, currentQuestionIndex, question]);

  const handleSubmit = () => {
    const parsed = parseInt(userAnswer, 10);
    const correct = parsed === question.answer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setFeedback('回答正确！真棒！');
      setShowCelebration(true);
      setStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        stars: Math.min(3, Math.floor(((prev.correct + 1) / 20) * 3))
      }));
    } else {
      setFeedback(`答错了，正确答案是 ${question.answer}`);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1
      }));
    }

    playAnswerFeedback(correct, parsed, question.answer);
  };

  // 渲染完成挑战后的炫酷结算页面
  if (isChallengeComplete) {
    return (
      <div className="math-practice-page bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] min-h-screen w-full flex flex-col items-center justify-center p-6 text-[#4B454E] relative overflow-hidden">
        {/* 庆祝彩带 */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {celebrationParticles.map((p, i) => (
              <span
                key={i}
                className="absolute text-2xl animate-float-particle"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.animationDelay,
                  animationDuration: p.animationDuration,
                }}
              >
                {p.icon}
              </span>
            ))}
          </div>
        )}

        <div className="bg-white w-full max-w-md rounded-[32px] shadow-pop p-8 flex flex-col items-center text-center gap-6 relative z-10 border-[4px] border-white">
          <div className="w-24 h-24 rounded-full bg-[#FEF3C7] border-[4px] border-[#F59E0B] flex items-center justify-center shadow-lg animate-bounce-slow">
            <Award className="w-12 h-12 text-[#D97706]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#4B454E]">口算打卡成功！</h1>
            <p className="text-sm font-bold text-gray-400">完成今日份的口算挑战任务</p>
          </div>

          <div className="w-full bg-[#EBFBF7] border-[2px] border-emerald-200 rounded-2xl p-4 flex flex-col items-center gap-1">
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">今日学习达成</span>
            <span className="text-emerald-600 font-black text-base mt-1">已成功记录到学习报告！</span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full text-left mt-2">
            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col justify-center border-b-[4px] border-gray-100">
              <span className="text-[10px] font-bold text-gray-400">正确率</span>
              <span className="text-xl font-black text-[#4B454E]">
                {Math.round((stats.correct / 20) * 100)}%
              </span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col justify-center border-b-[4px] border-gray-100">
              <span className="text-[10px] font-bold text-gray-400">答对题目</span>
              <span className="text-xl font-black text-[#4B454E]">
                {stats.correct} / 20 题
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full h-[60px] bg-[#66DDB3] hover:bg-[#5CD4AA] rounded-[20px] shadow-pop-mint btn-active-mint transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Home className="w-5 h-5 text-white" />
            <span className="text-white text-xl font-black tracking-wider">返回学习中心</span>
          </button>
        </div>
      </div>
    );
  }

  const customTitle = `每日口算 (${currentQuestionIndex}/20)`;

  return (
    <MathPracticeLayout
      title={customTitle}
      onBack={onBack}
      operator={question.type === 'addition' ? '+' : '-'}
      question={question}
      stats={stats}
      userAnswer={userAnswer}
      onUserAnswerChange={setUserAnswer}
      onSubmit={handleSubmit}
      onNextQuestion={handleNextQuestion}
      onReplay={replayQuestion}
      isPlayingAudio={isPlayingAudio}
      showResult={showResult}
      isCorrect={isCorrect}
      feedback={feedback}
      showCelebration={showCelebration}
      encouragementText={`第 ${currentQuestionIndex} 题，坚持就是胜利！`}
    />
  );
};

export default DailyPractice;
