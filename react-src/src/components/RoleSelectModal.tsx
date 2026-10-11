import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export type UserRole = 'all' | 'kids' | 'study' | 'finance' | 'office' | 'life' | 'relax' | 'custom';

export interface RoleInfo {
  id: UserRole;
  title: string;
  tagline: string;
  badge: string;
  icon: string;
  defaultLandingPath: string; // 默认落地页
  features: string[];
}

export const ROLE_CONFIGS: RoleInfo[] = [
  {
    id: 'kids',
    title: '儿童伴学',
    tagline: '幼小衔接与口算打卡',
    badge: '启蒙',
    icon: '启蒙',
    defaultLandingPath: '/learn',
    features: ['每日口算', '认识时钟', '比大小', '小小收银员', '竖式计算', '口算擂台'],
  },
  {
    id: 'study',
    title: '学科数学',
    tagline: '初高中数理与公式求解',
    badge: '数理',
    icon: '数学',
    defaultLandingPath: '/scientific',
    features: ['分数计算器', '一元二次方程', '二元方程组', '三角函数', '向量运算', '几何图形'],
  },
  {
    id: 'finance',
    title: '商务财务',
    tagline: '房贷提前还款与投资利息',
    badge: '理财',
    icon: '财务',
    defaultLandingPath: '/calculator',
    features: ['房贷提前还款', '组合贷款', 'IRR真实利率', '大写金额', '银行存款', '复利定投'],
  },
  {
    id: 'office',
    title: '职场办公',
    tagline: '工时年假与出行油耗',
    badge: '效率',
    icon: '职场',
    defaultLandingPath: '/calculator',
    features: ['离职补偿N+1', '工时时薪', '带薪年假', '油耗成本', '加班费', '汇率换算'],
  },
  {
    id: 'life',
    title: '日常健康',
    tagline: '亲戚称呼与健康指数',
    badge: '生活',
    icon: '生活',
    defaultLandingPath: '/calculator',
    features: ['亲戚计算器', 'BMI健康', '小儿用药剂量', '饮水心率', '生肖星座', '厨房烘焙'],
  },
  {
    id: 'relax',
    title: '趣味益智',
    tagline: '经典数独与数字思维',
    badge: '益智',
    icon: '益智',
    defaultLandingPath: '/learn',
    features: ['2048拼图', '经典数独', '24点神算', '华容道', '汉诺塔', '随机抽签'],
  },
];

// 63 个模块轻量简明列表（用于自选勾选面板）
export const ALL_TOOL_ITEMS = [
  { id: 'daily', name: '每日口算', cat: 'kids' },
  { id: 'arithmetic', name: '算术练习', cat: 'kids' },
  { id: 'game', name: '闯关练习', cat: 'kids' },
  { id: 'visual-math', name: '学数学', cat: 'kids' },
  { id: 'comparison', name: '比大小', cat: 'kids' },
  { id: 'time-master', name: '认识时钟', cat: 'kids' },
  { id: 'money-cashier', name: '小小收银员', cat: 'kids' },
  { id: 'fraction', name: '分数计算器', cat: 'study' },
  { id: 'equation', name: '一元方程求解', cat: 'study' },
  { id: 'quadratic', name: '一元二次方程求解', cat: 'study' },
  { id: 'linear-system-2', name: '二元一次方程组', cat: 'study' },
  { id: 'vector', name: '空间向量运算', cat: 'study' },
  { id: 'trig', name: '三角函数计算', cat: 'study' },
  { id: 'complex', name: '复数虚数运算', cat: 'study' },
  { id: 'geometry', name: '几何图形计算', cat: 'study' },
  { id: 'gcd-lcm', name: '公约数公倍数', cat: 'study' },
  { id: 'sequence', name: '等差等比数列', cat: 'study' },
  { id: 'pythagorean', name: '勾股定理与三角', cat: 'study' },
  { id: 'base-convert', name: '进制转换位运算', cat: 'study' },
  { id: 'permutation', name: '排列组合概率', cat: 'study' },
  { id: 'physics', name: '经典物理公式', cat: 'study' },
  { id: 'golden-ratio', name: '黄金分割比例', cat: 'study' },
  { id: 'chinese-money', name: '大写金额转换', cat: 'finance' },
  { id: 'amount-words', name: '大写金额', cat: 'finance' },
  { id: 'mortgage', name: '房贷计算器', cat: 'finance' },
  { id: 'early-repayment', name: '房贷提前还款测算', cat: 'finance' },
  { id: 'combined-mortgage', name: '公积金商贷组合贷', cat: 'finance' },
  { id: 'car-loan', name: '车贷落地价', cat: 'finance' },
  { id: 'bank-deposit', name: '银行存款定期利息', cat: 'finance' },
  { id: 'irr', name: '分期真实利率IRR', cat: 'finance' },
  { id: 'tax', name: '个税计算器', cat: 'finance' },
  { id: 'pension', name: '养老金测算', cat: 'finance' },
  { id: 'compound', name: '复利定投计算', cat: 'finance' },
  { id: 'bill-split', name: 'AA分账计算', cat: 'finance' },
  { id: 'percentage', name: '百分比计算', cat: 'finance' },
  { id: 'discount', name: '折扣计算器', cat: 'finance' },
  { id: 'severance', name: '离职经济补偿金', cat: 'office' },
  { id: 'salary-hourly', name: '薪资与工时折算', cat: 'office' },
  { id: 'annual-leave', name: '带薪年假折算', cat: 'office' },
  { id: 'overtime', name: '加班计算器', cat: 'office' },
  { id: 'fuel-trip', name: '油耗与出行成本', cat: 'office' },
  { id: 'currency', name: '汇率换算', cat: 'office' },
  { id: 'utility', name: '阶梯水电费', cat: 'office' },
  { id: 'unit-converter', name: '单位换算', cat: 'office' },
  { id: 'countdown', name: '倒数纪念日', cat: 'office' },
  { id: 'statistics', name: '统计分析计算', cat: 'office' },
  { id: 'kinship', name: '亲戚计算器', cat: 'life' },
  { id: 'kitchen', name: '厨房烘焙换算', cat: 'life' },
  { id: 'bmi', name: 'BMI健康计算', cat: 'life' },
  { id: 'pediatric-dosage', name: '小儿用药剂量', cat: 'life' },
  { id: 'calorie', name: '热量卡路里', cat: 'life' },
  { id: 'water-heart', name: '饮水与燃脂心率', cat: 'life' },
  { id: 'date-calc', name: '日期计算器', cat: 'life' },
  { id: 'age-zodiac', name: '年龄生肖星座', cat: 'life' },
  { id: 'random-picker', name: '随机抽签决策', cat: 'life' },
  { id: 'game-2048', name: '2048数字拼图', cat: 'relax' },
  { id: 'sudoku', name: '趣味数独挑战', cat: 'relax' },
  { id: 'game-24', name: '24点纸牌神算', cat: 'relax' },
  { id: 'klotski', name: '数字华容道', cat: 'relax' },
  { id: 'mental-math', name: '口算限时擂台', cat: 'relax' },
  { id: 'hanoi', name: '汉诺塔益智', cat: 'relax' },
  { id: 'magic-square', name: '九宫格幻方', cat: 'relax' },
  { id: 'nim-thirty', name: '抢30报数博弈', cat: 'relax' },
];

