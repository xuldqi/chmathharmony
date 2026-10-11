import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type PanInfo } from 'framer-motion';
import { Volume2, HelpCircle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import '@/styles/time-master-page.css';
import AppPageHeader from '@/components/AppPageHeader';

const TimeMaster: React.FC = () => {
    const navigate = useNavigate();
    const { isAudioEnabled, playCorrect, playWrong, speakText, playTime } = useAudio();

    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [isGameMode, setIsGameMode] = useState(false);
    const [targetTime, setTargetTime] = useState({ h: 0, m: 0 });
    const [showFeedback, setShowFeedback] = useState<{ success: boolean; message: string } | null>(null);

    const clockRef = useRef<HTMLDivElement>(null);

    // 初始化设置
    useEffect(() => {
        if (isGameMode) {
            generateChallenge();
        }
    }, [isGameMode]);

    const generateChallenge = () => {
        const h = Math.floor(Math.random() * 12) + 1;
        const m = Math.floor(Math.random() * 12) * 5; // 5分钟一格
        setTargetTime({ h, m });
        setShowFeedback(null);
    };

    const calculateAngleFromPoint = (clientX: number, clientY: number, isHour: boolean) => {
        if (!clockRef.current) return;
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
        const normalizedAngle = angle < 0 ? angle + 360 : angle;

        if (isHour) {
            let newHour = Math.round(normalizedAngle / 30);
            if (newHour === 0) newHour = 12;
            setHour(newHour);
        } else {
            let newMinute = Math.round(normalizedAngle / 6) % 60;
            // 取整到最近的5分钟，方便儿童操作
            newMinute = Math.round(newMinute / 5) * 5 % 60;
            setMinute(newMinute);
        }
    };

    const calculateAngle = (e: React.MouseEvent | React.TouchEvent, isHour: boolean) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        calculateAngleFromPoint(clientX, clientY, isHour);
    };

    const handleSpeakTime = () => {
        if (!isAudioEnabled) return;

        playTime(hour, minute);
    };

    const checkAnswer = () => {
        const isCorrect = hour === targetTime.h && minute === targetTime.m;
        if (isCorrect) {
            playCorrect();
            setShowFeedback({ success: true, message: '太棒了！时间完全正确！' });
            setTimeout(generateChallenge, 2000);
        } else {
            playWrong();
            setShowFeedback({ success: false, message: '再试一次哦，看看指针指在哪里？' });
        }
    };

    const displayTime = `${hour}:${minute.toString().padStart(2, '0')}`;

    return (
        <div className="time-master-page flex flex-col h-full w-full">
            <div className="pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-2 px-6 z-20 shrink-0 relative">
                <AppPageHeader
                    title="认识时钟"
                    onBack={() => navigate(-1)}
                />
            </div>

            <main className="flex-1 flex flex-col px-6 py-4 gap-4 overflow-y-auto hide-scrollbar pb-8">
                {/* 顶部信息卡片 */}
                <div className="bg-white rounded-[32px] p-6 shadow-pop-white flex items-center justify-between">
                    {isGameMode ? (
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                                请拨动指针到
                            </span>
                            <span className="text-4xl font-black text-orange-500 tracking-tight">
                                {targetTime.h}:{targetTime.m.toString().padStart(2, '0')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                                当前时间是
                            </span>
                            <span className="text-5xl font-black text-slate-800 tracking-tight">
                                {displayTime}
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={isGameMode ? checkAnswer : handleSpeakTime}
                        className="h-12 w-12 bg-[#66DDB3] rounded-2xl flex items-center justify-center text-white shadow-pop-mint"
                    >
                        {isGameMode ? (
                            <HelpCircle className="w-6 h-6" />
                        ) : (
                            <Volume2 className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`text-center font-bold text-sm ${
                            showFeedback.success ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {showFeedback.message}
                    </motion.div>
                )}

                {/* 时钟盘面 */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[340px] relative">
                    <div
                        ref={clockRef}
                        className="w-[280px] h-[280px] clock-face relative"
                        style={{ touchAction: 'none' }}
                    >
                        {/* 中心圆点 */}
                        <div className="clock-center" />

                        {/* 时针 */}
                        <motion.div
                            className="clock-hand bg-slate-700 w-[8px] h-[70px] cursor-pointer"
                            style={{
                                transform: `translateX(-50%) rotate(${
                                    (hour % 12) * 30 + (minute / 60) * 30
                                }deg)`,
                            }}
                            onPan={(_event, info: PanInfo) =>
                                calculateAngleFromPoint(info.point.x, info.point.y, true)}
                            onClick={(e) => calculateAngle(e, true)}
                        />

                        {/* 分针 */}
                        <motion.div
                            className="clock-hand bg-[#6C63FF] w-[6px] h-[100px] cursor-pointer"
                            style={{
                                transform: `translateX(-50%) rotate(${minute * 6}deg)`,
                            }}
                            onPan={(_event, info: PanInfo) =>
                                calculateAngleFromPoint(info.point.x, info.point.y, false)}
                            onClick={(e) => calculateAngle(e, false)}
                        />

                        {/* 12、3、6、9 */}
                        <div className="clock-number" style={{ top: 15, left: '50%', transform: 'translateX(-50%)' }}>
                            12
                        </div>
                        <div className="clock-number" style={{ top: '50%', right: 15, transform: 'translateY(-50%)' }}>
                            3
                        </div>
                        <div className="clock-number" style={{ bottom: 15, left: '50%', transform: 'translateX(-50%)' }}>
                            6
                        </div>
                        <div className="clock-number" style={{ top: '50%', left: 15, transform: 'translateY(-50%)' }}>
                            9
                        </div>

                        {/* 其他数字 */}
                        <div className="clock-number" style={{ top: 25, right: 65 }}>
                            1
                        </div>
                        <div className="clock-number" style={{ top: 65, right: 25 }}>
                            2
                        </div>
                        <div className="clock-number" style={{ bottom: 65, right: 25 }}>
                            4
                        </div>
                        <div className="clock-number" style={{ bottom: 25, right: 65 }}>
                            5
                        </div>
                        <div className="clock-number" style={{ bottom: 25, left: 65 }}>
                            7
                        </div>
                        <div className="clock-number" style={{ bottom: 65, left: 25 }}>
                            8
                        </div>
                        <div className="clock-number" style={{ top: 65, left: 25 }}>
                            10
                        </div>
                        <div className="clock-number" style={{ top: 25, left: 65 }}>
                            11
                        </div>

                        {/* 内圈 */}
                        <div className="absolute inset-4 rounded-full border-2 border-slate-100 pointer-events-none" />
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-slate-400">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-bold">提示：拖动指针改变时间</span>
                    </div>
                </div>

                {/* 底部挑战按钮 */}
                <button
                    type="button"
                    onClick={() => {
                        const next = !isGameMode;
                        setIsGameMode(next);
                        if (!next) {
                            setShowFeedback(null);
                        }
                    }}
                    className="w-full bg-[#FFEF85] rounded-[24px] h-16 flex items-center justify-center gap-3 shadow-pop-yellow transition-all mt-auto shrink-0 group"
                >
                    <span className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#78350F] font-black text-sm">
                        ?
                    </span>
                    <span className="text-[#78350F] text-xl font-black tracking-wide">
                        {isGameMode ? '退出练习' : '挑战一下'}
                    </span>
                </button>
            </main>
        </div>
    );
};

export default TimeMaster;
