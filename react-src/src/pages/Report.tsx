import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/report-page.css';
import StudyDataStorage, {
  type Achievement,
  type DailyProgress,
  type StudyStats,
  type WrongQuestion,
} from '@/lib/studyDataStorage';
import AppPageHeader from '@/components/AppPageHeader';
import MainTabBar from '@/components/MainTabBar';
import { useIsCurrentTab } from '@/lib/tabConfig';

type ReportTab = 'progress' | 'mistakes' | 'achievements' | 'calendar';
type MistakeFilter = 'all' | 'addition' | 'subtraction' | 'multiplication' | 'division';
type AchievementFilter = 'all' | 'basic' | 'advanced' | 'special' | 'streak';

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, deltaDays: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

function formatStudyTime(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return { hours, minutes };
}

function formatDateSlash(dateKey?: string) {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map((x) => Number(x));
  if (!y || !m || !d) return dateKey;
  return `${y}/${m}/${d}`;
}

function weekdayLabel(dateKey: string) {
  // dateKey: YYYY-MM-DD
  const d = new Date(`${dateKey}T00:00:00`);
  const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;
  return map[d.getDay()] ?? '周一';
}

function fillLastDays(list: DailyProgress[], days: number) {
  const map = new Map<string, DailyProgress>();
  list.forEach((dp) => map.set(dp.date, dp));

  const end = new Date();
  const start = addDays(end, -(days - 1));

  const out: DailyProgress[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = toDateKey(addDays(start, i));
    out.push(
      map.get(date) ?? {
        date,
        questionsAnswered: 0,
        correctRate: 0,
        timeSpent: 0,
        sessions: 0,
        achievements: [],
      },
    );
  }
  return out;
}

