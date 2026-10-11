import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  Calculator,
  BookOpen,
  Gamepad2,
  Sparkles,
  Clock,
  Store,
  Gift,
  BarChart3,
  User,
  ShieldCheck,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import CartoonButton from '@/components/CartoonButton';
import MainTabBar from '@/components/MainTabBar';

export default function Home() {
  const navigate = useNavigate();
  const { isAudioEnabled, toggleAudio } = useAudio();
  const [gridCols, setGridCols] = useState('grid-cols-2');

  // 检测设备类型和屏幕尺寸
  useEffect(() => {
    const detectDevice = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const aspectRatio = screenWidth / screenHeight;
      const isLandscape = aspectRatio > 1.3;
      
      // 检测是否为平板或桌面
      const isTabletOrDesktop = screenWidth >= 1024 || 
        (screenWidth >= 768 && isLandscape) ||
        (screenWidth >= 900 && screenHeight >= 600);
      
      if (isTabletOrDesktop) {
        setGridCols('grid-cols-3');
      } else {
        setGridCols('grid-cols-2');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', () => {
      setTimeout(detectDevice, 100); // 延迟检测，等待方向变化完成
    });

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);
  
  const handleCalculatorClick = () => {
    console.log('打开小鹿口算计算器');
    navigate('/calculator');
  };

  const handlePracticeClick = () => {
    console.log('打开数学练习');
    navigate('/practice');
  };

  const handleGameClick = () => {
    console.log('打开数学大冒险');
    navigate('/game');
  };

  const handleReportClick = () => {
    console.log('打开学习报告');
    navigate('/report');
  };

  const handleSettingsClick = () => {
    console.log('打开设置');
    navigate('/settings');
  };

  const handleVisualMathClick = () => {
    console.log('打开学数学');
    navigate('/visual-math');
  };

  const handleMoneyCashierClick = () => {
    console.log('打开小小收银员');
    navigate('/money-cashier');
  };

  const handleTimeMasterClick = () => {
    console.log('打开认识时钟');
    navigate('/time-master');
  };

  const handleMyClick = () => {
    console.log('打开我的');
    navigate('/my');
  };

  const handleParentDashboardClick = () => {
    console.log('打开家长控制中心');
    navigate('/parent-dashboard');
  };

  const handleSavingsClick = () => {
    console.log('打开心愿存钱罐');
    navigate('/savings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] via-[#E8F4FF] to-[#F3E0FA] p-6 pb-28 relative">
      {/* 顶部控制区域 */}
      <div className="text-center mb-10 max-w-md mx-auto">
        <h1 className="text-3xl font-black text-[#4B454E] mb-2 tracking-tight">
          语音计算器
        </h1>
        <p className="text-sm font-bold text-[#6B7280] mb-2">
          全年龄都能用，随时练习口算
        </p>
        <p className="text-sm font-bold text-[#9CA3AF] mb-5">
          试试说：2 加 3
        </p>
        
        {/* 声音控制大按钮 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleAudio}
            className={`
              relative w-20 h-20 rounded-full
              pop-shadow-sm
              transform transition-all duration-300
              hover:scale-110 active:scale-95
              border-4 border-white/30
              group overflow-hidden
              ${
                isAudioEnabled
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }
            `}
            style={{
              boxShadow: `0 8px 25px ${
                isAudioEnabled ? '#16a34a' : '#6b7280'
              }40, inset 0 1px 0 rgba(255,255,255,0.3)`
            }}
          >
            {/* 3D光泽效果 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
            
            {/* 按钮内容 */}
            <div className="relative z-10 flex items-center justify-center h-full">
              {isAudioEnabled ? (
                <Volume2 className="w-9 h-9 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]" />
              ) : (
                <VolumeX className="w-9 h-9 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]" />
              )}
            </div>
          </button>
        </div>
        
        <p className={`text-sm font-black transition-colors duration-300 ${
          isAudioEnabled ? 'text-green-600' : 'text-[#8A8490]'
        }`}>
          {isAudioEnabled ? '声音已开启' : '声音已关闭'}
        </p>
      </div>

      {/* 主入口 */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-10">
          <CartoonButton
            title="开始语音计算"
            icon={<Calculator className="w-14 h-14 text-white" />}
            bgGradient="bg-gradient-to-br from-orange-200 to-orange-400"
            shadowColor="#fb923c"
            onClick={handleCalculatorClick}
            sizeClass="w-60 h-60"
            variant="gentle"
          />

          <div className="max-w-md bg-white/80 backdrop-blur rounded-2xl px-4 py-3 text-sm font-bold text-[#6B7280] pop-shadow-sm border border-white/60">
            点击按钮后，对着麦克风说话即可开始计算。
          </div>
        </div>

        <div className="text-center text-sm font-black text-[#4B454E] mb-4 tracking-wide">
          其他功能
        </div>

        <div className={`grid ${gridCols} gap-6 justify-items-center`}>
          {/* 学习核心 */}
          <CartoonButton
            title="练习模式"
            icon={<BookOpen className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-emerald-200 to-emerald-400"
            shadowColor="#34d399"
            onClick={handlePracticeClick}
            variant="gentle"
          />

          <CartoonButton
            title="闯关练习"
            icon={<Gamepad2 className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-violet-200 to-violet-400"
            shadowColor="#a855f7"
            onClick={handleGameClick}
            variant="gentle"
          />

          <CartoonButton
            title="知识点学习"
            icon={<Sparkles className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-rose-200 to-rose-400"
            shadowColor="#f43f5e"
            onClick={handleVisualMathClick}
            variant="gentle"
          />

          <CartoonButton
            title="认识时钟"
            icon={<Clock className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-blue-200 to-blue-400"
            shadowColor="#3b82f6"
            onClick={handleTimeMasterClick}
            variant="gentle"
          />

          {/* 生活应用 */}
          <CartoonButton
            title="小小收银员"
            icon={<Store className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-emerald-100 to-emerald-300"
            shadowColor="#10b981"
            onClick={handleMoneyCashierClick}
            variant="gentle"
          />

          <CartoonButton
            title="心愿存钱罐"
            icon={<Gift className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-indigo-200 to-indigo-400"
            shadowColor="#6366f1"
            onClick={handleSavingsClick}
            variant="gentle"
          />

          {/* 账户与设置 */}
          <CartoonButton
            title="学习报告"
            icon={<BarChart3 className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-cyan-200 to-cyan-400"
            shadowColor="#22d3ee"
            onClick={handleReportClick}
            variant="gentle"
          />

          <CartoonButton
            title="我的"
            icon={<User className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-pink-200 to-pink-400"
            shadowColor="#ec4899"
            onClick={handleMyClick}
            variant="gentle"
          />

          <CartoonButton
            title="家长控制"
            icon={<ShieldCheck className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-slate-200 to-slate-500"
            shadowColor="#475569"
            onClick={handleParentDashboardClick}
            variant="gentle"
          />

          <CartoonButton
            title="设置"
            icon={<SettingsIcon className="w-10 h-10 text-white" />}
            bgGradient="bg-gradient-to-br from-slate-200 to-slate-400"
            shadowColor="#64748b"
            onClick={handleSettingsClick}
            variant="gentle"
          />
        </div>
      </div>

      {/* 儿童保护功能入口（按要求从首页移除，仅在设置页保留） */}

      <MainTabBar />
    </div>
  );
}
