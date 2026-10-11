import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

interface DailyProgress {
  date: string;
  questionsAnswered: number;
  correctRate: number;
  timeSpent: number;
  streak?: boolean;
}

interface StudyCalendarProps {
  dailyProgress: DailyProgress[];
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ dailyProgress }) => {
  const { playNumber } = useAudio();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DailyProgress | null>(null);

  // 使用真实学习数据，不再生成随机模拟数据
  const calendarData: DailyProgress[] = [...dailyProgress].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 获取当前月份的日期信息
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 生成日历网格
  const calendarDays = [];
  
  // 添加空白天数
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 添加月份中的天数
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // 获取某一天的学习数据
  const getDayData = (day: number): DailyProgress | null => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return calendarData.find(d => d.date === dateStr) || null;
  };

  // 获取学习强度颜色
  const getIntensityColor = (data: DailyProgress | null): string => {
    if (!data) return 'bg-gray-100';
    
    const { questionsAnswered, timeSpent, correctRate } = data;
    const intensity = (questionsAnswered / 50) * 0.4 + (timeSpent / 60) * 0.3 + (correctRate / 100) * 0.3;
    
    if (intensity >= 0.8) return 'bg-green-500';
    if (intensity >= 0.6) return 'bg-green-400';
    if (intensity >= 0.4) return 'bg-green-300';
    if (intensity >= 0.2) return 'bg-green-200';
    return 'bg-green-100';
  };

  // 月份导航
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    playNumber(direction === 'prev' ? 1 : 2);
  };

  // 点击日期
  const handleDayClick = (day: number) => {
    const dayData = getDayData(day);
    setSelectedDay(dayData);
    playNumber(dayData ? 3 : 0);
  };

  // 关闭详情
  const closeDetails = () => {
    setSelectedDay(null);
    playNumber(0);
  };

  // 计算统计数据
  const monthData = calendarData.filter(d => {
    const date = new Date(d.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  
  const studyDays = monthData.length;
  const totalQuestions = monthData.reduce((sum, d) => sum + d.questionsAnswered, 0);
  const avgCorrectRate = monthData.length > 0 
    ? Math.round(monthData.reduce((sum, d) => sum + d.correctRate, 0) / monthData.length)
    : 0;
  const totalTime = monthData.reduce((sum, d) => sum + d.timeSpent, 0);

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          学习日历
        </h2>
        <p className="text-gray-600">
          记录你的每日学习足迹！
        </p>
      </motion.div>

      {/* 月度统计 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '学习天数', value: `${studyDays}天`, icon: Calendar, color: 'from-blue-500 to-blue-600', emoji: '天数' },
          { label: '答题总数', value: `${totalQuestions}题`, icon: Target, color: 'from-green-500 to-green-600', emoji: '题数' },
          { label: '平均正确率', value: `${avgCorrectRate}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', emoji: '率' },
          { label: '学习时长', value: `${Math.floor(totalTime / 60)}h${totalTime % 60}m`, icon: Clock, color: 'from-orange-500 to-orange-600', emoji: '⏰' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{stat.emoji}</div>
              <div className={`p-2 rounded-full bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* 日历主体 */}
      <motion.div 
        className="bg-white rounded-3xl p-6 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* 日历头部 */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.h3 
            className="text-xl font-bold text-gray-800"
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {year}年{month + 1}月
          </motion.h3>
          
          <motion.button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${
              index === 0 || index === 6 ? 'text-red-500' : 'text-gray-600'
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            
            const dayData = getDayData(day);
            const intensityColor = getIntensityColor(dayData);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <motion.div
                key={day}
                className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg relative ${
                  intensityColor
                } ${
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(day)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-medium ${
                    dayData ? 'text-white' : 'text-gray-600'
                  }`}>
                    {day}
                  </span>
                </div>
                
                {/* 连击标识 */}
                {dayData?.streak && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                      
                    </div>
                  </div>
                )}
                
                {/* 今天标识 */}
                {isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 强度说明 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="text-sm text-gray-600">学习强度:</span>
          <div className="flex items-center gap-2">
            {[
              { color: 'bg-gray-100', label: '无' },
              { color: 'bg-green-100', label: '低' },
              { color: 'bg-green-200', label: '中低' },
              { color: 'bg-green-300', label: '中' },
              { color: 'bg-green-400', label: '中高' },
              { color: 'bg-green-500', label: '高' },
            ].map((level, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${level.color}`} />
                <span className="text-xs text-gray-600">{level.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 日期详情模态框 */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetails}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {new Date(selectedDay.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </h3>
                
                {/* 学习数据 */}
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-medium">答题数量</span>
                      <span className="text-2xl font-bold text-blue-800">{selectedDay.questionsAnswered}题</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">正确率</span>
                      <span className="text-2xl font-bold text-green-800">{selectedDay.correctRate}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 font-medium">学习时长</span>
                      <span className="text-2xl font-bold text-purple-800">{selectedDay.timeSpent}分钟</span>
                    </div>
                  </div>
                  
                  {selectedDay.streak && (
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <div className="flex items-center justify-center gap-2 text-orange-600 font-medium">
                        
                        <span>连击日！</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 评价 */}
                <div className={`rounded-2xl p-4 mb-4 ${
                  selectedDay.correctRate >= 90 ? 'bg-green-100 text-green-800' :
                  selectedDay.correctRate >= 80 ? 'bg-blue-100 text-blue-800' :
                  selectedDay.correctRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className="font-medium">
                    {selectedDay.correctRate >= 90 ? '表现优秀！' :
                     selectedDay.correctRate >= 80 ? '表现良好！' :
                     selectedDay.correctRate >= 70 ? '继续努力！' :
                     '需要加油！'}
                  </div>
                </div>
                
                <motion.button
                  onClick={closeDetails}
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

export default StudyCalendar;