import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdditionPractice from '../components/practice/AdditionPractice';
import SubtractionPractice from '../components/practice/SubtractionPractice';
import MultiplicationPractice from '../components/practice/MultiplicationPractice';
import DivisionPractice from '../components/practice/DivisionPractice';
import ComparisonGame from '../components/practice/ComparisonGame';
import DailyPractice from '../components/practice/DailyPractice';
import '@/styles/practice-page.css';
import AppPageHeader from '@/components/AppPageHeader';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

type PracticeMode = 'menu' | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'comparison' | 'daily';

const Practice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTab = useIsCurrentTab('/practice');
  const [currentMode, setCurrentMode] = useState<PracticeMode>(() => {
    return (location.state as any)?.mode || 'menu';
  });

  const handleModeSelect = (mode: PracticeMode) => {
    setCurrentMode(mode);
  };

  const handleBackToMenu = () => {
    setCurrentMode('menu');
  };

  const renderPracticeContent = () => {
    switch (currentMode) {
      case 'addition':
        return <AdditionPractice onBack={handleBackToMenu} />;
      case 'subtraction':
        return <SubtractionPractice onBack={handleBackToMenu} />;
      case 'multiplication':
        return <MultiplicationPractice onBack={handleBackToMenu} />;
      case 'division':
        return <DivisionPractice onBack={handleBackToMenu} />;
      case 'comparison':
        return <ComparisonGame onBack={handleBackToMenu} />;
      case 'daily':
        return <DailyPractice onBack={handleBackToMenu} />;
      default:
        return null;
    }
  };

  const operations = [
    {
      id: 'addition' as PracticeMode,
      title: '加法',
      symbol: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      bgClass: 'bg-emerald-500',
    },
    {
      id: 'subtraction' as PracticeMode,
      title: '减法',
      symbol: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      ),
      bgClass: 'bg-rose-500',
    },
    {
      id: 'multiplication' as PracticeMode,
      title: '乘法',
      symbol: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      ),
      bgClass: 'bg-purple-500',
    },
    {
      id: 'division' as PracticeMode,
      title: '除法',
      symbol: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
          <path d="M5 12h14" />
          <circle cx="12" cy="6" r="1.75" fill="currentColor" stroke="none" />
          <circle cx="12" cy="18" r="1.75" fill="currentColor" stroke="none" />
        </svg>
      ),
      bgClass: 'bg-amber-500',
    },
  ];

  const renderMenu = () => (
    <div className="practice-page bg-gradient-to-b from-[#E0F7FA] via-[#F3E5F5] to-[#E1BEE7] min-h-screen w-full flex justify-center selection:bg-orange-100">
      <div className="w-full max-w-md h-full min-h-screen flex flex-col relative overflow-hidden">
        <div className="relative z-10 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
          <AppPageHeader
            title="算术练习"
            onBack={isTab ? undefined : () => navigate(-1)}
            showBack={!isTab}
          />
        </div>

        <main className={`relative z-10 flex-1 px-5 pt-3 ${isTab ? 'pb-28' : 'pb-8'}`}>
          <div className="grid grid-cols-2 gap-4">
            {operations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModeSelect(item.id)}
                className="flex flex-col items-center justify-center py-7 px-4 bg-white rounded-3xl border border-slate-100/80 active:translate-y-1 transition-all cursor-pointer select-none"
                style={{
                  boxShadow: '0 6px 0 #DED6E0',
                }}
              >
                <div className={`w-16 h-16 rounded-2xl ${item.bgClass} flex items-center justify-center text-white shadow-md mb-3`}>
                  {item.symbol}
                </div>
                <span className="font-bold text-slate-800 text-lg tracking-wide">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </main>

        {isTab && <MainTabBar />}
      </div>
    </div>
  );

  if (currentMode !== 'menu') {
    // 所有练习模块均已使用新设计（MathPracticeLayout等自带全屏布局）
    if (['addition', 'subtraction', 'multiplication', 'comparison', 'daily', 'division'].includes(currentMode)) {
      return renderPracticeContent();
    }
    // 降级兜底
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5]">
        <div className="px-6 pt-8 pb-2">
          <AppPageHeader
            title="算术练习"
            onBack={handleBackToMenu}
          />
        </div>
        <div className="px-4 pb-8">
          {renderPracticeContent()}
        </div>
      </div>
    );
  }

  return renderMenu();
};

export default Practice;
