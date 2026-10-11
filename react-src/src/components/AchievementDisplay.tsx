import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, Calendar } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: 'basic' | 'advanced' | 'special' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementDisplayProps {
  achievements: Achievement[];
}

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({ achievements }) => {
  const { playNumber } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // 成就类别映射
  const categoryMap = {
    basic: { name: '基础成就', emoji: '🌟', color: 'from-blue-400 to-blue-600' },
    advanced: { name: '进阶成就', emoji: '🏆', color: 'from-purple-400 to-purple-600' },
    special: { name: '特殊成就', emoji: '💎', color: 'from-pink-400 to-pink-600' },
    streak: { name: '连击成就', emoji: '🔥', color: 'from-orange-400 to-orange-600' }
  };

  // 稀有度映射
  const rarityMap = {
    common: { name: '普通', color: 'from-gray-400 to-gray-600', glow: 'shadow-gray-200' },
    rare: { name: '稀有', color: 'from-blue-400 to-blue-600', glow: 'shadow-blue-200' },
    epic: { name: '史诗', color: 'from-purple-400 to-purple-600', glow: 'shadow-purple-200' },
    legendary: { name: '传说', color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-200' }
  };

  // 扩展成就数据
  const extendedAchievements: Achievement[] = [
    ...achievements,
    // 添加更多成就示例
    { id: '5', name: '初学者', description: '完成第一道题目', icon: '🎯', earned: true, earnedDate: '2024-01-10', category: 'basic', rarity: 'common' },
    { id: '6', name: '百题达人', description: '累计答对100道题', icon: '💯', earned: true, earnedDate: '2024-01-18', category: 'advanced', rarity: 'rare' },
    { id: '7', name: '完美主义者', description: '连续20题全对', icon: '✨', earned: false, category: 'special', rarity: 'epic' },
    { id: '8', name: '数学大师', description: '所有题型正确率超过90%', icon: '👑', earned: false, category: 'special', rarity: 'legendary' },
    { id: '9', name: '学习之星', description: '连续学习30天', icon: '🌟', earned: false, category: 'streak', rarity: 'epic' },
    { id: '10', name: '闪电计算', description: '5秒内答对一道题', icon: '⚡', earned: true, earnedDate: '2024-01-16', category: 'special', rarity: 'rare' },
  ];

  // 过滤成就
  const filteredAchievements = selectedCategory === 'all' 
    ? extendedAchievements 
    : extendedAchievements.filter(a => a.category === selectedCategory);

  // 统计数据
  const earnedCount = extendedAchievements.filter(a => a.earned).length;
  const totalCount = extendedAchievements.length;
  const completionRate = Math.round((earnedCount / totalCount) * 100);

  // 按类别统计
  const categoryStats = Object.keys(categoryMap).map(category => {
    const categoryAchievements = extendedAchievements.filter(a => a.category === category);
    const earnedInCategory = categoryAchievements.filter(a => a.earned).length;
    return {
      category,
      total: categoryAchievements.length,
      earned: earnedInCategory,
      ...categoryMap[category as keyof typeof categoryMap]
    };
  });

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    playNumber(Math.floor(Math.random() * 10));
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    playNumber(achievement.earned ? 2 : 1);
  };

  const closeModal = () => {
    setSelectedAchievement(null);
    playNumber(0);
  };

  return (
    <div className="space-y-6">
      {/* 标题和总体统计 */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
          🏆 成就展示
        </h2>
        <p className="text-gray-600">
          展示你的学习成果和荣誉！
        </p>
        
        {/* 进度环 */}
        <motion.div 
          className="relative w-32 h-32 mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - completionRate / 100) }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{completionRate}%</div>
              <div className="text-xs text-gray-600">{earnedCount}/{totalCount}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 类别统计 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryStats.map((stat, index) => (
          <motion.div
            key={stat.category}
            className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => handleCategoryFilter(stat.category)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{stat.emoji}</div>
              <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white text-sm font-bold`}>
                {stat.earned}/{stat.total}
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800">{stat.name}</div>
            <div className="text-sm text-gray-600">
              完成度 {Math.round((stat.earned / stat.total) * 100)}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* 筛选器 */}
      <motion.div 
        className="flex flex-wrap gap-2 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.button
          onClick={() => handleCategoryFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trophy className="w-4 h-4" />
          <span>全部</span>
        </motion.button>
        
        {Object.entries(categoryMap).map(([category, info]) => (
          <motion.button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category
                ? `bg-gradient-to-r ${info.color} text-white shadow-lg`
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{info.emoji}</span>
            <span>{info.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* 成就网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const rarity = rarityMap[achievement.rarity];
            return (
              <motion.div
                key={achievement.id}
                className={`relative bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  achievement.earned ? `${rarity.glow} shadow-lg` : 'opacity-60'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleAchievementClick(achievement)}
                layout
              >
                {/* 稀有度边框 */}
                {achievement.earned && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${rarity.color} opacity-20`} />
                )}
                
                {/* 锁定状态 */}
                {!achievement.earned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                
                {/* 成就图标 */}
                <div className="relative text-center mb-3">
                  <div className={`text-4xl mb-2 ${
                    achievement.earned ? '' : 'grayscale'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  {/* 稀有度标识 */}
                  {achievement.earned && (
                    <div className={`inline-block px-2 py-1 rounded-full bg-gradient-to-r ${rarity.color} text-white text-xs font-bold`}>
                      {rarity.name}
                    </div>
                  )}
                </div>
                
                {/* 成就信息 */}
                <div className="text-center">
                  <h3 className={`font-bold mb-1 ${
                    achievement.earned ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-xs ${
                    achievement.earned ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {/* 获得日期 */}
                  {achievement.earned && achievement.earnedDate && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(achievement.earnedDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                </div>
                
                {/* 发光效果 */}
                {achievement.earned && achievement.rarity === 'legendary' && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 成就详情模态框 */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`text-6xl mb-4 ${
                  selectedAchievement.earned ? '' : 'grayscale'
                }`}>
                  {selectedAchievement.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedAchievement.name}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {selectedAchievement.description}
                </p>
                
                {/* 稀有度和类别 */}
                <div className="flex justify-center gap-2 mb-4">
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${rarityMap[selectedAchievement.rarity].color} text-white text-sm font-bold`}>
                    {rarityMap[selectedAchievement.rarity].name}
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${categoryMap[selectedAchievement.category].color} text-white text-sm font-bold`}>
                    {categoryMap[selectedAchievement.category].name}
                  </div>
                </div>
                
                {/* 状态信息 */}
                {selectedAchievement.earned ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                      <Star className="w-5 h-5" />
                      <span>已获得</span>
                    </div>
                    {selectedAchievement.earnedDate && (
                      <div className="text-sm text-green-600 mt-1">
                        获得时间: {new Date(selectedAchievement.earnedDate).toLocaleDateString('zh-CN')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
                      <Lock className="w-5 h-5" />
                      <span>未获得</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      继续努力，你一定可以获得这个成就！
                    </div>
                  </div>
                )}
                
                <motion.button
                  onClick={closeModal}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  关闭
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default AchievementDisplay;
