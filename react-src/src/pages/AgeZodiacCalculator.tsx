import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Calendar, HelpCircle, Star, Sparkles, Cake } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import { useAudio } from '@/hooks/useAudio';

// 十二生肖
const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 十二星座判定
function getConstellation(month: number, day: number) {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  const names = [
    '摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座',
    '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座'
  ];
  return day < dates[month - 1] ? names[month - 1] : names[month];
}

export default function AgeZodiacCalculator() {
  const navigate = useNavigate();
  const { speakText } = useAudio();

  // 出生日期
  const [birthDateStr, setBirthDateStr] = useState<string>('1998-08-18');

  // 计算结果
  const result = useMemo(() => {
    if (!birthDateStr) return null;
    const [y, m, d] = birthDateStr.split('-').map(Number);
    const birth = new Date(y, m - 1, d);
    const now = new Date();

    if (birth > now) return null;

    // 1. 周岁 (实岁)
    let age = now.getFullYear() - y;
    const isBirthdayPassedThisYear =
      now.getMonth() > m - 1 || (now.getMonth() === m - 1 && now.getDate() >= d);
    if (!isBirthdayPassedThisYear) {
      age -= 1;
    }
    const realAge = Math.max(0, age);

    // 2. 虚岁 (出生即1岁，过年长1岁)
    const nominalAge = now.getFullYear() - y + 1;

    // 3. 生活总天数
    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalMonths = Math.floor(totalDays / 30.4375);

    // 4. 生肖属相 (以1900年鼠年为基准)
    const zodiacIndex = (y - 1900) % 12;
    const zodiac = ZODIACS[zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12];

    // 5. 十二星座
    const constellation = getConstellation(m, d);

    // 6. 下一个生日倒计时
    let nextBday = new Date(now.getFullYear(), m - 1, d);
    now.setHours(0, 0, 0, 0);
    nextBday.setHours(0, 0, 0, 0);
    if (nextBday < now) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const daysUntilNextBday = Math.round((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      realAge,
      nominalAge,
      totalDays,
      totalMonths,
      zodiac,
      constellation,
      daysUntilNextBday,
    };
  }, [birthDateStr]);

  const handleSpeak = () => {
    if (!result) return;
    const text = `您当前的周岁为${result.realAge}岁，虚岁${result.nominalAge}岁，属相属${result.zodiac}，属于${result.constellation}。距离您的下一个生日还有${result.daysUntilNextBday}天。`;
    speakText(text);
  };

  const handleReset = () => {
    setBirthDateStr('1998-08-18');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans select-none pb-12">
      <AppPageHeader title="年龄生肖与星座计算" onBack={() => navigate(-1)} />

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {/* 输入出生日期卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>选择出生公历日期</span>
            <span className="text-indigo-600 font-extrabold text-xs">
              {birthDateStr}
            </span>
          </div>

          <div className="relative">
            <input
              type="date"
              value={birthDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* 核心年龄卡片 */}
        {result && (
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                <Cake className="w-4 h-4" />
                当前周岁年龄
              </span>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title="语音朗读结果"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">{result.realAge}</span>
              <span className="text-base text-indigo-200 font-bold">周岁 (虚岁 {result.nominalAge} 岁)</span>
            </div>

            <div className="text-xs text-indigo-100 font-bold bg-white/10 px-3 py-1.5 rounded-xl inline-block">
              🎂 距离下一个生日还剩 {result.daysUntilNextBday} 天
            </div>

            {/* 生肖与星座 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/20 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">生肖属相</div>
                <div className="text-lg font-black text-amber-200">生肖【{result.zodiac}】</div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-2xl">
                <div className="text-[10px] text-indigo-200 font-bold mb-0.5">所属星座</div>
                <div className="text-lg font-black text-amber-200">{result.constellation}</div>
              </div>
            </div>
          </div>
        )}

        {/* 人生旅程统计卡片 */}
        {result && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>你已经来到这个世界上</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] text-slate-400 font-bold mb-0.5">累计度过天数</div>
                <div className="text-xl font-black text-slate-800">{result.totalDays.toLocaleString()} 天</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] text-slate-400 font-bold mb-0.5">累计度过月数</div>
                <div className="text-xl font-black text-indigo-600">约 {result.totalMonths} 个月</div>
              </div>
            </div>
          </div>
        )}

        {/* 底部重置与说明 */}
        <div className="flex justify-between items-center px-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>依据标准现代公历与中国传统干支生肖纪年测算</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>
      </main>
    </div>
  );
}
