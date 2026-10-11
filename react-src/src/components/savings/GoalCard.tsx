import React from 'react';
import clsx from 'clsx';
import { Target, GraduationCap, Gift, Compass, ShieldCheck } from 'lucide-react';
import { SavingsGoal } from '@/stores/savingsStore';
import { formatCurrency, formatDate } from '@/utils/format';

function renderGoalIcon(iconKey?: string) {
  switch (iconKey) {
    case 'education':
      return <GraduationCap className="w-5 h-5 text-orange-500" />;
    case 'dream':
    case 'toy':
      return <Gift className="w-5 h-5 text-purple-500" />;
    case 'travel':
      return <Compass className="w-5 h-5 text-sky-500" />;
    case 'emergency':
      return <ShieldCheck className="w-5 h-5 text-amber-500" />;
    default:
      return <Target className="w-5 h-5 text-indigo-500" />;
  }
}

interface GoalCardProps {
  goal: SavingsGoal;
  savedAmount: number;
  categoryLabel: string;
  accountLabel: string;
  onViewDetail: () => void;
  onQuickContribution: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GoalCard({
  goal,
  savedAmount,
  categoryLabel,
  accountLabel,
  onViewDetail,
  onQuickContribution,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const percentage = goal.targetAmount > 0
    ? Math.min(100, Math.round((savedAmount / goal.targetAmount) * 100))
    : 0;

  const remaining = Math.max(goal.targetAmount - savedAmount, 0);

  return (
    <div
      className="rounded-[32px] bg-white border border-white/80 p-6 flex flex-col gap-4 pop-shadow transition-all hover:-translate-y-0.5"
      style={{
        borderTop: `6px solid ${goal.color}`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#EEF2F7] text-sm font-black text-[#4B454E]">
            {renderGoalIcon(goal.icon)}
            <span>{goal.name}</span>
          </div>
          {goal.description && (
            <p className="mt-2 text-sm text-[#8A8490] font-bold">{goal.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#9CA3AF]">目标金额</p>
          <p className="text-lg font-black text-[#4B454E]">{formatCurrency(goal.targetAmount)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-black text-[#4B454E]">
          <span>当前进度</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-3 rounded-full bg-[#EEF2F7] overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all',
              percentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300'
            )}
            style={{ width: `${percentage}%`, backgroundColor: percentage >= 100 ? undefined : goal.color }}
          />
        </div>
        <div className="flex justify-between text-sm text-[#8A8490] font-bold">
          <span>已攒 {formatCurrency(savedAmount)}</span>
          <span>还需 {formatCurrency(remaining)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-[#6B7280]">
        <div className="bg-[#F8FAFC] border border-[#EEF2F7] rounded-[20px] px-3 py-2">
          <p className="text-[10px] font-bold text-[#9CA3AF]">分类</p>
          <p className="font-black text-[#4B454E]">{categoryLabel}</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#EEF2F7] rounded-[20px] px-3 py-2">
          <p className="text-[10px] font-bold text-[#9CA3AF]">账本</p>
          <p className="font-black text-[#4B454E]">{accountLabel}</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#EEF2F7] rounded-[20px] px-3 py-2">
          <p className="text-[10px] font-bold text-[#9CA3AF]">创建时间</p>
          <p className="font-black text-[#4B454E]">{formatDate(goal.createdAt)}</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#EEF2F7] rounded-[20px] px-3 py-2">
          <p className="text-[10px] font-bold text-[#9CA3AF]">最新更新</p>
          <p className="font-black text-[#4B454E]">{formatDate(goal.updatedAt)}</p>
        </div>
      </div>

      {goal.dueDate && (
        <div className="px-3 py-2 rounded-[20px] bg-amber-50/80 border border-amber-200 text-sm text-amber-700 font-black flex items-center gap-2">
          <span>⏰</span>
          <span>目标日期：{formatDate(goal.dueDate)}</span>
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
        <button
          type="button"
          onClick={onQuickContribution}
          className="rounded-2xl px-4 py-2 bg-[#66DDB3] text-white savings-pop-btn font-black transition-all focus:outline-none"
        >
          快速攒一笔
        </button>
        <button
          type="button"
          onClick={onViewDetail}
          className="rounded-2xl px-4 py-2 bg-white border border-[#D9DDE5] text-[#4B454E] pop-shadow-sm font-black hover:bg-gray-50 transition-all focus:outline-none"
        >
          查看详情
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-2xl px-4 py-2 bg-white border border-[#D9DDE5] text-[#4B454E] pop-shadow-sm font-black hover:bg-gray-50 transition-all focus:outline-none"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-2xl px-4 py-2 bg-white border border-rose-200 text-rose-600 pop-shadow-sm font-black hover:bg-rose-50 transition-all focus:outline-none"
        >
          移入回收站
        </button>
      </div>
    </div>
  );
}
