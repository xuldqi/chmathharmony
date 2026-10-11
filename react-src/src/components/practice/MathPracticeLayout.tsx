import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, RefreshCw, Check, Heart, Mic, MicOff } from 'lucide-react';
import '@/styles/practice-page.css';
import AppPageHeader from '@/components/AppPageHeader';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

export interface MathPracticeQuestion {
  num1: number;
  num2: number;
  answer: number;
}

export interface MathPracticeStats {
  stars: number;
  correct: number;
  total: number;
}

export interface MathPracticeLayoutProps {
  title: string;
  onBack: () => void;
  operator: string;
  question: MathPracticeQuestion;
  stats: MathPracticeStats;
  userAnswer: string;
  onUserAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onNextQuestion: () => void;
  onReplay: () => void;
  isPlayingAudio: boolean;
  showResult: boolean;
  isCorrect: boolean;
  feedback: string;
  showCelebration: boolean;
  encouragementText?: string;
  /** 第一个数字的样式: bg, border, text */
  num1Style?: { bg: string; border: string; text: string };
  /** 第二个数字的样式 */
  num2Style?: { bg: string; border: string; text: string };
  /** 庆祝动画组件 */
  CelebrationAnimation?: React.FC;
  /** 统计栏右侧可选按钮（如乘法表的「乘法表」按钮） */
  optionalStatsButton?: React.ReactNode;
}

const defaultNum1Style = { bg: 'bg-[#E8FBF4]', border: 'border-[#C9F0E0]', text: 'text-[#3CC9A0]' };
const defaultNum2Style = { bg: 'bg-[#EAF2FF]', border: 'border-[#D6E4FF]', text: 'text-[#3B82F6]' };

function chineseToNumber(str: string): string {
  const cleanStr = str.replace(/\s+/g, '');
  if (/^\d+$/.test(cleanStr)) {
    return cleanStr;
  }

  const charMap: Record<string, number> = {
    '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
  };

  if (cleanStr.length === 1 && charMap[cleanStr] !== undefined) {
    return String(charMap[cleanStr]);
  }

  if (cleanStr.length === 2) {
    const c1 = cleanStr[0];
    const c2 = cleanStr[1];
    if (c1 === '十' && charMap[c2] !== undefined) {
      return String(10 + charMap[c2]);
    }
    if (charMap[c1] !== undefined && c2 === '十') {
      return String(charMap[c1] * 10);
    }
  }

  if (cleanStr.length === 3) {
    const c1 = cleanStr[0];
    const c2 = cleanStr[1];
    const c3 = cleanStr[2];
    if (charMap[c1] !== undefined && c2 === '十' && charMap[c3] !== undefined) {
      return String(charMap[c1] * 10 + charMap[c3]);
    }
  }

  const match = cleanStr.match(/\d+/);
  return match ? match[0] : '';
}

