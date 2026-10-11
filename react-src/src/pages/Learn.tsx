import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  BadgePercent,
  Tag,
  Ruler,
  Calendar,
  Home,
  Receipt,
  Briefcase,
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  Car,
  Flame,
  Split,
  Clock,
  CircleDollarSign,
  Zap,
  Sparkles,
  Utensils,
  Gamepad2,
  Grid3X3,
  Dices,
  LayoutGrid,
  Swords,
  Binary,
  Divide,
  Shapes,
  BarChart3,
  Compass,
  Layers,
  Boxes,
  Coins,
  HeartHandshake,
  Hourglass,
  Fuel,
  HeartPulse,
  Scale,
  Percent,
  FileText,
  HelpCircle,
  Pencil,
  BookOpen,
} from 'lucide-react';
import MainTabBar from '@/components/MainTabBar';
import '@/styles/learn-page.css';

export type CategoryKey = 'all' | 'kids' | 'study' | 'finance' | 'office' | 'life' | 'relax';

interface ModuleItem {
  title: string;
  route: string;
  state?: any;
  iconBg: string;
  icon: React.ReactNode;
  roles: CategoryKey[];
}

export default function Learn() {
  const navigate = useNavigate();

  // 分类与即时搜索
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const MODULES: ModuleItem[] = [
    {
      title: '每日口算',
      route: '/practice',
      state: { mode: 'daily' },
      roles: ['kids'],
      iconBg: 'linear-gradient(135deg, #FF6B8B 0%, #FF477E 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" fill="rgba(255,255,255,0.25)" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M13 20l5 5 10-10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: '算术练习',
      route: '/practice',
      roles: ['kids'],
      iconBg: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect x="17" y="6" width="8" height="20" rx="4" fill="#FFFFFF" />
          <rect x="17" y="22" width="8" height="6" rx="1" fill="#FDE68A" />
          <polygon points="17,28 25,28 21,34" fill="#FCA5A5" />
          <circle cx="19" cy="14" r="1.5" fill="#3B82F6" />
          <circle cx="23" cy="14" r="1.5" fill="#3B82F6" />
          <path d="M19 17 Q21 19 23 17" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      title: '闯关练习',
      route: '/game',
      roles: ['kids', 'relax'],
      iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="18" rx="8" ry="12" fill="#FFFFFF" />
          <circle cx="20" cy="18" r="4" fill="#A78BFA" />
          <circle cx="20" cy="18" r="2.5" fill="#FFFFFF" />
          <path d="M12 24 L8 30 L14 27Z" fill="#FDE68A" />
          <path d="M28 24 L32 30 L26 27Z" fill="#FDE68A" />
          <ellipse cx="20" cy="32" rx="3" ry="4" fill="#FDE68A" />
        </svg>
      ),
    },
    {
      title: '学数学',
      route: '/visual-math',
      roles: ['kids', 'study'],
      iconBg: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="24" rx="11" ry="10" fill="#FFFFFF" />
          <circle cx="16" cy="20" r="4" fill="#F59E0B" />
          <circle cx="24" cy="20" r="4" fill="#F59E0B" />
          <circle cx="16" cy="20" r="2" fill="#FFFFFF" />
          <circle cx="24" cy="20" r="2" fill="#FFFFFF" />
          <polygon points="18,24 22,24 20,27" fill="#EA580C" />
          <polygon points="11,13 9,8 14,11" fill="#F59E0B" />
          <polygon points="29,13 31,8 26,11" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      title: '比大小',
      route: '/practice',
      state: { mode: 'comparison' },
      roles: ['kids'],
      iconBg: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <path d="M12 34 L28 34" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M20 10 L20 34" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 14 L32 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 14 L4 23 Q8 27 12 23 L8 14" fill="rgba(255,255,255,0.3)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 14 L28 23 Q32 27 36 23 L32 14" fill="rgba(255,255,255,0.3)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: '认识时钟',
      route: '/time-master',
      roles: ['kids', 'life'],
      iconBg: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="2.5" fill="#F97316" />
          <line x1="20" y1="20" x2="20" y2="12" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="20" x2="26" y2="20" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="8" x2="20" y2="10" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="30" x2="20" y2="32" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="20" x2="10" y2="20" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
          <line x1="30" y1="20" x2="32" y2="20" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: '小小收银员',
      route: '/money-cashier',
      roles: ['kids', 'finance', 'life'],
      iconBg: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect x="7" y="16" width="26" height="17" rx="4" fill="#FFFFFF" />
          <rect x="10" y="19" width="14" height="7" rx="2" fill="#DCFCE7" />
          <circle cx="14" cy="22.5" r="1" fill="#15803D" />
          <circle cx="18" cy="22.5" r="1" fill="#15803D" />
          <circle cx="26" cy="20" r="1.5" fill="#22C55E" />
          <circle cx="26" cy="24" r="1.5" fill="#22C55E" />
          <circle cx="26" cy="28" r="1.5" fill="#22C55E" />
          <circle cx="9" cy="11" r="3" fill="#FDE68A" />
          <circle cx="16" cy="9" r="2.5" fill="#FDE68A" />
        </svg>
      ),
    },
    {
      title: '大写金额',
      route: '/amount-words',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      icon: <Coins className="w-6 h-6 text-white" />,
    },
    {
      title: '分数计算器',
      route: '/fraction',
      roles: ['kids', 'study'],
      iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      icon: <Divide className="w-6 h-6 text-white" />,
    },
    {
      title: '百分比计算',
      route: '/percentage',
      roles: ['study', 'finance', 'office'],
      iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      icon: <Percent className="w-6 h-6 text-white" />,
    },
    {
      title: '折扣计算器',
      route: '/discount',
      roles: ['finance', 'life'],
      iconBg: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      icon: <Tag className="w-6 h-6 text-white" />,
    },
    {
      title: '单位换算',
      route: '/unit-converter',
      roles: ['study', 'office', 'life'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: <Ruler className="w-6 h-6 text-white" />,
    },
    {
      title: '日期计算器',
      route: '/date-calc',
      roles: ['office', 'life'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: <Calendar className="w-6 h-6 text-white" />,
    },
    {
      title: '房贷计算器',
      route: '/mortgage',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      icon: <Home className="w-6 h-6 text-white" />,
    },
    {
      title: '个税计算器',
      route: '/tax',
      roles: ['finance', 'office'],
      iconBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      icon: <Receipt className="w-6 h-6 text-white" />,
    },
    {
      title: '加班计算器',
      route: '/overtime',
      roles: ['office'],
      iconBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      icon: <Briefcase className="w-6 h-6 text-white" />,
    },
    {
      title: '亲戚计算器',
      route: '/kinship',
      roles: ['life', 'relax'],
      iconBg: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      title: 'BMI健康计算',
      route: '/bmi',
      roles: ['life'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      icon: <Activity className="w-6 h-6 text-white" />,
    },
    {
      title: '养老金测算',
      route: '/pension',
      roles: ['finance', 'office'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
    {
      title: '复利定投计算',
      route: '/compound',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
    {
      title: '车贷落地价',
      route: '/car-loan',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      icon: <Car className="w-6 h-6 text-white" />,
    },
    {
      title: '热量卡路里',
      route: '/calorie',
      roles: ['life'],
      iconBg: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
      icon: <Flame className="w-6 h-6 text-white" />,
    },
    {
      title: 'AA分账计算',
      route: '/bill-split',
      roles: ['finance', 'life'],
      iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      icon: <Split className="w-6 h-6 text-white" />,
    },
    {
      title: '倒数纪念日',
      route: '/countdown',
      roles: ['office', 'life'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: <Clock className="w-6 h-6 text-white" />,
    },
    {
      title: '汇率换算',
      route: '/currency',
      roles: ['finance', 'office'],
      iconBg: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      icon: <CircleDollarSign className="w-6 h-6 text-white" />,
    },
    {
      title: '阶梯水电费',
      route: '/utility',
      roles: ['office', 'life'],
      iconBg: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',
      icon: <Zap className="w-6 h-6 text-white" />,
    },
    {
      title: '年龄生肖星座',
      route: '/age-zodiac',
      roles: ['life', 'relax'],
      iconBg: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      icon: <Sparkles className="w-6 h-6 text-white" />,
    },
    {
      title: '厨房烘焙换算',
      route: '/kitchen',
      roles: ['life'],
      iconBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      icon: <Utensils className="w-6 h-6 text-white" />,
    },
    {
      title: '2048数字拼图',
      route: '/game-2048',
      roles: ['kids', 'relax'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
      icon: <Gamepad2 className="w-6 h-6 text-white" />,
    },
    {
      title: '趣味数独挑战',
      route: '/sudoku',
      roles: ['kids', 'study', 'relax'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      icon: <Grid3X3 className="w-6 h-6 text-white" />,
    },
    {
      title: '24点纸牌神算',
      route: '/game-24',
      roles: ['kids', 'study', 'relax'],
      iconBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      icon: <Dices className="w-6 h-6 text-white" />,
    },
    {
      title: '数字华容道',
      route: '/klotski',
      roles: ['kids', 'relax'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: <LayoutGrid className="w-6 h-6 text-white" />,
    },
    {
      title: '口算限时擂台',
      route: '/mental-math',
      roles: ['kids', 'study', 'relax'],
      iconBg: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
      icon: <Swords className="w-6 h-6 text-white" />,
    },
    {
      title: '公约数公倍数',
      route: '/gcd-lcm',
      roles: ['kids', 'study'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      icon: <BadgePercent className="w-6 h-6 text-white" />,
    },
    {
      title: '一元方程求解',
      route: '/equation',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      icon: <Scale className="w-6 h-6 text-white" />,
    },
    {
      title: '进制转换位运算',
      route: '/base-convert',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      icon: <Binary className="w-6 h-6 text-white" />,
    },
    {
      title: '几何图形计算',
      route: '/geometry',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      icon: <Shapes className="w-6 h-6 text-white" />,
    },
    {
      title: '统计分析计算',
      route: '/statistics',
      roles: ['study', 'office'],
      iconBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      icon: <BarChart3 className="w-6 h-6 text-white" />,
    },
    {
      title: '随机抽签决策',
      route: '/random-picker',
      roles: ['relax', 'life'],
      iconBg: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
      icon: <Dices className="w-6 h-6 text-white" />,
    },
    {
      title: '勾股定理与三角',
      route: '/pythagorean',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: <Compass className="w-6 h-6 text-white" />,
    },
    {
      title: '排列组合概率',
      route: '/permutation',
      roles: ['study', 'relax'],
      iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      icon: <Layers className="w-6 h-6 text-white" />,
    },
    {
      title: '等差等比数列',
      route: '/sequence',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
    {
      title: '大写金额转换',
      route: '/chinese-money',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
      icon: <FileText className="w-6 h-6 text-white" />,
    },
    {
      title: '三角函数计算',
      route: '/trig',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      icon: <Compass className="w-6 h-6 text-white" />,
    },
    {
      title: '复数虚数运算',
      route: '/complex',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      icon: <Boxes className="w-6 h-6 text-white" />,
    },
    {
      title: '汉诺塔益智',
      route: '/hanoi',
      roles: ['kids', 'study', 'relax'],
      iconBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      icon: <Layers className="w-6 h-6 text-white" />,
    },
    {
      title: '九宫格幻方',
      route: '/magic-square',
      roles: ['kids', 'study', 'relax'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      icon: <Grid3X3 className="w-6 h-6 text-white" />,
    },
    {
      title: '抢30报数博弈',
      route: '/nim-thirty',
      roles: ['kids', 'relax'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: <Gamepad2 className="w-6 h-6 text-white" />,
    },
    {
      title: '黄金分割比例',
      route: '/golden-ratio',
      roles: ['study', 'life', 'relax'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: <Sparkles className="w-6 h-6 text-white" />,
    },
    {
      title: '经典物理公式',
      route: '/physics',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      icon: <Zap className="w-6 h-6 text-white" />,
    },
    {
      title: '饮水与燃脂心率',
      route: '/water-heart',
      roles: ['life', 'relax'],
      iconBg: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      icon: <HeartPulse className="w-6 h-6 text-white" />,
    },
    {
      title: '银行存款定期利息',
      route: '/bank-deposit',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      icon: <Coins className="w-6 h-6 text-white" />,
    },
    {
      title: '离职经济补偿金',
      route: '/severance',
      roles: ['office'],
      iconBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      icon: <HeartHandshake className="w-6 h-6 text-white" />,
    },
    {
      title: '薪资与工时折算',
      route: '/salary-hourly',
      roles: ['office', 'finance'],
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: <Clock className="w-6 h-6 text-white" />,
    },
    {
      title: '一元二次方程求解',
      route: '/quadratic',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      icon: <Scale className="w-6 h-6 text-white" />,
    },
    {
      title: '分期真实年化(IRR)',
      route: '/irr',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
    {
      title: '法定年休假测算',
      route: '/annual-leave',
      roles: ['office'],
      iconBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      icon: <Calendar className="w-6 h-6 text-white" />,
    },
    {
      title: '空间与平面向量',
      route: '/vector',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      icon: <Compass className="w-6 h-6 text-white" />,
    },
    {
      title: '小儿用药剂量折算',
      route: '/pediatric-dosage',
      roles: ['life'],
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: <Hourglass className="w-6 h-6 text-white" />,
    },
    {
      title: '房贷提前还款测算',
      route: '/early-repayment',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      icon: <Home className="w-6 h-6 text-white" />,
    },
    {
      title: '组合贷款计算器',
      route: '/combined-mortgage',
      roles: ['finance'],
      iconBg: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
      icon: <Home className="w-6 h-6 text-white" />,
    },
    {
      title: '二元一次方程组求解',
      route: '/linear-system-2',
      roles: ['study'],
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      icon: <Scale className="w-6 h-6 text-white" />,
    },
    {
      title: '油耗与出行成本计算',
      route: '/fuel-trip',
      roles: ['office', 'life'],
      iconBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      icon: <Fuel className="w-6 h-6 text-white" />,
    },
  ];

  // 分类与即时搜索过滤
  const filteredModules = useMemo(() => {
    let list = MODULES;
    if (activeCategory !== 'all') {
      list = list.filter((m) => m.roles.includes(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, searchQuery, MODULES]);

  const CATEGORIES: { id: CategoryKey; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'kids', label: '启蒙口算' },
    { id: 'study', label: '学科数学' },
    { id: 'finance', label: '商务财务' },
    { id: 'office', label: '职场办公' },
    { id: 'life', label: '日常健康' },
    { id: 'relax', label: '趣味益智' },
  ];

  return (
    <div className="learn-page bg-gradient-to-b from-[#F3E8FF] via-[#E8F4FF] to-[#D1FAE5] h-screen w-full flex flex-col text-slate-700 overflow-hidden relative selection:bg-purple-200">
      <main className="flex-1 overflow-y-auto px-3.5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-32 w-full max-w-md mx-auto">
        {/* 顶部标题栏（无说明副标题） */}
        <header className="mb-3 px-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-[#4B454E]">
            功能
          </h1>
        </header>

        {/* 即时搜索框 */}
        <div className="mb-3 relative">
          <div className="flex items-center w-full bg-white/90 rounded-2xl px-3.5 py-2.5 shadow-xs border border-purple-100/80 focus-within:ring-2 focus-within:ring-purple-400/50 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索功能，如：房贷、方程、时钟、BMI..."
              className="w-full bg-transparent text-xs font-bold text-slate-700 placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 分类快捷切换胶囊滑动栏 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none -mx-1 px-1">
          {CATEGORIES.map((tab) => {
            const isActive = activeCategory === tab.id;
            const count =
              tab.id === 'all'
                ? MODULES.length
                : MODULES.filter((m) => m.roles.includes(tab.id)).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-300/50'
                    : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id !== 'all' && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 一行四个 (grid-cols-4) 功能网格：无白色底卡片，阴影直接作用于图标 */}
        {filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-bold text-slate-500">未找到相关功能</p>
            <p className="text-xs text-slate-400 mt-1">换个搜索词或清除筛选试试</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black active:scale-95 transition-transform"
            >
              查看全部功能
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {filteredModules.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  const nextState = {
                    ...(item.state || {}),
                    fromFeature: true,
                  };
                  navigate(item.route, { state: nextState });
                }}
                className="flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 select-none cursor-pointer group bg-transparent border-0 p-1"
              >
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)] group-hover:scale-105 active:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-all shrink-0"
                  style={{ background: item.iconBg }}
                >
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight text-center line-clamp-1 break-all w-full px-0.5">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      <MainTabBar />
    </div>
  );
}
