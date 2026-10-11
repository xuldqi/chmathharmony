import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import type { Achievement } from '@/lib/gameStorage';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const { playCorrect } = useAudio();
  const [isVisible, setIsVisible] = useState(false);
  const confettiStrips = useMemo(
    () => Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      duration: 2 + Math.random() * 2,
      delay: Math.random(),
    })),
    [],
  );

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      playCorrect(); // 播放成就解锁音效
      
      // 5秒后自动关闭
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, playCorrect, handleClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative bg-white rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* 庆祝动画背景 */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {/* 彩带动画 */}
              {confettiStrips.map((strip, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"
                  style={{
                    left: strip.left,
                    top: '-10%',
                  }}
                  animate={{
                    y: ['0%', '120%'],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={
                    { duration: strip.duration, delay: strip.delay, repeat: Infinity, repeatDelay: 3 }
                  }
                />
              ))}
            </div>

            {/* 主要内容 */}
            <div className="relative z-10 text-center">
              {/* 成就解锁标题 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="mb-4"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                  <Trophy className="w-6 h-6" />
                  成就解锁！
                </div>
              </motion.div>

              {/* 成就图标 */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", damping: 8 }}
                className="text-8xl mb-4"
              >
                {achievement.icon}
              </motion.div>

              {/* 成就名称 */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                {achievement.name}
              </motion.h2>

              {/* 成就描述 */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-600 text-lg mb-6"
              >
                {achievement.description}
              </motion.p>

              {/* 庆祝文字 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", damping: 12 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
              >
                🎉 恭喜你！🎉
              </motion.div>

              {/* 继续按钮 */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={handleClose}
                className="mt-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold py-3 px-8 rounded-xl text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                继续游戏
              </motion.button>
            </div>

            {/* 发光效果 */}
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
