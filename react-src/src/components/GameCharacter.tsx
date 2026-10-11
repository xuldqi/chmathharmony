import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GameCharacterProps {
  emotion: 'happy' | 'excited' | 'thinking' | 'sad' | 'celebrating';
  size?: 'small' | 'medium' | 'large';
  position?: 'left' | 'right' | 'center';
  message?: string;
  showMessage?: boolean;
}

export default function GameCharacter({ 
  emotion, 
  size = 'medium', 
  position = 'center',
  message,
  showMessage = false
}: GameCharacterProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // 角色表情和动作
  const characterStates = {
    happy: {
      face: '😊',
      body: '🐼',
      animation: {
        y: [0, -5, 0],
        rotate: [0, 2, -2, 0],
        scale: [1, 1.05, 1]
      },
      duration: 2
    },
    excited: {
      face: '🤩',
      body: '🐼',
      animation: {
        y: [0, -10, 0, -5, 0],
        rotate: [0, 5, -5, 3, 0],
        scale: [1, 1.1, 0.95, 1.05, 1]
      },
      duration: 1.5
    },
    thinking: {
      face: '🤔',
      body: '🐼',
      animation: {
        rotate: [0, 3, -3, 0],
        scale: [1, 1.02, 1]
      },
      duration: 3
    },
    sad: {
      face: '😢',
      body: '🐼',
      animation: {
        y: [0, 2, 0],
        rotate: [0, -2, 2, 0],
        scale: [1, 0.98, 1]
      },
      duration: 2.5
    },
    celebrating: {
      face: '🥳',
      body: '🐼',
      animation: {
        y: [0, -15, 0, -10, 0, -5, 0],
        rotate: [0, 10, -10, 5, -5, 0],
        scale: [1, 1.2, 0.9, 1.1, 0.95, 1.05, 1]
      },
      duration: 2
    }
  };
  
  const sizeClasses = {
    small: 'text-4xl',
    medium: 'text-6xl',
    large: 'text-8xl'
  };
  
  const positionClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center'
  };
  
  const currentState = characterStates[emotion];
  
  // 眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 3);
    }, 3000 + Math.random() * 2000);
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // 情绪变化时播放音效（已移除庆祝数字播放，避免误播）
  useEffect(() => {
    // 添加一个标志来避免组件初始化时播放音效
    const timer = setTimeout(() => {
      // 保持静音，不在组件层自动触发音频
    }, 100); // 短暂延迟确保不是初始化触发
    
    return () => clearTimeout(timer);
  }, [emotion]);
  
  const getBlinkFace = () => {
    if (currentFrame === 1) {
      return '😑'; // 眨眼
    }
    return currentState.face;
  };
  
  return (
    <div className={`flex ${positionClasses[position]} items-end`}>
      <div className="relative">
        {/* 角色主体 */}
        <motion.div
          className={`${sizeClasses[size]} select-none cursor-pointer relative z-10`}
          animate={currentState.animation}
          transition={{
            duration: currentState.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            {/* 身体 */}
            <div className="relative">
              {currentState.body}
              
              {/* 表情覆盖层 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg">{getBlinkFace()}</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* 特效粒子 */}
        {emotion === 'celebrating' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, -50 - Math.random() * 50],
                  opacity: [1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {['⭐', '✨', '🎉', '🎊'][i % 4]}
              </motion.div>
            ))}
          </div>
        )}
        
        {/* 思考泡泡 */}
        {emotion === 'thinking' && (
          <motion.div
            className="absolute -top-8 -right-4 text-2xl"
            animate={{
              y: [0, -5, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            💭
          </motion.div>
        )}
        
        {/* 对话气泡 */}
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-blue-200 min-w-max max-w-xs"
          >
            <div className="text-sm font-medium text-gray-800 text-center">
              {message}
            </div>
            
            {/* 气泡尾巴 */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-200"></div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-[-2px] w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
          </motion.div>
        )}
        
        {/* 心情指示器 */}
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {emotion === 'happy' && (
            <div className="flex gap-1">
              <span className="text-xs">💖</span>
              <span className="text-xs">💖</span>
            </div>
          )}
          {emotion === 'excited' && (
            <div className="flex gap-1">
              <span className="text-xs">⚡</span>
              <span className="text-xs">⚡</span>
              <span className="text-xs">⚡</span>
            </div>
          )}
          {emotion === 'sad' && (
            <div className="flex gap-1">
              <span className="text-xs">💧</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
