import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavingsStore, type SavingsGoal } from '@/stores/savingsStore';
import { formatCurrency, formatDateTime } from '@/utils/format';
import '@/styles/savings-page.css';
import { Plus, Trash2, X, Archive } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import MainTabBar from '@/components/MainTabBar';
import { useIsCurrentTab } from '@/lib/tabConfig';
import QuickSaveDialog from '@/components/savings/QuickSaveDialog';

type ToastTone = 'success' | 'warning';

type ToastState = {
  message: string;
  tone: ToastTone;
};

const iconWrapClasses = [
  'bg-blue-50 text-blue-400',
  'bg-rose-50 text-rose-400',
  'bg-amber-50 text-amber-500',
  'bg-violet-50 text-violet-500',
  'bg-emerald-50 text-emerald-500',
];

function getAccountLabel(goal: SavingsGoal, fallbackName?: string): string {
  if (goal.accountId === 'cash') return '现金钱包';
  if (goal.accountId === 'bank') return '银行卡';
  if (goal.accountId === 'envelope') return '零花信封';
  return fallbackName ?? goal.accountId;
}

export default function Savings() {
  const navigate = useNavigate();
  const store = useSavingsStore();
  const goals = Array.isArray(store.goals) ? store.goals : [];
  const contributions = Array.isArray(store.contributions) ? store.contributions : [];
  const categories = Array.isArray(store.categories) ? store.categories : [];
  const accounts = Array.isArray(store.accounts) ? store.accounts : [];
  const { addContribution, restoreGoal, purgeGoal } = store;

  const [toast, setToast] = useState<ToastState | null>(null);
  const [showTrashPanel, setShowTrashPanel] = useState(false);
  const [quickSaveTarget, setQuickSaveTarget] = useState<SavingsGoal | null>(null);
  const [quickSaveAmount, setQuickSaveAmount] = useState('10');
  const [quickSaveKind, setQuickSaveKind] = useState<'deposit' | 'withdraw'>('deposit');
  const [quickSaveNote, setQuickSaveNote] = useState('');

  const isTab = useIsCurrentTab('/savings');

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [accounts]);

  const savedAmountMap = useMemo(() => {
    const map = new Map<string, number>();
    contributions
      .filter((record) => !record.deletedAt)
      .forEach((record) => {
        const current = map.get(record.goalId) ?? 0;
        const delta = record.kind === 'withdraw' ? -record.amount : record.amount;
        map.set(record.goalId, current + delta);
      });
    return map;
  }, [contributions]);

  const activeGoals = useMemo(() => goals.filter((goal) => !goal.deletedAt), [goals]);
  const archivedGoals = useMemo(() => goals.filter((goal) => goal.deletedAt), [goals]);

  const totalSaved = useMemo(
    () => activeGoals.reduce((sum, goal) => sum + (savedAmountMap.get(goal.id) ?? 0), 0),
    [activeGoals, savedAmountMap]
  );
  const totalTarget = useMemo(
    () => activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0),
    [activeGoals]
  );
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleQuickSave = (goal: SavingsGoal) => {
    setQuickSaveTarget(goal);
    setQuickSaveAmount('10');
    setQuickSaveKind('deposit');
    setQuickSaveNote('');
  };

  const handleConfirmQuickSave = () => {
    if (!quickSaveTarget) return;
    const amount = Number(quickSaveAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast({ message: '请输入大于 0 的金额', tone: 'warning' });
      return;
    }

    const currentSaved = savedAmountMap.get(quickSaveTarget.id) ?? 0;
    if (quickSaveKind === 'withdraw' && amount > currentSaved) {
      setToast({ message: '花掉金额不能超过当前已攒', tone: 'warning' });
      return;
    }

    const noteText = quickSaveNote.trim();
    addContribution(quickSaveTarget.id, {
      amount,
      kind: quickSaveKind,
      note: noteText || (quickSaveKind === 'withdraw' ? '快捷记录：花掉一笔' : '快捷记录：存入一笔'),
      source: 'manual',
      timestamp: new Date().toISOString(),
    });

    setToast({
      message: `已为「${quickSaveTarget.name}」${quickSaveKind === 'withdraw' ? '记录花掉' : '添加'} ${formatCurrency(amount)}`,
      tone: 'success',
    });
    setQuickSaveTarget(null);
    setQuickSaveAmount('10');
    setQuickSaveKind('deposit');
    setQuickSaveNote('');
  };

  return (
    <div className="savings-page w-full min-h-screen relative overflow-x-hidden pb-12">
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="fixed bottom-[100px] right-[-100px] w-[300px] h-[300px] bg-green-200/30 rounded-full blur-[80px] pointer-events-none z-0" />

      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full text-sm font-black shadow-lg ${
            toast.tone === 'success' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-[#4B454E]'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className={`relative z-10 max-w-md mx-auto px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-12'} flex flex-col gap-4`}>
        <AppPageHeader
          title="心愿存钱罐"
          onBack={isTab ? undefined : () => navigate(-1)}
          showBack={!isTab}
          rightElement={
            <button
              type="button"
              onClick={() => setShowTrashPanel(true)}
              aria-label="归档心愿"
              className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E] cursor-pointer"
            >
              <Archive className="w-5 h-5 text-gray-500" />
              {archivedGoals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {archivedGoals.length}
                </span>
              )}
            </button>
          }
        />

        <div className="bg-white rounded-[32px] p-6 card-shadow w-full">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-400">活跃目标</span>
              <span className="text-3xl font-black text-[#4B454E]">{activeGoals.length}</span>
            </div>

            <div className="w-[2px] h-10 bg-gray-100 rounded-full" />

            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-400">已攒金额</span>
              <span className="text-2xl font-black text-[#3CC9A0]">{formatCurrency(totalSaved)}</span>
            </div>

            <div className="w-[2px] h-10 bg-gray-100 rounded-full" />

            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-400">总体进度</span>
              <span className="text-2xl font-black text-[#9F85F0]">{overallProgress}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between px-2">
            <h2 className="text-xl font-extrabold text-[#4B454E]">我的心愿</h2>
            <span className="text-sm font-bold text-gray-400">{activeGoals.length}个目标</span>
          </div>

          {activeGoals.length === 0 ? (
            <div className="bg-white rounded-[32px] p-6 card-shadow flex flex-col items-center justify-center gap-3 text-center w-full">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center">
                <i className="ph-fill ph-piggy-bank text-3xl" />
              </div>
              <p className="text-xl font-black text-[#4B454E]">还没有心愿目标</p>
              <p className="text-sm font-bold text-gray-400">点击下方「+」开始第一笔计划</p>
            </div>
          ) : (
            activeGoals.map((goal, idx) => {
              const saved = savedAmountMap.get(goal.id) ?? 0;
              const target = goal.targetAmount;
              const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
              const fillWidth = target > 0 ? Math.max(progress, 2) : 0;
              const remaining = Math.max(target - saved, 0);
              const categoryLabel = categoryMap.get(goal.categoryId) ?? goal.categoryId;
              const accountLabel = getAccountLabel(goal, accountMap.get(goal.accountId));
              const iconWrapClass = iconWrapClasses[idx % iconWrapClasses.length];

              return (
                <div key={goal.id} className="bg-white rounded-[32px] p-6 card-shadow flex flex-col gap-5 w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconWrapClass}`}>
                        {goal.icon ? (
                          <span className="text-2xl leading-none">{goal.icon}</span>
                        ) : (
                          <i className="ph-fill ph-diamond text-2xl" />
                        )}
                      </div>
                      <span className="text-2xl font-black text-[#4B454E]">{goal.name}</span>
                    </div>
                    <div className="text-right pt-1">
                      <div className="text-xs font-bold text-gray-400 mb-0.5">目标金额</div>
                      <div className="text-lg font-bold text-[#4B454E]">{formatCurrency(target)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-400">当前进度</span>
                      <span className="text-sm font-black text-[#4B454E]">{progress}%</span>
                    </div>

                    <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-[#66DDB3] rounded-full"
                        style={{ width: `${fillWidth}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 mt-1">
                      <span>已攒 {formatCurrency(saved)}</span>
                      <span>还需 {formatCurrency(remaining)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-full bg-[#E8F6F1] text-[#3CC9A0] text-xs font-extrabold tracking-wide">
                      {categoryLabel}
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-[#F3E0FA] text-[#9F85F0] text-xs font-extrabold tracking-wide">
                      {accountLabel}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickSave(goal)}
                      className="bg-[#66DDB3] text-white h-12 rounded-2xl btn-mint-shadow font-extrabold text-sm flex items-center justify-center gap-2 transition-transform"
                    >
                      <i className="ph-bold ph-coins text-lg" />
                      快速攒一笔
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/savings/${goal.id}`)}
                      className="bg-white border-2 border-transparent text-[#4B454E] h-12 rounded-2xl btn-white-shadow font-extrabold text-sm flex items-center justify-center gap-2 transition-transform hover:bg-gray-50"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

      {/* 右下角悬浮圆圈 + 号添加按钮 */}
      <button
        type="button"
        onClick={() => navigate('/savings/new')}
        aria-label="新建心愿"
        className="fixed right-6 bottom-24 z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-[#9F85F0] to-[#8062E8] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        style={{ boxShadow: '0 8px 16px rgba(128, 98, 232, 0.35), 0 4px 0 #583BB8' }}
      >
        <Plus className="w-8 h-8 stroke-[2.5]" />
      </button>

      {/* 右上角归档弹窗 */}
      {showTrashPanel && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-md rounded-[32px] p-6 card-shadow flex flex-col gap-4 max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-black text-[#4B454E]">已归档心愿</h3>
                <span className="text-xs font-bold text-gray-400">({archivedGoals.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrashPanel(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-3 pr-1 max-h-[60vh]">
              {archivedGoals.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                    <Archive className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">暂无归档的心愿</p>
                </div>
              ) : (
                archivedGoals.map((goal) => (
                  <div key={goal.id} className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#4B454E] truncate">{goal.name}</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                        归档时间：{goal.deletedAt ? formatDateTime(goal.deletedAt) : '--'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => restoreGoal(goal.id)}
                        className="h-8 px-3 rounded-xl bg-white text-[#4B454E] border border-gray-200 text-xs font-black active:scale-95 transition-transform"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        onClick={() => purgeGoal(goal.id)}
                        className="h-8 px-3 rounded-xl bg-rose-500 text-white text-xs font-black active:scale-95 transition-transform shadow-sm"
                      >
                        彻底删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <QuickSaveDialog
        open={Boolean(quickSaveTarget)}
        goalName={quickSaveTarget?.name ?? ''}
        kind={quickSaveKind}
        note={quickSaveNote}
        amount={quickSaveAmount}
        onKindChange={setQuickSaveKind}
        onNoteChange={setQuickSaveNote}
        onAmountChange={setQuickSaveAmount}
        onCancel={() => {
          setQuickSaveTarget(null);
          setQuickSaveAmount('10');
          setQuickSaveKind('deposit');
          setQuickSaveNote('');
        }}
        onConfirm={handleConfirmQuickSave}
      />

      {isTab && <MainTabBar />}
    </div>
  );
}
