import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppPageHeader from '@/components/AppPageHeader';
import GameChallenge from '@/components/GameChallenge';
import AchievementNotification from '@/components/AchievementNotification';
import GameStorage, { type Achievement } from '@/lib/gameStorage';

// 游戏状态类型
type GameState = 'levelSelect' | 'playing' | 'achievements';

// 关卡信息类型（用于GameChallenge）
interface LevelInfo {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  questionsCount: number;
  starsToUnlock: number;
}

// 关卡显示数据类型
interface LevelDisplay {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  unlocked: boolean;
  completed: boolean;
  stars: number;
  maxStars: number;
  difficultyLevel: number;
}

const levelTemplates = [
  { id: 1, name: '数字认知', difficulty: 'easy' as const, difficultyLevel: 1 },
  { id: 2, name: '简单加法', difficulty: 'easy' as const, difficultyLevel: 1 },
  { id: 3, name: '减法练习', difficulty: 'easy' as const, difficultyLevel: 1 },
  { id: 4, name: '乘法入门', difficulty: 'medium' as const, difficultyLevel: 2 },
  { id: 5, name: '除法基础', difficulty: 'medium' as const, difficultyLevel: 2 },
  { id: 6, name: '混合运算', difficulty: 'hard' as const, difficultyLevel: 3 },
];