interface RoleSelectModalProps {
  isOpen: boolean;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onClose: () => void;
}

export default function RoleSelectModal({
  isOpen,
  currentRole,
  onSelectRole,
  onClose,
}: RoleSelectModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole === 'all' ? 'kids' : currentRole);
  const [tabMode, setTabMode] = useState<'preset' | 'custom'>('preset');

  // 自选功能列表存储
  const [selectedToolTitles, setSelectedToolTitles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('user_custom_selected_tools');
      return saved ? JSON.parse(saved) : [
        '每日口算', '算术练习', '分数计算器', '大写金额转换', '房贷计算器', '加班计算器', '亲戚计算器', '2048数字拼图'
      ];
    } catch {
      return ['每日口算', '算术练习', '分数计算器', '大写金额转换'];
    }
  });

  if (!isOpen) return null;

  const toggleTool = (toolName: string) => {
    setSelectedToolTitles(prev => {
      const next = prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName];
      localStorage.setItem('user_custom_selected_tools', JSON.stringify(next));
      return next;
    });
  };

  const handleConfirm = () => {
    if (tabMode === 'custom') {
      onSelectRole('custom');
    } else {
      onSelectRole(selectedRole);
    }
    onClose();
  };

  const handleSkip = () => {
    onSelectRole('all');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col justify-between pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+20px)] px-5 animate-in fade-in duration-200">
      {/* 顶部标题与跳过栏 */}
      <div className="shrink-0">
        <div className="flex justify-end items-center mb-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-1 px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            跳过并查看全部
          </button>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            选择使用偏好
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            根据场景为您定制首页入口，后续可在「我的」随时更改
          </p>
        </div>

        {/* 模式切换：经典场景 vs 自选功能 */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setTabMode('preset')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tabMode === 'preset'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            推荐场景
          </button>
          <button
            type="button"
            onClick={() => setTabMode('custom')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tabMode === 'custom'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            自定义常用 ({selectedToolTitles.length})
          </button>
        </div>
      </div>

      {/* 中部选择区（带滚动） */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 mb-4">
        {tabMode === 'preset' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {ROLE_CONFIGS.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-900/20 shadow-xs ring-2 ring-blue-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      {r.badge}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                      {r.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                      {r.tagline}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* 完整工具模式卡片 */}
            <button
              type="button"
              onClick={() => setSelectedRole('all')}
              className={`p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between cursor-pointer col-span-2 ${
                selectedRole === 'all'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-900/20 shadow-xs ring-2 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  全能模式
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    selectedRole === 'all'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {selectedRole === 'all' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  标准计算器 + 63款全部工具
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  不作特定过滤，随心使用全套功能
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-medium px-1">
              勾选您常用的功能，将在首页快捷展示：
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TOOL_ITEMS.map((item) => {
                const checked = selectedToolTitles.includes(item.name);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTool(item.name)}
                    className={`py-2.5 px-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                      checked
                        ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部确认大按钮 */}
      <div className="shrink-0 pt-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <span>进入应用</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