function catmullRomCommands(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return '';
  let d = '';
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = i === 0 ? points[i] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const c1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };

    d += ` C${c1.x.toFixed(2)},${c1.y.toFixed(2)} ${c2.x.toFixed(
      2,
    )},${c2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

function monthLabel(d: Date) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}年${m}月`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function formatTotalHm(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${h}h${m}m`;
}

function intensityFromMinutes(minutes: number) {
  const m = Math.max(0, Math.floor(minutes || 0));
  if (m <= 0) return 'none' as const;
  if (m < 10) return 'low' as const;
  if (m < 30) return 'medium' as const;
  return 'high' as const;
}

const Report: React.FC = () => {
  const navigate = useNavigate();
  const isTab = useIsCurrentTab('/report');
  const [activeTab, setActiveTab] = useState<ReportTab>('progress');
  const [mistakeFilter, setMistakeFilter] = useState<MistakeFilter>('all');
  const [achievementFilter, setAchievementFilter] = useState<AchievementFilter>('all');
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [calendarHistory, setCalendarHistory] = useState<DailyProgress[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [correctRate, setCorrectRate] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const data = StudyDataStorage.getReportData();
    setStats(StudyDataStorage.getStudyStats());
    setCalendarHistory(StudyDataStorage.getDailyProgress(365));
    setTotalTime(data.totalTime ?? 0);
    setCorrectRate(data.correctRate ?? 0);
    setQuestionsAnswered(data.questionsAnswered ?? 0);
    setDailyProgress(data.dailyProgress ?? []);
    // 只展示未掌握错题（库内部已过滤），用于错题回顾页
    setWrongQuestions(StudyDataStorage.getWrongQuestions() ?? []);
    setAchievements(StudyDataStorage.getAchievements() ?? []);
  }, []);

  const last7Days = useMemo(() => fillLastDays(dailyProgress, 7), [dailyProgress]);
  const last5Days = useMemo(() => last7Days.slice(-5), [last7Days]);

  const avgCorrectRate = useMemo(() => {
    if (last7Days.length === 0) return 0;
    const sum = last7Days.reduce((acc, dp) => acc + (dp.correctRate || 0), 0);
    return sum / last7Days.length;
  }, [last7Days]);

  const motivation = useMemo(() => {
    if (avgCorrectRate >= 85) return { text: '真棒', cls: 'bg-green-100 text-green-700' };
    if (avgCorrectRate >= 60) return { text: '不错', cls: 'bg-amber-100 text-amber-800' };
    return { text: '需加油', cls: 'bg-[#FFE4E6] text-[#E11D48]' };
  }, [avgCorrectRate]);

  const studyStreakDays = useMemo(() => {
    // 用最近一年内的 dailyProgress 推算连续学习天数（缺一天即中断）
    const history = StudyDataStorage.getDailyProgress(365);
    const studied = new Set(history.map((dp) => dp.date));

    let streak = 0;
    for (let i = 0; i < 365; i += 1) {
      const dayKey = toDateKey(addDays(new Date(), -i));
      if (studied.has(dayKey)) streak += 1;
      else break;
    }
    return streak;
  }, []);

  const { hours, minutes } = useMemo(() => formatStudyTime(totalTime), [totalTime]);

  const chartPoints = useMemo(() => {
    const xs = [0, 53, 106, 160, 213, 266, 320];
    return last7Days.map((dp, i) => {
      const rate = Math.max(0, Math.min(100, dp.correctRate || 0));
      const y = 90 - (rate / 100) * 60; // 0%->90, 100%->30
      return { x: xs[i] ?? i * 53, y: Math.max(30, Math.min(90, y)) };
    });
  }, [last7Days]);

  const chartCurveCommands = useMemo(() => catmullRomCommands(chartPoints), [chartPoints]);
  const chartLinePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const p0 = chartPoints[0];
    return `M${p0.x},${p0.y}${chartCurveCommands}`;
  }, [chartPoints, chartCurveCommands]);
  const chartAreaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const p0 = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `M${p0.x},100 L${p0.x},${p0.y}${chartCurveCommands} L${last.x},100 Z`;
  }, [chartPoints, chartCurveCommands]);

  const questionBars = useMemo(() => {
    const values = last7Days.map((dp) => dp.questionsAnswered || 0);
    const max = Math.max(1, ...values);
    return values.map((v) => {
      const raw = (v / max) * 100;
      const pct = v === 0 ? 8 : Math.max(10, raw);
      return { value: v, pct };
    });
  }, [last7Days]);

  const timeBars = useMemo(() => {
    const values = last5Days.map((dp) => dp.timeSpent || 0);
    const max = Math.max(1, ...values);
    return values.map((v) => {
      const raw = (v / max) * 100;
      const pct = v === 0 ? 8 : Math.max(10, raw);
      return { value: v, pct };
    });
  }, [last5Days]);

  const wrongCounts = useMemo(() => {
    const counts: Record<MistakeFilter, number> = {
      all: 0,
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
    };
    wrongQuestions.forEach((wq) => {
      const t = (wq.type === 'mixed' ? 'addition' : wq.type) as MistakeFilter;
      counts.all += 1;
      if (t in counts) counts[t] += 1;
    });
    return counts;
  }, [wrongQuestions]);

  const filteredWrongQuestions = useMemo(() => {
    if (mistakeFilter === 'all') return wrongQuestions;
    return wrongQuestions.filter((wq) => (wq.type === 'mixed' ? 'addition' : wq.type) === mistakeFilter);
  }, [mistakeFilter, wrongQuestions]);

  const ProgressView = (
    <>
      {/* 标题说明 */}
      <div className="mb-6 mt-4 pl-1">
        <h2 className="text-2xl font-black text-[#4B454E] mb-1">学习进度统计</h2>
        <p className="text-[#8A8190] text-sm font-bold">看看你的学习成果吧！</p>
      </div>

      {/* 四个统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#EBFBF7] rounded-[24px] p-5 pop-shadow-sm relative min-h-[140px] flex flex-col justify-between">
          <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-[#009688]" />
          <div>
            <div className="text-2xl font-black text-[#4B454E] leading-tight mb-1 mt-6">
              {hours}小时
              <br />
              {minutes}分钟
            </div>
            <div className="text-xs font-bold text-[#6B7280]">学习时长</div>
          </div>
        </div>

        <div className="bg-[#F1F8E9] rounded-[24px] p-5 pop-shadow-sm relative min-h-[140px] flex flex-col justify-between">
          <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-[#4CAF50]" />
          <div>
            <div className="text-3xl font-black text-[#4B454E] leading-tight mb-1 mt-6">
              {Math.round(correctRate)}%
            </div>
            <div className="text-xs font-bold text-[#6B7280]">正确率</div>
          </div>
        </div>

        <div className="bg-[#F3E5F5] rounded-[24px] p-5 pop-shadow-sm relative min-h-[140px] flex flex-col justify-between">
          <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-[#9C27B0]" />
          <div>
            <div className="text-3xl font-black text-[#4B454E] leading-tight mb-1 mt-6">
              {questionsAnswered}题
            </div>
            <div className="text-xs font-bold text-[#6B7280]">答题总数</div>
          </div>
        </div>

        <div className="bg-[#FFF3E0] rounded-[24px] p-5 pop-shadow-sm relative min-h-[140px] flex flex-col justify-between">
          <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-[#FF9800]" />
          <div>
            <div className="text-3xl font-black text-[#4B454E] leading-tight mb-1 mt-6">
              {studyStreakDays}天
            </div>
            <div className="text-xs font-bold text-[#6B7280]">连续天数</div>
          </div>
        </div>
      </div>

      {/* 学习趋势图 */}
      <div className="bg-white rounded-[32px] p-6 pop-card mb-6 w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-black text-[#4B454E]">学习趋势</h3>
            <p className="text-[#8A8190] text-xs font-bold mt-1">
              最近7天平均正确率: {avgCorrectRate.toFixed(1)}%
            </p>
          </div>
          <div
            className={`${motivation.cls} px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center justify-center`}
          >
            {motivation.text}
          </div>
        </div>

        <div className="mt-4 relative h-32 w-full">
          <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9B8FA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#C9B8FA" stopOpacity="0" />
              </linearGradient>
            </defs>

            {chartAreaPath && <path d={chartAreaPath} fill="url(#chartGradient)" />}
            {chartLinePath && (
              <path
                d={chartLinePath}
                fill="none"
                stroke="#9F85F0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {chartPoints.map((p) => (
              <circle key={`${p.x}`} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#9F85F0" strokeWidth="2" />
            ))}
          </svg>

          <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-3">
            {last7Days.map((dp) => (
              <span key={dp.date} className="w-8 text-center">
                {weekdayLabel(dp.date)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 每日答题数量 */}
      <div className="bg-white rounded-[32px] p-6 pop-card mb-6 w-full">
        <h3 className="text-lg font-black text-[#4B454E] mb-6">每日答题数量</h3>

        <div className="flex items-end justify-between h-32 gap-2">
          {questionBars.map((b, idx) => (
            <div key={`${last7Days[idx]?.date ?? idx}`} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <div className="w-full bg-[#66DDB3] rounded-t-lg" style={{ height: `${b.pct}%` }} />
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-3">
          {last7Days.map((dp) => (
            <span key={dp.date} className="flex-1 text-center">
              {weekdayLabel(dp.date)}
            </span>
          ))}
        </div>
      </div>

      {/* 每日学习时长 */}
      <div className="bg-white rounded-[32px] p-6 pop-card mb-6 w-full">
        <h3 className="text-lg font-black text-[#4B454E] mb-6">每日学习时长</h3>

        <div className="flex items-end justify-between h-32 gap-3">
          {timeBars.map((b, idx) => (
            <div key={`${last5Days[idx]?.date ?? idx}`} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <div className="w-full bg-[#C9B8FA] rounded-t-md" style={{ height: `${b.pct}%` }} />
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-3">
          {last5Days.map((dp) => (
            <span key={dp.date} className="flex-1 text-center">
              {weekdayLabel(dp.date)}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const MistakesView = (
    <>
      <div className="mb-6 px-1">
        <h2 className="text-[28px] font-black text-[#4B454E] mb-1 leading-tight tracking-tight">错题回顾</h2>
        <p className="text-[14px] font-bold text-[#4B454E] opacity-50 tracking-wide">
          重新练习错题，加深理解！
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button
          type="button"
          onClick={() => setMistakeFilter('addition')}
          className="bg-white rounded-[24px] p-5 grid-card-shadow relative overflow-hidden flex flex-col justify-between h-[160px] group active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-3 h-3 rounded-full bg-[#66DDB3] absolute top-5 right-5 shadow-sm" />
          <div className="w-[52px] h-[52px] rounded-2xl bg-[#EBFBF7] flex items-center justify-center text-[#4B454E] text-2xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">
            +
          </div>
          <div>
            <div className="text-[32px] font-black text-[#4B454E] leading-none mb-1.5 tracking-tight">
              {wrongCounts.addition}
            </div>
            <div className="text-[13px] font-extrabold text-[#4B454E] opacity-40 tracking-tight">
              加法 {wrongCounts.addition}道错题
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMistakeFilter('subtraction')}
          className="bg-white rounded-[24px] p-5 grid-card-shadow relative overflow-hidden flex flex-col justify-between h-[160px] group active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-3 h-3 rounded-full bg-[#C9B8FA] absolute top-5 right-5 shadow-sm" />
          <div className="w-[52px] h-[52px] rounded-2xl bg-[#F3E0FA] flex items-center justify-center text-[#4B454E] text-2xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">
            −
          </div>
          <div>
            <div className="text-[32px] font-black text-[#4B454E] leading-none mb-1.5 tracking-tight">
              {wrongCounts.subtraction}
            </div>
            <div className="text-[13px] font-extrabold text-[#4B454E] opacity-40 tracking-tight">
              减法 {wrongCounts.subtraction}道错题
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMistakeFilter('multiplication')}
          className="bg-white rounded-[24px] p-5 grid-card-shadow relative overflow-hidden flex flex-col justify-between h-[160px] group active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-3 h-3 rounded-full bg-[#FDE047] absolute top-5 right-5 shadow-sm" />
          <div className="w-[52px] h-[52px] rounded-2xl bg-[#FFFDE7] flex items-center justify-center text-[#4B454E] text-2xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">
            ×
          </div>
          <div>
            <div className="text-[32px] font-black text-[#4B454E] leading-none mb-1.5 tracking-tight">
              {wrongCounts.multiplication}
            </div>
            <div className="text-[13px] font-extrabold text-[#4B454E] opacity-40 tracking-tight">
              乘法 {wrongCounts.multiplication}道错题
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMistakeFilter('division')}
          className="bg-white rounded-[24px] p-5 grid-card-shadow relative overflow-hidden flex flex-col justify-between h-[160px] group active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-3 h-3 rounded-full bg-[#FCA5A5] absolute top-5 right-5 shadow-sm" />
          <div className="w-[52px] h-[52px] rounded-2xl bg-[#FFF0F0] flex items-center justify-center text-[#4B454E] text-2xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">
            ÷
          </div>
          <div>
            <div className="text-[32px] font-black text-[#4B454E] leading-none mb-1.5 tracking-tight">
              {wrongCounts.division}
            </div>
            <div className="text-[13px] font-extrabold text-[#4B454E] opacity-40 tracking-tight">
              除法 {wrongCounts.division}道错题
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 -mx-5 px-5 pb-4">
        <button
          type="button"
          onClick={() => setMistakeFilter('all')}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-extrabold text-[15px] active:scale-95 transition-transform tracking-wide ${
            mistakeFilter === 'all'
              ? 'bg-[#66DDB3] pop-shadow-mint text-white'
              : 'bg-white pop-shadow-sm text-[#4B454E]'
          }`}
        >
          全部
        </button>
        <button
          type="button"
          onClick={() => setMistakeFilter('addition')}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-extrabold text-[15px] flex items-center gap-1.5 active:scale-95 transition-transform tracking-wide ${
            mistakeFilter === 'addition'
              ? 'bg-[#66DDB3] pop-shadow-mint text-white'
              : 'bg-white pop-shadow-sm text-[#4B454E]'
          }`}
        >
          <span className="text-lg leading-none mt-[-2px]">+</span> 加法
        </button>
        <button
          type="button"
          onClick={() => setMistakeFilter('subtraction')}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-extrabold text-[15px] flex items-center gap-1.5 active:scale-95 transition-transform tracking-wide ${
            mistakeFilter === 'subtraction'
              ? 'bg-[#66DDB3] pop-shadow-mint text-white'
              : 'bg-white pop-shadow-sm text-[#4B454E]'
          }`}
        >
          <span className="text-lg leading-none mt-[-2px]">−</span> 减法
        </button>
        <button
          type="button"
          onClick={() => setMistakeFilter('multiplication')}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-extrabold text-[15px] flex items-center gap-1.5 active:scale-95 transition-transform tracking-wide ${
            mistakeFilter === 'multiplication'
              ? 'bg-[#66DDB3] pop-shadow-mint text-white'
              : 'bg-white pop-shadow-sm text-[#4B454E]'
          }`}
        >
          <span className="text-lg leading-none mt-[-2px]">×</span> 乘法
        </button>
        <button
          type="button"
          onClick={() => setMistakeFilter('division')}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-extrabold text-[15px] flex items-center gap-1.5 active:scale-95 transition-transform tracking-wide ${
            mistakeFilter === 'division'
              ? 'bg-[#66DDB3] pop-shadow-mint text-white'
              : 'bg-white pop-shadow-sm text-[#4B454E]'
          }`}
        >
          <span className="text-lg leading-none mt-[-2px]">÷</span> 除法
        </button>
      </div>

      {filteredWrongQuestions.length === 0 ? (
        <div className="bg-white rounded-[32px] p-8 pop-shadow text-center flex flex-col items-center justify-center min-h-[300px] flex-grow mb-4">
          <div className="text-[64px] mb-5 transform hover:rotate-12 transition-transform cursor-default select-none">
            🎉
          </div>
          <h3 className="text-[22px] font-black text-[#4B454E] mb-2 tracking-tight">
            太棒了！没有错题记录
          </h3>
          <p className="text-[#4B454E] opacity-50 font-bold text-[14px] tracking-wide">
            继续保持，你做得很好！
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-5 pop-shadow mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-[#4B454E]">错题列表</h3>
            <span className="text-xs font-extrabold text-[#4B454E] opacity-50">
              共 {filteredWrongQuestions.length} 道
            </span>
          </div>
          <div className="space-y-3">
            {filteredWrongQuestions.slice(0, 20).map((wq) => (
              <div
                key={wq.id}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="font-black text-[#4B454E] truncate">
                    {wq.question}
                  </div>
                  <div className="text-xs font-bold text-[#4B454E] opacity-50 mt-1">
                    你的答案：{wq.userAnswer} 正确答案：{wq.correctAnswer}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    StudyDataStorage.markQuestionMastered(wq.id);
                    setWrongQuestions(StudyDataStorage.getWrongQuestions() ?? []);
                  }}
                  className="bg-[#C9B8FA] text-white px-4 py-2 rounded-full pop-shadow-lavender font-extrabold text-[13px] active:scale-95 transition-transform whitespace-nowrap"
                >
                  我会了
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const achievementStats = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievements.filter((a) => a.earned).length;
    const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    const byCategory: Record<Exclude<AchievementFilter, 'all'>, { unlocked: number; total: number }> = {
      basic: { unlocked: 0, total: 0 },
      advanced: { unlocked: 0, total: 0 },
      special: { unlocked: 0, total: 0 },
      streak: { unlocked: 0, total: 0 },
    };

    achievements.forEach((a) => {
      const cat = a.category as Exclude<AchievementFilter, 'all'>;
      if (!byCategory[cat]) return;
      byCategory[cat].total += 1;
      if (a.earned) byCategory[cat].unlocked += 1;
    });

    return { total, unlocked, pct, byCategory };
  }, [achievements]);

  const filteredAchievements = useMemo(() => {
    if (achievementFilter === 'all') return achievements;
    return achievements.filter((a) => a.category === achievementFilter);
  }, [achievementFilter, achievements]);

  const circle = useMemo(() => {
    const circumference = 251.2; // r=40
    const offset = circumference * (1 - achievementStats.pct / 100);
    return { circumference, offset };
  }, [achievementStats.pct]);

  const AchievementsView = (
    <main className="px-6 flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-[#4B454E] mb-1">成就展示</h2>
        <p className="text-[#8A8490] font-bold text-sm">展示你的学习成果和荣誉！</p>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-pop-lg flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#F3F0F5"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#C9B8FA"
              strokeWidth="8"
              strokeDasharray={circle.circumference}
              strokeDashoffset={circle.offset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[#4B454E]">{achievementStats.pct}%</span>
            <span className="text-sm font-bold text-[#9CA3AF]">
              {achievementStats.unlocked}/{achievementStats.total}
            </span>
          </div>
        </div>

        <div className="text-[#4B454E] font-black text-lg">
          {achievementStats.unlocked} / {achievementStats.total} 项已解锁
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            key: 'basic' as const,
            dot: 'bg-[#4ADE80]',
            pillBg: 'bg-[#DCFCE7]',
            pillText: 'text-[#15803D]',
            title: '基础成就',
          },
          {
            key: 'advanced' as const,
            dot: 'bg-[#FACC15]',
            pillBg: 'bg-[#FEF9C3]',
            pillText: 'text-[#A16207]',
            title: '进阶成就',
          },
          {
            key: 'special' as const,
            dot: 'bg-[#C9B8FA]',
            pillBg: 'bg-[#F3E8FF]',
            pillText: 'text-[#7E22CE]',
            title: '特殊成就',
          },
          {
            key: 'streak' as const,
            dot: 'bg-[#F472B6]',
            pillBg: 'bg-[#FCE7F3]',
            pillText: 'text-[#BE185D]',
            title: '连击成就',
          },
        ].map((c) => {
          const cat = achievementStats.byCategory[c.key];
          const percent = cat.total > 0 ? Math.round((cat.unlocked / cat.total) * 100) : 0;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setAchievementFilter(c.key);
              }}
              className="bg-white rounded-[24px] p-5 shadow-pop relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-300 text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <div className={`${c.pillBg} ${c.pillText} text-xs font-black px-2 py-0.5 rounded-full`}>
                  {cat.unlocked}/{cat.total}
                </div>
              </div>
              <h3 className="text-lg font-black text-[#4B454E] mb-1">{c.title}</h3>
              <p className="text-xs font-bold text-[#9CA3AF]">完成度 {percent}%</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
        <button
          type="button"
          onClick={() => setAchievementFilter('all')}
          className={`whitespace-nowrap px-5 py-2.5 rounded-full btn-press text-white font-extrabold text-sm transition-transform ${
            achievementFilter === 'all'
              ? 'bg-[#4ADE80] shadow-[0_4px_0_#22C55E]'
              : 'bg-white shadow-pop text-[#4B454E]'
          }`}
        >
          全部
        </button>
        <button
          type="button"
          onClick={() => setAchievementFilter('basic')}
          className="whitespace-nowrap bg-white px-5 py-2.5 rounded-full shadow-pop btn-press text-[#4B454E] font-extrabold text-sm transition-transform"
        >
          基础成就
        </button>
        <button
          type="button"
          onClick={() => setAchievementFilter('advanced')}
          className="whitespace-nowrap bg-white px-5 py-2.5 rounded-full shadow-pop btn-press text-[#4B454E] font-extrabold text-sm transition-transform"
        >
          进阶成就
        </button>
        <button
          type="button"
          onClick={() => setAchievementFilter('special')}
          className="whitespace-nowrap bg-white px-5 py-2.5 rounded-full shadow-pop btn-press text-[#4B454E] font-extrabold text-sm transition-transform"
        >
          特殊成就
        </button>
        <button
          type="button"
          onClick={() => setAchievementFilter('streak')}
          className="whitespace-nowrap bg-white px-5 py-2.5 rounded-full shadow-pop btn-press text-[#4B454E] font-extrabold text-sm transition-transform"
        >
          连击成就
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-12">
        {filteredAchievements.map((a) => {
          const rarityStyle = (() => {
            switch (a.rarity) {
              case 'legendary':
                return {
                  bg: 'bg-[#FEF3C7]',
                  accentBg: 'bg-[#FFFBEB]',
                  text: 'text-[#92400E]',
                  badgeBg: 'bg-[#FFFBEB]',
                  badgeText: 'text-[#92400E]',
                  label: '传说',
                };
              case 'epic':
                return {
                  bg: 'bg-[#E0E7FF]',
                  accentBg: 'bg-[#EEF2FF]',
                  text: 'text-[#3730A3]',
                  badgeBg: 'bg-[#EEF2FF]',
                  badgeText: 'text-[#3730A3]',
                  label: '史诗',
                };
              case 'rare':
                return {
                  bg: 'bg-[#F3E8FF]',
                  accentBg: 'bg-[#E9D5FF]',
                  text: 'text-[#7E22CE]',
                  badgeBg: 'bg-[#E9D5FF]',
                  badgeText: 'text-[#7E22CE]',
                  label: '稀有',
                };
              default:
                return {
                  bg: 'bg-[#F0FDF4]',
                  accentBg: 'bg-[#DCFCE7]',
                  text: 'text-[#15803D]',
                  badgeBg: 'bg-[#DCFCE7]',
                  badgeText: 'text-[#15803D]',
                  label: '普通',
                };
            }
          })();

          if (!a.earned) {
            return (
              <div
                key={a.id}
                className="bg-gray-100/60 rounded-[24px] p-5 border-2 border-dashed border-gray-200 flex flex-col h-full items-center justify-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-3">
                  🔒
                </div>
                <h3 className="text-gray-400 font-black text-lg mb-1">{a.name}</h3>
                <p className="text-gray-400/80 text-xs font-bold leading-tight">{a.description}</p>
              </div>
            );
          }

          return (
            <div key={a.id} className={`${rarityStyle.bg} rounded-[24px] p-5 shadow-pop flex flex-col h-full`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${rarityStyle.accentBg} flex items-center justify-center ${rarityStyle.text}`}>
                  <span className="text-xl leading-none">{a.icon}</span>
                </div>
                <span className={`px-2 py-1 rounded-lg ${rarityStyle.badgeBg} ${rarityStyle.badgeText} text-[10px] font-black uppercase`}>
                  {rarityStyle.label}
                </span>
              </div>
              <h3 className={`${rarityStyle.text} font-black text-lg mb-1`}>{a.name}</h3>
              <p className={`${rarityStyle.text}/70 text-xs font-bold leading-tight mb-3`}>{a.description}</p>
              <div className={`mt-auto pt-2 border-t ${rarityStyle.text}/10`}>
                <p className={`${rarityStyle.text}/60 text-[10px] font-bold`}>{formatDateSlash(a.earnedDate)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );

  const calendarSummary = useMemo(() => {
    const studyDays = stats?.studyDays ?? StudyDataStorage.getDailyProgress(365).filter((d) => d.questionsAnswered > 0 || d.timeSpent > 0).length;
    const totalQs = stats?.totalQuestions ?? questionsAnswered;
    const avgRate = stats ? Math.round(stats.correctRate) : Math.round(correctRate);
    const totalHm = formatTotalHm(stats?.totalTime ?? totalTime);
    return { studyDays, totalQs, avgRate, totalHm };
  }, [correctRate, questionsAnswered, stats, totalTime]);

  const calendarMap = useMemo(() => {
    const map = new Map<string, DailyProgress>();
    calendarHistory.forEach((dp) => map.set(dp.date, dp));
    return map;
  }, [calendarHistory]);

  const calendarCells = useMemo(() => {
    const first = startOfMonth(calendarMonth);
    const firstWeekday = first.getDay(); // 0=Sun
    const dim = daysInMonth(calendarMonth);
    const cells: Array<
      | { kind: 'empty'; key: string }
      | { kind: 'day'; key: string; day: number; dateKey: string; intensity: 'none' | 'low' | 'medium' | 'high' }
    > = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ kind: 'empty', key: `e-${i}` });
    }

    for (let day = 1; day <= dim; day += 1) {
      const dateKey = toDateKey(new Date(first.getFullYear(), first.getMonth(), day));
      const dp = calendarMap.get(dateKey);
      const intensity = intensityFromMinutes(dp?.timeSpent ?? 0);
      cells.push({ kind: 'day', key: dateKey, day, dateKey, intensity });
    }

    // pad to full weeks for stable layout
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const pad = 7 - remainder;
      for (let i = 0; i < pad; i += 1) {
        cells.push({ kind: 'empty', key: `t-${i}` });
      }
    }

    return cells;
  }, [calendarMap, calendarMonth]);

  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const CalendarView = (
    <main className="flex-1 flex flex-col gap-6">
      <div className="px-1">
        <h2 className="text-2xl font-black text-[#4B454E] mb-1">学习日历</h2>
        <p className="text-sm font-bold text-[#4B454E] opacity-50">记录你的每日学习足迹！</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[24px] shadow-pop p-5 relative flex flex-col justify-between h-[110px]">
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#26A69A]" />
          <div className="mt-auto">
            <span className="text-3xl font-black block leading-none mb-1">{calendarSummary.studyDays}天</span>
            <span className="text-xs font-bold text-gray-400">学习天数</span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-pop p-5 relative flex flex-col justify-between h-[110px]">
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#C9B8FA]" />
          <div className="mt-auto">
            <span className="text-3xl font-black block leading-none mb-1">{calendarSummary.totalQs}题</span>
            <span className="text-xs font-bold text-gray-400">答题总数</span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-pop p-5 relative flex flex-col justify-between h-[110px]">
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#66DDB3]" />
          <div className="mt-auto">
            <span className="text-3xl font-black block leading-none mb-1">{calendarSummary.avgRate}%</span>
            <span className="text-xs font-bold text-gray-400">平均正确率</span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-pop p-5 relative flex flex-col justify-between h-[110px]">
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#FFA726]" />
          <div className="mt-auto">
            <span className="text-3xl font-black block leading-none mb-1">{calendarSummary.totalHm}</span>
            <span className="text-xs font-bold text-gray-400">学习时长</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-pop p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setCalendarMonth((m) => addMonths(m, -1))}
            className="w-10 h-8 rounded-full bg-white shadow-pop-sm flex items-center justify-center hover:bg-gray-50 active:translate-y-[2px] active:shadow-none transition-all border border-transparent"
            aria-label="上一月"
          >
            <span className="text-[#4B454E] font-black">‹</span>
          </button>
          <span className="text-lg font-black text-[#4B454E]">{monthLabel(calendarMonth)}</span>
          <button
            type="button"
            onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
            className="w-10 h-8 rounded-full bg-white shadow-pop-sm flex items-center justify-center hover:bg-gray-50 active:translate-y-[2px] active:shadow-none transition-all border border-transparent"
            aria-label="下一月"
          >
            <span className="text-[#4B454E] font-black">›</span>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-3 text-center">
          <div className="text-xs font-black text-red-400">日</div>
          <div className="text-xs font-black text-gray-400">一</div>
          <div className="text-xs font-black text-gray-400">二</div>
          <div className="text-xs font-black text-gray-400">三</div>
          <div className="text-xs font-black text-gray-400">四</div>
          <div className="text-xs font-black text-gray-400">五</div>
          <div className="text-xs font-black text-orange-400">六</div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {calendarCells.map((c) => {
            if (c.kind === 'empty') {
              return <div key={c.key} className="aspect-square rounded-xl bg-transparent" />;
            }

            const style =
              c.intensity === 'high'
                ? { bg: 'bg-[#4BC29A]', text: 'text-white' }
                : c.intensity === 'medium'
                  ? { bg: 'bg-[#66DDB3]', text: 'text-white' }
                  : c.intensity === 'low'
                    ? { bg: 'bg-[#A8E8D0]', text: 'text-white' }
                    : { bg: 'bg-gray-50', text: 'text-gray-400' };

            const isToday = c.dateKey === todayKey;
            const ring = isToday ? 'ring-[3px] ring-[#C9B8FA] ring-offset-2' : '';

            return (
              <div
                key={c.key}
                className={`aspect-square rounded-xl ${style.bg} flex items-center justify-center ${ring}`}
              >
                <span className={`text-sm font-bold ${style.text}`}>{c.day}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-400">
          <span>学习强度：</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" />
            <span>无</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#A8E8D0]" />
            <span>低</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#66DDB3]" />
            <span>中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#4BC29A]" />
            <span>高</span>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="report-page w-full min-h-screen relative overflow-x-hidden pb-10 selection:bg-[#C9B8FA] selection:text-white">
      {/* 背景 */}
      {activeTab === 'achievements' ? (
        <>
          <div className="fixed top-[-10%] left-[-20%] w-[80%] h-[40%] rounded-full bg-teal-200/30 blur-[80px] pointer-events-none z-0" />
          <div className="fixed bottom-[10%] right-[-10%] w-[70%] h-[50%] rounded-full bg-purple-200/30 blur-[80px] pointer-events-none z-0" />
        </>
      ) : activeTab === 'calendar' ? (
        <>
          <div
            className="fixed top-[-10%] left-[-20%] w-[300px] h-[300px] blur-[80px] rounded-full pointer-events-none z-0"
            style={{ background: 'rgba(201, 184, 250, 0.4)' }}
          />
          <div
            className="fixed bottom-[10%] right-[-10%] w-[350px] h-[350px] blur-[80px] rounded-full pointer-events-none z-0"
            style={{ background: 'rgba(235, 251, 247, 0.6)' }}
          />
        </>
      ) : (
        <div className="orb-wrapper">
          <div className="orb-1" />
          <div className="orb-2" />
        </div>
      )}

      <div className={`max-w-md mx-auto min-h-screen px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-12'} flex flex-col relative z-10`}>
        <AppPageHeader
          title="学习报告"
          onBack={isTab ? undefined : () => navigate(-1)}
          showBack={!isTab}
          className="relative z-10"
        />

        {/* 顶部 Tab */}
        <nav className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-2 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`flex-shrink-0 px-5 py-3 rounded-full font-extrabold active:scale-95 transition-transform text-[15px] ${
              activeTab === 'progress'
                ? 'bg-[#C9B8FA] text-white pop-shadow-lavender'
                : 'bg-white text-[#4B454E] pop-shadow-sm'
            }`}
          >
            进度统计
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mistakes')}
            className={`flex-shrink-0 px-5 py-3 rounded-full font-extrabold active:scale-95 transition-transform text-[15px] ${
              activeTab === 'mistakes'
                ? 'bg-[#C9B8FA] text-white pop-shadow-lavender'
                : 'bg-white text-[#4B454E] pop-shadow-sm'
            }`}
          >
            错题回顾
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`flex-shrink-0 px-5 py-3 rounded-full font-extrabold active:scale-95 transition-transform text-[15px] ${
              activeTab === 'achievements'
                ? 'bg-[#C9B8FA] text-white pop-shadow-lavender'
                : 'bg-white text-[#4B454E] pop-shadow-sm'
            }`}
          >
            成就展示
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex-shrink-0 px-5 py-3 rounded-full font-extrabold active:scale-95 transition-transform text-[15px] whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-[#C9B8FA] text-[#4B454E] shadow-pop-active'
                : 'bg-white text-[#4B454E] shadow-pop-sm'
            }`}
          >
            学习日历
          </button>
        </nav>

        {activeTab === 'progress' && ProgressView}
        {activeTab === 'mistakes' && MistakesView}
        {activeTab === 'achievements' && AchievementsView}

        {activeTab === 'calendar' && CalendarView}
      </div>

      {isTab && <MainTabBar />}
    </div>
  );
};

export default Report;