export default function Game() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('levelSelect');
  const [currentLevel, setCurrentLevel] = useState<LevelDisplay | null>(null);
  const [pendingLevel, setPendingLevel] = useState<LevelDisplay | null>(null);
  const [levels, setLevels] = useState<LevelDisplay[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [, setCharacterEmotion] = useState<'happy' | 'excited' | 'thinking' | 'sad' | 'celebrating'>('happy');
  const [, setCharacterMessage] = useState<string>('选择一个关卡开始挑战吧！');
  const [, setShowCharacterMessage] = useState(true);
  
  // 加载游戏数据
  useEffect(() => {
    const loadGameData = () => {
      const levelProgress = GameStorage.getAllLevels();
      const achievementData = GameStorage.getAchievements();
      
      // 合并关卡模板和进度数据
      const levelDisplayData: LevelDisplay[] = levelTemplates.map(template => {
        const progress = levelProgress.find(p => p.id === template.id);
        return {
          ...template,
          unlocked: progress?.unlocked || false,
          completed: progress?.completed || false,
          stars: progress?.stars || 0,
          maxStars: 3,
          difficultyLevel: template.difficultyLevel,
        };
      });
      
      setLevels(levelDisplayData);
      setAchievements(achievementData);
    };
    
    loadGameData();
    
    // 注册成就解锁回调
    const unsubscribe = GameStorage.onAchievementUnlocked((achievement) => {
      setNewAchievement(achievement);
    });
    
    return unsubscribe;
  }, []);

  const handleBackToHome = () => {
    // 回到上一页（可能是学习中心或首页等）
    navigate(-1);
  };

  const handleLevelClick = (level: LevelDisplay) => {
    if (level.unlocked) {
      setCharacterEmotion('excited');
      setCharacterMessage(`准备好挑战「${level.name}」了吗？`);
      setShowCharacterMessage(true);
      setPendingLevel(level);
    } else {
      setCharacterEmotion('thinking');
      setCharacterMessage('这个关卡还没有解锁哦~');
      setShowCharacterMessage(true);
      
      setTimeout(() => {
        setCharacterEmotion('happy');
        setCharacterMessage('选择一个关卡开始挑战吧！');
      }, 2000);
    }
  };

  const handleConfirmStartLevel = () => {
    if (!pendingLevel) return;
    
    const levelToStart = pendingLevel;
    setPendingLevel(null);
    setCurrentLevel(levelToStart);
    setGameState('playing');
  };

  const handleCloseLevelIntro = () => {
    setPendingLevel(null);
  };

  const handleGameComplete = (stars: number, coins: number, timeUsed: number) => {
    if (currentLevel) {
      // 保存关卡进度
      GameStorage.updateLevelProgress(
        currentLevel.id,
        true,
        stars,
        timeUsed,
        coins
      );
      
      console.log(`关卡 ${currentLevel.name} 完成！获得 ${stars} 星星，${coins} 金币`);
      
      // 重新加载游戏数据
      const levelProgress = GameStorage.getAllLevels();
      const achievementData = GameStorage.getAchievements();
      
      const levelDisplayData: LevelDisplay[] = levelTemplates.map(template => {
        const progress = levelProgress.find(p => p.id === template.id);
        return {
          ...template,
          unlocked: progress?.unlocked || false,
          completed: progress?.completed || false,
          stars: progress?.stars || 0,
          maxStars: 3,
          difficultyLevel: template.difficultyLevel,
        };
      });
      
      setLevels(levelDisplayData);
      setAchievements(achievementData);
      
      // 角色庆祝
      setCharacterEmotion('celebrating');
      setCharacterMessage('太棒了！关卡完成！');
      setShowCharacterMessage(true);
      
      // 返回关卡选择界面
      setGameState('levelSelect');
      setCurrentLevel(null);
    }
    
    // 延迟恢复默认状态
    setTimeout(() => {
      setCharacterEmotion('happy');
      setCharacterMessage('选择下一个关卡继续挑战吧！');
    }, 3000);
  };

  const handleGameExit = () => {
    setCharacterEmotion('thinking');
    setCharacterMessage('没关系，下次再来挑战吧！');
    setShowCharacterMessage(true);
    
    setGameState('levelSelect');
    setCurrentLevel(null);
    
    setTimeout(() => {
      setCharacterEmotion('happy');
      setCharacterMessage('选择一个关卡开始挑战吧！');
    }, 2000);
  };

  // 将LevelDisplay转换为LevelInfo
  const getLevelInfo = (level: LevelDisplay): LevelInfo => {
    const difficultyMap = {
      easy: { timeLimit: 120, questionsCount: 5 },
      medium: { timeLimit: 90, questionsCount: 8 },
      hard: { timeLimit: 60, questionsCount: 10 }
    };
    
    const config = difficultyMap[level.difficulty];
    
    return {
      id: level.id,
      name: level.name,
      difficulty: level.difficulty,
      timeLimit: config.timeLimit,
      questionsCount: config.questionsCount,
      starsToUnlock: 1
    };
  };

  const renderLevelSelect = () => {
    const pendingLevelInfo = pendingLevel ? getLevelInfo(pendingLevel) : null;

    return (
      <div className="w-full h-full bg-[#F3F0FF] text-slate-800 overflow-hidden relative selection:bg-indigo-100">
        <div className="fixed top-[-10%] right-[-10%] w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-80 h-80 bg-fuchsia-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="h-full flex flex-col relative z-10 max-w-md mx-auto">
          {/* 顶部导航：返回 + 标题 */}
          <div className="pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-2 px-6 z-20 shrink-0">
            <AppPageHeader
              title="数学大冒险"
              onBack={handleBackToHome}
            />
          </div>

          {/* 内容滚动区：副标题 + 关卡网格 */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 no-scrollbar scroll-smooth">
            <p className="text-[#4B454E]/70 font-bold mt-2 mb-6 text-lg">
              准备好迎接今天的思维挑战了吗？加油！
            </p>

            <div className="grid grid-cols-2 gap-x-5 gap-y-7 pt-2">
              {levels.map((level) => {
                const isUnlocked = level.unlocked;
                const difficultyLabel =
                  level.difficulty === 'easy' ? '简单' : level.difficulty === 'medium' ? '中等' : '困难';

                // 根据难度设置配色和样式
                let bgUnlocked = '';
                let bgLocked = '';
                let shadowClass = '';
                let starColorClass = '';
                let overlayColorClass = '';
                let titleColorUnlocked = '';
                let titleColorLocked = '';
                let pillBgUnlocked = '';
                let pillTextUnlocked = '';
                let pillBgLocked = '';
                let pillTextLocked = '';
                let numberLockedColor = '';
                let lockColorClass = '';

                if (level.difficulty === 'easy') {
                  bgUnlocked = 'bg-[#6EE7B7]';
                  bgLocked = 'bg-[#A7F3D0]';
                  shadowClass = 'shadow-pop-green';
                  starColorClass = 'text-emerald-800/40';
                  overlayColorClass = 'bg-emerald-900/5';
                  titleColorUnlocked = 'text-emerald-900';
                  titleColorLocked = 'text-emerald-800 opacity-75';
                  pillBgUnlocked = 'bg-white/90';
                  pillTextUnlocked = 'text-emerald-600';
                  pillBgLocked = 'bg-emerald-100/80';
                  pillTextLocked = 'text-emerald-700 opacity-75';
                  numberLockedColor = 'text-emerald-600/30';
                  lockColorClass = 'text-emerald-700';
                } else if (level.difficulty === 'medium') {
                  bgUnlocked = 'bg-[#FCD34D]';
                  bgLocked = 'bg-[#FCD34D]';
                  shadowClass = 'shadow-pop-yellow';
                  starColorClass = 'text-yellow-800/40';
                  overlayColorClass = 'bg-yellow-900/5';
                  titleColorUnlocked = 'text-yellow-900';
                  titleColorLocked = 'text-yellow-900 opacity-75';
                  pillBgUnlocked = 'bg-yellow-100/80';
                  pillTextUnlocked = 'text-yellow-800 opacity-75';
                  pillBgLocked = 'bg-yellow-100/80';
                  pillTextLocked = 'text-yellow-800 opacity-75';
                  numberLockedColor = 'text-yellow-600/30';
                  lockColorClass = 'text-yellow-800';
                } else {
                  bgUnlocked = 'bg-[#FDA4AF]';
                  bgLocked = 'bg-[#FDA4AF]';
                  shadowClass = 'shadow-pop-red';
                  starColorClass = 'text-rose-900/30';
                  overlayColorClass = 'bg-rose-900/5';
                  titleColorUnlocked = 'text-rose-900';
                  titleColorLocked = 'text-rose-900 opacity-75';
                  pillBgUnlocked = 'bg-rose-100/80';
                  pillTextUnlocked = 'text-rose-900 opacity-75';
                  pillBgLocked = 'bg-rose-100/80';
                  pillTextLocked = 'text-rose-900 opacity-75';
                  numberLockedColor = 'text-rose-600/30';
                  lockColorClass = 'text-rose-900';
                }

                const bgClass = isUnlocked ? bgUnlocked : bgLocked;
                const borderClass = isUnlocked ? 'border-[3px] border-white/30' : 'border-[3px] border-white/20';
                const headerOpacityClass = isUnlocked ? '' : 'opacity-60';
                const pillBgClass = isUnlocked ? pillBgUnlocked : pillBgLocked;
                const pillTextClass = isUnlocked ? pillTextUnlocked : pillTextLocked;
                const titleColorClass = isUnlocked ? titleColorUnlocked : titleColorLocked;

                const starsArray = Array.from({ length: level.maxStars });

                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleLevelClick(level)}
                    disabled={!isUnlocked}
                    className={`${bgClass} rounded-[32px] p-4 h-48 flex flex-col justify-between items-center relative ${shadowClass} ${
                      isUnlocked ? 'cursor-pointer group' : 'cursor-not-allowed'
                    } ${borderClass}`}
                  >
                    {!isUnlocked && (
                      <div className={`absolute inset-0 ${overlayColorClass} rounded-[29px] pointer-events-none`} />
                    )}

                    <div className={`w-full flex justify-between items-start ${headerOpacityClass}`}>
                      <div className={`flex gap-0.5 ${starColorClass}`}>
                        {starsArray.map((_, i) => (
                          <i key={i} className="ph-fill ph-star text-sm" aria-hidden="true" />
                        ))}
                      </div>
                      <span className="bg-black/10 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-sm">
                        L{level.difficultyLevel}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center mt-[-10px] relative">
                      <span
                        className={`text-6xl font-black drop-shadow-md transition-transform duration-300 ${
                          isUnlocked ? 'text-white group-hover:scale-110' : `${numberLockedColor} blur-[2px]`
                        }`}
                      >
                        {level.id}
                      </span>
                      {!isUnlocked && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <i className={`ph-fill ph-lock-key text-4xl ${lockColorClass} drop-shadow-sm`} />
                        </div>
                      )}
                      <span className={`font-bold text-sm mt-1 leading-tight ${titleColorClass}`}>{level.name}</span>
                    </div>

                    <div className={`${pillBgClass} px-4 py-1.5 rounded-full ${isUnlocked ? 'shadow-sm' : ''}`}>
                      <span className={`text-xs font-extrabold ${pillTextClass}`}>{difficultyLabel}</span>
                    </div>
                  </button>
                );
              })}

              <div className="col-span-2 h-4" />
            </div>
          </div>
        </div>

        {/* 关卡开始前弹窗：在主页上全屏半透明浮层展示（对齐新 UI 设计） */}
        {pendingLevel && pendingLevelInfo && (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-6 bg-[#4B454E]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-[40px] p-6 shadow-pop-card modal-enter relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl z-0" />

              <div className="relative z-10 flex flex-col items-center">
                {/* 顶部关卡标签 */}
                <div className="bg-[#E0F7EF] px-3 py-1 rounded-full flex items-center gap-1 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#3CC9A0]" />
                  <span className="text-[#3CC9A0] font-extrabold text-xs tracking-wide">
                    {pendingLevel.name}
                  </span>
                </div>

                {/* 标题 */}
                <h2 className="text-3xl font-black text-[#4B454E] mb-3 text-center">
                  {pendingLevel.name}
                </h2>

                {/* 描述文案 */}
                <p className="text-center text-[#9CA3AF] font-bold text-sm leading-relaxed mb-8 px-4">
                  准备好挑战了吗？你有{' '}
                  <span className="text-[#3CC9A0] text-base">
                    {pendingLevelInfo.timeLimit}
                    秒
                  </span>{' '}
                  完成{' '}
                  <span className="text-[#9F85F0] text-base">
                    {pendingLevelInfo.questionsCount}
                    道题目
                  </span>
                  ！
                </p>

                {/* 信息卡片：难度 & 时间限制 */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8 text-sm">
                  <div className="bg-white border-2 border-gray-50 rounded-[24px] shadow-pop-small p-4 flex flex-col items-center justify-center">
                    <span className="text-gray-400 text-xs font-bold mb-1">难度</span>
                    <span className="text-[#3CC9A0] text-xl font-black">
                      {pendingLevel.difficulty === 'easy'
                        ? '简单'
                        : pendingLevel.difficulty === 'medium'
                        ? '中等'
                        : '困难'}
                    </span>
                  </div>

                  <div className="bg-white border-2 border-gray-50 rounded-[24px] shadow-pop-small p-4 flex flex-col items-center justify-center">
                    <span className="text-gray-400 text-xs font-bold mb-1">时间限制</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[#FFBE5C] text-2xl font-black">
                        {pendingLevelInfo.timeLimit}
                      </span>
                      <span className="text-[#FFBE5C] text-sm font-bold">s</span>
                    </div>
                  </div>
                </div>

                {/* 按钮区域 */}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleConfirmStartLevel}
                    className="w-full bg-[#66DDB3] hover:bg-[#5FE3B5] text-white font-extrabold text-lg py-4 rounded-full shadow-pop-btn-mint active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 group"
                  >
                    开始挑战
                    <i className="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseLevelIntro}
                    className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E]"
                    aria-label="返回"
                  >
                    <span className="text-xl leading-none">←</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAchievements = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => setGameState('levelSelect')}
          className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E]"
          aria-label="返回"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl leading-none">←</span>
        </motion.button>
        
        <h1 className="text-2xl font-bold text-white">成就殿堂</h1>
        
        <div className="w-20"></div>
      </div>

      {/* 副标题 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <p className="text-white/80 text-lg">展示你的学习成果！</p>
      </motion.div>

      {/* 成就列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-6 rounded-3xl border-4 border-white/30 shadow-lg
              ${achievement.unlocked 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                : 'bg-gray-300 text-gray-500 opacity-60'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{achievement.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{achievement.name}</h3>
                <p className="text-sm opacity-80">{achievement.description}</p>
              </div>
              {achievement.unlocked && (
                <div className="text-2xl">✅</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* 主要游戏界面 */}
      {(() => {
        switch (gameState) {
          case 'levelSelect':
            return renderLevelSelect();
          case 'playing':
            return currentLevel ? (
              <GameChallenge
                level={getLevelInfo(currentLevel)}
                onComplete={handleGameComplete}
                onExit={handleGameExit}
                autoStart
              />
            ) : renderLevelSelect();
          case 'achievements':
            return renderAchievements();
          default:
            return renderLevelSelect();
        }
      })()}
      
      {/* 成就通知 */}
      <AchievementNotification
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
    </>
  );
}
