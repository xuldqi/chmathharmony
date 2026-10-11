import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Zap } from 'lucide-react';

interface ProgressStatsProps {
  studyData: {
    totalTime: number;
    correctRate: number;
    questionsAnswered: number;
    streak: number;
    dailyProgress: Array<{
      date: string;
      questionsAnswered: number;
      correctRate: number;
      timeSpent: number;
    }>;
  };
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ studyData }) => {
  const { totalTime, correctRate, questionsAnswered, streak, dailyProgress } = studyData;

  // 计算进步趋势
  const recentProgress = dailyProgress.slice(-7);
  const avgCorrectRate = recentProgress.reduce((sum, day) => sum + day.correctRate, 0) / recentProgress.length;
  const trend = avgCorrectRate > 80 ? 'up' : avgCorrectRate > 60 ? 'stable' : 'down';

  // 统计卡片数据
  const statsCards = [
    {
      title: '学习时长',
      value: `${Math.floor(totalTime / 60)}小时${totalTime % 60}分钟`,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      emoji: '⏰'
    },
    {
      title: '正确率',
      value: `${correctRate}%`,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      emoji: '目标'
    },
    {
      title: '答题总数',
      value: `${questionsAnswered}题`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      emoji: '练习'
    },
    {
      title: '连续天数',
      value: `${streak}天`,
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      emoji: '连胜'
    }
  ];

  // 生成柱状图数据
  const maxQuestions = Math.max(...recentProgress.map(day => day.questionsAnswered));
  const maxTime = Math.max(...recentProgress.map(day => day.timeSpent));

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          学习进度统计
        </h2>
        <p className="text-gray-600">
          看看你的学习成果吧！
        </p>
      </motion.div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            className={`${card.bgColor} rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{card.emoji}</div>
              <div className={`p-2 rounded-full bg-gradient-to-r ${card.color}`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{card.value}</div>
            <div className="text-sm text-gray-600">{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* 进步趋势指示器 */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">学习趋势</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-600' :
            trend === 'stable' ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            <div className="text-sm font-medium">
              {trend === 'up' ? '进步中' : trend === 'stable' ? '保持稳定' : '需加油'}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          最近7天平均正确率: {avgCorrectRate.toFixed(1)}%
        </div>
      </motion.div>

      {/* 每日答题数量柱状图 */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">每日答题数量</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {recentProgress.map((day, index) => {
            const height = (day.questionsAnswered / maxQuestions) * 100;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
            
            return (
              <motion.div 
                key={day.date}
                className="flex-1 flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <motion.div 
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg relative group cursor-pointer"
                  style={{ height: `${height}%`, minHeight: '8px' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scaleY: 1.1 }}
                >
                  {/* 悬停提示 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                      {day.questionsAnswered}题
                      <br />
                      正确率: {day.correctRate}%
                    </div>
                  </div>
                </motion.div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {dayName}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 学习时长饼图 */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ 每日学习时长分布</h3>
        <div className="flex items-end justify-between gap-2 h-24">
          {recentProgress.map((day, index) => {
            const height = (day.timeSpent / maxTime) * 100;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
            
            return (
              <motion.div 
                key={`time-${day.date}`}
                className="flex-1 flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <motion.div 
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg relative group cursor-pointer"
                  style={{ height: `${height}%`, minHeight: '8px' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scaleY: 1.1 }}
                >
                  {/* 悬停提示 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                      {day.timeSpent}分钟
                    </div>
                  </div>
                </motion.div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {dayName}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>


    </div>
  );
};

export default ProgressStats;