export default function MathPracticeLayout({
  title,
  onBack,
  operator,
  question,
  stats,
  userAnswer,
  onUserAnswerChange,
  onSubmit,
  onNextQuestion,
  onReplay,
  isPlayingAudio,
  showResult,
  isCorrect,
  feedback,
  showCelebration,
  encouragementText = '加油！你一定可以的！',
  num1Style = defaultNum1Style,
  num2Style = defaultNum2Style,
  CelebrationAnimation,
  optionalStatsButton,
}: MathPracticeLayoutProps) {
  const [isHearMode, setIsHearMode] = useState(() => {
    return localStorage.getItem('math_hear_mode') === 'true';
  });

  const { isListening, result, startRecognition, stopRecognition } = useVoiceRecognition();

  const toggleHearMode = () => {
    const nextVal = !isHearMode;
    setIsHearMode(nextVal);
    localStorage.setItem('math_hear_mode', String(nextVal));
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  useEffect(() => {
    if (result) {
      const parsed = chineseToNumber(result);
      if (parsed) {
        onUserAnswerChange(parsed);
      }
    }
  }, [result, onUserAnswerChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer && !showResult) {
      onSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      onUserAnswerChange(value);
    }
  };

  return (
    <div className="math-practice-page bg-gradient-to-b from-[#E8F6F1] to-[#F3E0FA] min-h-screen w-full flex flex-col text-[#4B454E] overflow-hidden selection:bg-[#66DDB3] selection:text-white relative">
      {/* 装饰背景 */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[100px] right-[-30px] w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* 头部 */}
      <div className="w-full px-6 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 relative z-10">
        <AppPageHeader
          title={title}
          onBack={onBack}
          rightElement={
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={toggleHearMode}
                className={`px-3 py-1.5 rounded-full border-[2px] text-xs font-black transition-all ${
                  isHearMode
                    ? 'bg-[#A855F7] border-[#A855F7] text-white shadow-[0_2px_0_#9333EA]'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {isHearMode ? '听算: 开' : '听算: 关'}
              </button>
            </div>
          }
        />
      </div>

      {/* 主内容 */}
      <main className="flex-1 px-5 flex flex-col gap-6 z-10 overflow-y-auto pb-32 no-scrollbar">
        {/* 统计卡片 */}
        <div className="bg-white w-full rounded-[24px] shadow-pop p-2 pl-4 pr-2 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-6 h-6 text-[#FFBE5C] drop-shadow-sm animate-bounce-slow fill-[#FFBE5C]" />
              <span className="text-2xl font-black text-[#4B454E]">{stats.stars}</span>
            </div>
            <div className="w-0.5 h-8 bg-gray-100 rounded-full" />
            <div className="flex flex-col leading-none gap-1">
              <div className="text-xs font-bold text-[#9CA3AF]">
                正确率: <span className="text-[#4B454E] font-black">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</span>
              </div>
              <div className="text-xs font-bold text-[#9CA3AF]">
                已完成: <span className="text-[#4B454E] font-black">{stats.total}题</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {optionalStatsButton}
            <button
              type="button"
              onClick={onNextQuestion}
              className="bg-[#66DDB3] hover:bg-[#5CD4AA] text-white px-5 py-2.5 rounded-full shadow-[0_4px_0_#4BC29A] active:shadow-none active:translate-y-[4px] transition-all font-extrabold text-sm tracking-wide whitespace-nowrap flex items-center gap-1.5 group"
            >
              <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-300" />
              换一题
            </button>
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white w-full rounded-[32px] shadow-pop p-6 flex flex-col items-center gap-8 relative mt-2">
          {/* 题目展示 */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-4 mt-4">
            <div className="relative group cursor-default">
              <div className={`w-20 h-24 sm:w-24 sm:h-28 ${num1Style.bg} rounded-[20px] flex items-center justify-center border-b-4 ${num1Style.border} group-hover:translate-y-1 group-hover:border-b-0 transition-all duration-200`}>
                <span className={`text-4xl sm:text-5xl font-black ${num1Style.text}`}>
                  {isHearMode ? '?' : question.num1}
                </span>
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#9CA3AF] pb-2">{operator}</div>

            <div className="relative group cursor-default">
              <div className={`w-20 h-24 sm:w-24 sm:h-28 ${num2Style.bg} rounded-[20px] flex items-center justify-center border-b-4 ${num2Style.border} group-hover:translate-y-1 group-hover:border-b-0 transition-all duration-200`}>
                <span className={`text-4xl sm:text-5xl font-black ${num2Style.text}`}>
                  {isHearMode ? '?' : question.num2}
                </span>
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#9CA3AF] pb-2">=</div>

            <div className="relative">
              <div className="w-20 h-24 sm:w-24 sm:h-28 border-4 border-dashed border-[#FFBE5C] bg-[#FFF8EB] rounded-[20px] flex items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black text-[#FFBE5C]">?</span>
              </div>
            </div>
          </div>

          {/* 播放/重听按钮 */}
          <button
            type="button"
            onClick={onReplay}
            disabled={isPlayingAudio}
            className="flex items-center gap-2 bg-[#F3E0FA] px-4 py-2 rounded-full hover:bg-[#ECD0F7] transition-colors cursor-pointer group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-end gap-[2px] h-4 pb-1">
              <div className={`w-1 bg-[#A855F7] rounded-full h-2 ${isPlayingAudio ? 'animate-pulse' : ''}`} style={{ animationDuration: '0.6s' }} />
              <div className={`w-1 bg-[#A855F7] rounded-full h-3 ${isPlayingAudio ? 'animate-pulse' : ''}`} style={{ animationDuration: '0.8s' }} />
              <div className={`w-1 bg-[#A855F7] rounded-full h-1.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} style={{ animationDuration: '1s' }} />
            </div>
            <span className="text-xs font-bold text-[#A855F7] group-hover:text-[#9333EA]">
              {isPlayingAudio ? '播放中...' : '重听题目'}
            </span>
          </button>

          <div className="w-full h-px bg-transparent my-1" />

          {/* 输入区域 */}
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder={isListening ? "请说出你的答案..." : "输入答案"}
                  disabled={showResult || isListening}
                  className={`w-full h-[64px] rounded-[20px] border-[3px] border-[#FFBE5C] text-center font-black text-[#4B454E] placeholder:text-gray-300 placeholder:font-bold bg-white focus:bg-[#FFFCF5] transition-all caret-[#FFBE5C] ${
                    userAnswer ? 'text-4xl' : 'text-lg'
                  }`}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                  <svg className="w-6 h-6 text-[#FFBE5C]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M227.31 73.37L182.63 28.68a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h44.69A15.86 15.86 0 0 0 104 219.31L227.31 96a16 16 0 0 0 0-22.63zM51.31 160 136 75.31 152.69 92 68 176.69zM48 179.31 76.69 208H48zm48 28.69L48 188.69 48 160 76.69 160 176 60.69 195.31 80z" />
                  </svg>
                </div>
              </div>

              {/* 语音答题按钮 */}
              {!showResult && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-[64px] h-[64px] rounded-[20px] border-[3px] flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-red-100 border-red-400 text-red-500 animate-pulse' 
                      : 'bg-white border-[#66DDB3] text-[#66DDB3] hover:bg-[#E8F6F1]'
                  }`}
                  title={isListening ? "停止录音" : "语音输入答案"}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>

            {!showResult && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!userAnswer}
                className={`w-full h-[60px] rounded-[20px] transition-all flex items-center justify-center gap-3 group ${
                  !userAnswer
                    ? 'bg-gray-300 shadow-[0_5px_0_#9CA3AF] cursor-not-allowed'
                    : 'bg-[#66DDB3] hover:bg-[#5CD4AA] shadow-pop-mint btn-active-mint'
                }`}
              >
                <div className="bg-white/20 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xl font-black tracking-wider">提交答案</span>
              </button>
            )}

            {showResult && (
              <div className={`p-6 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback}
                </div>
                {!isCorrect && (
                  <button
                    type="button"
                    onClick={onNextQuestion}
                    className="bg-[#66DDB3] hover:bg-[#5CD4AA] text-white font-bold px-6 py-3 rounded-xl transition-colors mt-2"
                  >
                    换一题
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 底部鼓励 */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 pointer-events-none z-20">
        <div className="bg-white rounded-full px-6 py-3.5 shadow-pop-sm flex items-center gap-3 animate-bounce-slow pointer-events-auto hover:scale-105 transition-transform cursor-default border-2 border-white">
          <Heart className="w-5 h-5 text-[#FF6B6B] fill-[#FF6B6B] animate-pulse" style={{ animationDuration: '1.5s' }} />
          <span className="text-[14px] font-black text-[#9CA3AF] tracking-wide">{encouragementText}</span>
        </div>
      </div>

      {showCelebration && CelebrationAnimation && <CelebrationAnimation />}
    </div>
  );
}
