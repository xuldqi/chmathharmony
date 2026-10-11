import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '../../hooks/useAudio';
import StudyDataStorage from '../../lib/studyDataStorage';
import MathPracticeLayout, { MathPracticeQuestion, MathPracticeStats } from './MathPracticeLayout';
import '@/styles/practice-page.css';

interface MultiplicationPracticeProps {
  onBack: () => void;
}

const MultiplicationPractice: React.FC<MultiplicationPracticeProps> = ({ onBack }) => {
  const { playNumber, playOperator } = useAudio();
  const [question, setQuestion] = useState<MathPracticeQuestion>({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [stats, setStats] = useState<MathPracticeStats>({ correct: 0, total: 0, stars: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sessionId] = useState(() => StudyDataStorage.startSession('practice'));
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await playNumber(num1);
      await new Promise(resolve => setTimeout(resolve, 400));
      await playOperator('multiply');
      await new Promise(resolve => setTimeout(resolve, 400));
      await playNumber(num2);
    } catch (error) {
      console.error('播放题目语音失败:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  }, [playNumber, playOperator, isPlayingAudio]);

  const replayQuestion = useCallback(() => {
    playQuestionAudio(question.num1, question.num2);
  }, [playQuestionAudio, question.num1, question.num2]);

  const generateQuestion = useCallback((playAudio = true) => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const answer = num1 * num2;
    setQuestion({ num1, num2, answer });
    setUserAnswer('');
    setShowResult(false);
    setShowCelebration(false);
    setFeedback('');
    setQuestionStartTime(Date.now());
    setIsPlayingAudio(false);
    if (playAudio) {
      setTimeout(() => playQuestionAudio(num1, num2), 600);
    }
  }, [playQuestionAudio]);

  useEffect(() => {
    const timer = setTimeout(() => generateQuestion(true), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => StudyDataStorage.endSession();
  }, [sessionId]);

  useEffect(() => {
    const handleBeforeUnload = () => StudyDataStorage.endSession();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId]);

  const playAnswerFeedback = useCallback(async (correct: boolean, answer: number, correctAnswer: number) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      if (correct) {
        await new Promise(resolve => setTimeout(resolve, 300));
        await playNumber(answer);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsPlayingAudio(false);
        setTimeout(() => generateQuestion(true), 900);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        await playNumber(correctAnswer);
        setIsPlayingAudio(false);
      }
    } catch (error) {
      console.error('播放答案反馈语音失败:', error);
      setIsPlayingAudio(false);
    }
  }, [playNumber, generateQuestion, isPlayingAudio]);

  const checkAnswer = useCallback(() => {
    const answer = parseInt(userAnswer);
    const correct = answer === question.answer;
    const timeSpent = Date.now() - questionStartTime;

    StudyDataStorage.recordAnswer(
      `${question.num1} × ${question.num2}`,
      answer.toString(),
      question.answer.toString(),
      'multiplication',
      'medium',
      timeSpent
    );

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
      playAnswerFeedback(true, answer, question.answer);
    } else {
      setFeedback(`不对哦，正确答案是 ${question.answer}，再试试吧！`);
      playAnswerFeedback(false, answer, question.answer);
    }
  }, [userAnswer, question.num1, question.num2, question.answer, questionStartTime, playAnswerFeedback]);

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
            animationDuration: particle.animationDuration,
          }}
        >
          {particle.icon}
        </div>
      ))}
    </div>
  );

  const encouragementText = stats.correct === 0 ? '乘法口诀，轻松掌握！' :
    stats.correct < 5 ? '做得不错，继续加油！' :
    stats.correct < 10 ? '太棒了！你很厉害！' : '哇！你是乘法小专家！';

  return (
    <MathPracticeLayout
      title="乘法练习"
      onBack={onBack}
      operator="×"
      question={question}
      stats={stats}
      userAnswer={userAnswer}
      onUserAnswerChange={setUserAnswer}
      onSubmit={checkAnswer}
      onNextQuestion={() => generateQuestion(true)}
      onReplay={replayQuestion}
      isPlayingAudio={isPlayingAudio}
      showResult={showResult}
      isCorrect={isCorrect}
      feedback={feedback}
      showCelebration={showCelebration}
      encouragementText={encouragementText}
      num1Style={{ bg: 'bg-[#F5F3FF]', border: 'border-[#E9E5FF]', text: 'text-[#7C3AED]' }}
      num2Style={{ bg: 'bg-[#EAF2FF]', border: 'border-[#D6E4FF]', text: 'text-[#3B82F6]' }}
      CelebrationAnimation={CelebrationAnimation}
    />
  );
};

export default MultiplicationPractice;
