import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface AiCoachProps {
    wrongCount: number;
    lastErrorType?: string;
    onClose?: () => void;
}

const AiCoach: React.FC<AiCoachProps> = ({ wrongCount }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // 当错误次数达到2次或更多时，AI教练出现
        if (wrongCount >= 2) {
            const coachingMessages = [
                '没关系，我们慢一点来。如果你有 5 个苹果，拿走 2 个，可以试着用手指点点屏幕数一数哦。',
                '别灰心，你是最棒的！在这个题目里，我们可以先算加号前面的数字。',
                '快看这些小图案，它们在提示你正确答案呢。',
                '需要帮忙吗？我们可以一起数数看。',
            ];
            setMessage(coachingMessages[Math.floor(Math.random() * coachingMessages.length)]);
            setIsVisible(true);

            // 模拟语音辅导（如果有对应的播报文件）
            // playAudio('ai_coaching_hint');
        } else {
            setIsVisible(false);
        }
    }, [wrongCount]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.5 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.5 }}
                    className="fixed bottom-24 right-6 z-50 flex flex-col items-end"
                >
                    {/* 对话气泡 */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-blue-400 max-w-xs mb-4 relative"
                    >
                        <div className="flex items-start gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
                            <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                {message}
                            </p>
                        </div>
                        {/* 气泡尖角 */}
                        <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white border-r-4 border-b-4 border-blue-400 rotate-45" />
                    </motion.div>

                    {/* AI 形象 */}
                    <div className="relative group">
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
                            <span className="text-4xl">🤖</span>
                        </div>
                        {/* 点击关闭 */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center border-2 border-white"
                        >
                            ✕
                        </button>
                        {/* 呼吸效果底盘 */}
                        <div className="absolute -bottom-2 inset-x-0 mx-auto w-12 h-2 bg-black/10 rounded-full blur-sm animate-pulse" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiCoach;
