import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAudio } from '../../hooks/useAudio';
import StudyDataStorage from '../../lib/studyDataStorage';
import '@/styles/practice-page.css';
import AppPageHeader from '@/components/AppPageHeader';

interface ComparisonGameProps {
  onBack: () => void;
}

interface Question {
  num1: number;
  num2: number;
  correctAnswer: '>' | '<' | '=';
}

interface Stats {
  correct: number;
  total: number;
  stars: number;
}

type ComparisonOperator = '>' | '<' | '=';

const ComparisonGame: React.FC<ComparisonGameProps> = ({ onBack }) => {
  const { playNumber, playCorrect, playWrong, playOperator } = useAudio();
  const [question, setQuestion] = useState<Question>({ num1: 0, num2: 0, correctAnswer: '=' });
  const [selectedAnswer, setSelectedAnswer] = useState<ComparisonOperator | null>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, stars: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [draggedOperator, setDraggedOperator] = useState<ComparisonOperator | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const dropTargetRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => StudyDataStorage.startSession('game'));
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioAbortControllerRef = useRef<AbortController | null>(null);
  const celebrationParticles = useMemo(
    () => Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${1 + Math.random()}s`,
      icon: ['★', '✦', '▲', '●'][Math.floor(Math.random() * 5)],
    })),
    [],
  );

  const playQuestionAudio = useCallback(async (num1: number, num2: number) => {
    if (audioAbortControllerRef.current) audioAbortControllerRef.current.abort();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const controller = new AbortController();
    audioAbortControllerRef.current = controller;
    setIsPlayingAudio(true);
    setAudioError(null);

    try {
      if (controller.signal.aborted) return;
      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, 500);
        controller.signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('cancelled')); });
      });
      if (controller.signal.aborted) return;
      await playNumber(num1);

      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, 1000);
        controller.signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('cancelled')); });
      });
      if (controller.signal.aborted) return;
      await playNumber(num2);
    } catch (e) {
      if (e instanceof Error && e.message === 'cancelled') return;
      console.error('语音播放失败:', e);
      setAudioError('语音播放失败，请检查音频设置');
    } finally {
      if (!controller.signal.aborted) {
        setIsPlayingAudio(false);
        audioAbortControllerRef.current = null;
      }
    }
  }, [playNumber, isPlayingAudio]);

  const generateQuestion = useCallback(() => {
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const correctAnswer: ComparisonOperator = num1 > num2 ? '>' : num1 < num2 ? '<' : '=';

    setQuestion({ num1, num2, correctAnswer });
    setSelectedAnswer(null);
    setShowResult(false);
    setShowCelebration(false);
    setFeedback('');
    setAudioError(null);
    setQuestionStartTime(Date.now());
    setTimeout(() => playQuestionAudio(num1, num2), 600);
  }, [playQuestionAudio]);

  useEffect(() => {
    const t = setTimeout(() => generateQuestion(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (audioAbortControllerRef.current) {
        audioAbortControllerRef.current.abort();
      }
      StudyDataStorage.endSession();
    };
  }, [sessionId]);

  useEffect(() => {
    const h = () => StudyDataStorage.endSession();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [sessionId]);

  const playAnswerFeedback = useCallback(async (correct: boolean) => {
    setIsPlayingAudio(false);
    if (correct) {
      await playCorrect();
      setTimeout(() => generateQuestion(), 1200);
    } else {
      await playWrong();
    }
  }, [playCorrect, playWrong, generateQuestion]);

  const checkAnswer = useCallback((answer: ComparisonOperator) => {
    const correct = answer === question.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;

    StudyDataStorage.recordAnswer(
      `${question.num1} ? ${question.num2}`,
      answer,
      question.correctAnswer,
      'mixed',
      'easy',
      timeSpent
    );

    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      stars: prev.stars + (correct ? 1 : 0)
    }));

    if (correct) {
      setFeedback('太棒了！答对了！');
      setShowCelebration(true);
      playAnswerFeedback(true);
    } else {
      setFeedback(`不对哦，正确答案是 ${question.num1} ${question.correctAnswer} ${question.num2}，再试试吧！`);
      playAnswerFeedback(false);
    }
  }, [question.num1, question.num2, question.correctAnswer, playAnswerFeedback, questionStartTime]);

  const handleDragStart = (e: React.DragEvent, operator: ComparisonOperator) => {
    setDraggedOperator(operator);
    e.dataTransfer.effectAllowed = 'move';
    playOperator(operator);
  };

  const handleDragEnd = () => setDraggedOperator(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedOperator && !showResult) checkAnswer(draggedOperator);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleTouchStart = (e: React.TouchEvent, operator: ComparisonOperator) => {
    setDraggedOperator(operator);
    setTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    playOperator(operator);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedOperator) {
      // e.preventDefault(); // Note: passive by default in React, but we can prevent default by css `touch-action: none` on the button
      setTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (draggedOperator && dropTargetRef.current) {
      const dropRect = dropTargetRef.current.getBoundingClientRect();
      const touchX = e.changedTouches[0].clientX;
      const touchY = e.changedTouches[0].clientY;
      if (
        touchX >= dropRect.left &&
        touchX <= dropRect.right &&
        touchY >= dropRect.top &&
        touchY <= dropRect.bottom
      ) {
        if (!showResult) checkAnswer(draggedOperator);
      }
    }
    setDraggedOperator(null);
    setTouchPos(null);
  };

  const CelebrationAnimation = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {celebrationParticles.map((particle, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        >
          {particle.icon}
        </div>
      ))}
    </div>
  );

  const OperatorButton = ({ op, label }: { op: ComparisonOperator; label: string }) => (
    <div className="flex flex-col items-center gap-2 flex-1">
      <button
        type="button"
        onClick={() => {
          if (!showResult) {
            playOperator(op);
            checkAnswer(op);
          }
        }}
        draggable={!showResult}
        onDragStart={(e) => handleDragStart(e, op)}
        onDragEnd={handleDragEnd}
        className={`w-full aspect-square bg-white border-2 border-gray-50 rounded-[16px] shadow-[0_4px_0_#DED6E0] flex items-center justify-center active:shadow-none active:translate-y-[4px] transition-all hover:bg-gray-50 group ${!showResult ? 'cursor-grab active:cursor-grabbing touch-none' : ''} ${draggedOperator === op ? 'opacity-50' : ''}`}
        onTouchStart={(e) => !showResult && handleTouchStart(e, op)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <span className="text-4xl font-black text-[#4B454E] group-hover:scale-110 transition-transform pointer-events-none">{op}</span>
      </button>
      <span className="text-xs font-bold text-gray-400">{label}</span>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] min-h-screen w-full flex justify-center items-start selection:bg-purple-100">
      <div className="w-full max-w-md h-full min-h-screen flex flex-col px-6 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-6 gap-6 relative">
        {/* 头部 */}
        <div className="w-full">
          <AppPageHeader
            title="比大小游戏"
            onBack={onBack}
          />
        </div>

        {/* 统计卡片 */}
        <div className="bg-white w-full rounded-[24px] shadow-[0_6px_0_#DED6E0] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FFBE5C]" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            <span className="text-2xl font-black text-[#4B454E]">{stats.stars}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400">正确率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</span>
            <span className="text-xs font-bold text-gray-400">已完成: {stats.total}题</span>
          </div>
          <button
            type="button"
            onClick={generateQuestion}
            className="bg-[#4BC29A] text-white text-sm font-bold px-4 py-2 rounded-full shadow-[0_4px_0_#2E9675] active:shadow-none active:translate-y-[4px] transition-all hover:bg-[#43ad8a]"
          >
            换一题
          </button>
        </div>

        {/* 说明与播放状态 */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-gray-500 text-sm font-bold text-center w-3/4">点击符号，比较两个数字的大小关系</p>
          {isPlayingAudio && (
            <div className="bg-[#EDE8FF] px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#9F85F0] animate-pulse" />
              <span className="text-[#9F85F0] text-sm font-extrabold">正在播放题目语音...</span>
            </div>
          )}
          {audioError && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="text-sm font-bold">{audioError}</span>
              <button type="button" onClick={() => playQuestionAudio(question.num1, question.num2)} className="text-xs underline">重试</button>
            </div>
          )}
        </div>

        {/* 题目卡片 */}
        <div className="bg-white w-full rounded-[24px] shadow-[0_6px_0_#DED6E0] p-6 flex flex-col items-center gap-8">
          <div className="flex items-center justify-center gap-4 w-full">
            <div className="w-24 h-24 bg-[#E0FBF2] rounded-[20px] flex items-center justify-center shadow-sm">
              <span className="text-[#3CC9A0] text-5xl font-black">{question.num1}</span>
            </div>
            <div
              ref={dropTargetRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`w-20 h-24 border-[3px] border-dashed rounded-[16px] flex items-center justify-center bg-transparent transition-colors ${
                showResult ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : draggedOperator ? 'border-[#66DDB3] bg-[#EBFBF7]' : 'border-[#DED6E0]'
              }`}
            >
              {showResult ? (
                <span className={`text-4xl font-black ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>{selectedAnswer}</span>
              ) : (
                <span className="text-[#DED6E0] text-4xl font-black">?</span>
              )}
            </div>
            <div className="w-24 h-24 bg-[#EDE8FF] rounded-[20px] flex items-center justify-center shadow-sm">
              <span className="text-[#9F85F0] text-5xl font-black">{question.num2}</span>
            </div>
          </div>

          {!showResult && (
            <div className="flex items-end justify-between w-full px-2 gap-4">
              <OperatorButton op=">" label="大于" />
              <OperatorButton op="<" label="小于" />
              <OperatorButton op="=" label="等于" />
            </div>
          )}
          
          {/* Ghost dragged element for mobile touch */}
          {draggedOperator && touchPos && (
            <div 
              className="fixed pointer-events-none z-[100] w-[80px] h-[80px] bg-white border-2 border-[#66DDB3] rounded-[16px] shadow-lg flex items-center justify-center opacity-90"
              style={{ 
                left: touchPos.x, 
                top: touchPos.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span className="text-4xl font-black text-[#4B454E]">{draggedOperator}</span>
            </div>
          )}

          {showResult && (
            <div className={`w-full p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className={`text-lg font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>
              {!isCorrect && (
                <button
                  type="button"
                  onClick={generateQuestion}
                  className="bg-[#4BC29A] hover:bg-[#43ad8a] text-white font-bold px-4 py-2 rounded-full text-sm pop-shadow-sm pop-shadow-sm-active"
                >
                  换一题
                </button>
              )}
            </div>
          )}
        </div>

        {/* 操作提示 */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_0_#DED6E0] py-3 px-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FFBE5C]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z" />
            </svg>
            <span className="text-sm font-black text-[#4B454E]">点击符号</span>
          </div>
        </div>

        {/* 鼓励 */}
        <div className="bg-white rounded-full shadow-[0_4px_0_#DED6E0] py-2 px-6 flex items-center justify-center gap-2 mx-auto w-max">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <span className="text-xs font-bold text-gray-400">
            {stats.correct === 0 ? '加油！你一定可以的！' : stats.correct < 5 ? '做得不错，继续努力！' : stats.correct < 10 ? '太棒了！你的观察力很强！' : '哇！你是比较大师！'}
          </span>
        </div>
      </div>

      {showCelebration && <CelebrationAnimation />}
    </div>
  );
};

export default ComparisonGame;
