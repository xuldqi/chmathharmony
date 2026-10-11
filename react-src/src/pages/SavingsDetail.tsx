import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSavingsStore } from '@/stores/savingsStore';
import { formatCurrency, formatDateTime } from '@/utils/format';
import AppPageHeader from '@/components/AppPageHeader';
import { Archive } from 'lucide-react';
import QuickSaveDialog from '@/components/savings/QuickSaveDialog';

function formatMonthDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--/--';
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${day}`;
}

export default function SavingsDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const store = useSavingsStore();
  const goals = Array.isArray(store.goals) ? store.goals : [];
  const contributions = Array.isArray(store.contributions) ? store.contributions : [];
  const categories = Array.isArray(store.categories) ? store.categories : [];
  const accounts = Array.isArray(store.accounts) ? store.accounts : [];
  const {
    updateGoal,
    softDeleteGoal,
    restoreGoal,
    addContribution,
  } = store;

  const goal = goals.find((item) => item.id === goalId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [quickSaveAmount, setQuickSaveAmount] = useState('10');
  const [quickSaveKind, setQuickSaveKind] = useState<'deposit' | 'withdraw'>('deposit');
  const [quickSaveNote, setQuickSaveNote] = useState('');
  const [showQuickSaveDialog, setShowQuickSaveDialog] = useState(false);
  const [pendingTrashConfirm, setPendingTrashConfirm] = useState(false);

  const activeRecords = useMemo(
    () =>
      contributions
        .filter((record) => record.goalId === goalId && !record.deletedAt)
        .sort(
          (a, b) =>
            new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
        ),
    [contributions, goalId]
  );

  const totalSaved = useMemo(
    () =>
      activeRecords.reduce(
        (sum, record) => sum + (record.kind === 'withdraw' ? -record.amount : record.amount),
        0
      ),
    [activeRecords]
  );

  useEffect(() => {
    if (!goal) return;
    setEditName(goal.name);
    setEditTargetAmount(goal.targetAmount.toString());
    setEditDueDate(goal.dueDate ?? '');
  }, [goal]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  if (!goal) {
    return (
      <div className="savings-page min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-[32px] pop-shadow p-8 text-center">
          <p className="text-2xl font-black text-[#4B454E] mb-2">目标不存在</p>
          <p className="text-sm font-bold text-gray-400 mb-5">可能已经被删除或尚未创建</p>
          <button
            type="button"
            onClick={() => navigate('/savings')}
            className="bg-[#66DDB3] text-white px-6 py-3 rounded-full pop-shadow-mint pop-active btn-transition font-black"
          >
            返回心愿页
          </button>
        </div>
      </div>
    );
  }

  const categoryName = categories.find((item) => item.id === goal.categoryId)?.name ?? goal.categoryId;
  const accountName = accounts.find((item) => item.id === goal.accountId)?.name ?? goal.accountId;
  const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((totalSaved / goal.targetAmount) * 100)) : 0;
  const remaining = Math.max(goal.targetAmount - totalSaved, 0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  const handleQuickSave = () => {
    const amount = Number(quickSaveAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback('请输入大于 0 的金额');
      return;
    }
    if (quickSaveKind === 'withdraw' && amount > totalSaved) {
      setFeedback('花掉金额不能超过当前已攒');
      return;
    }

    const noteText = quickSaveNote.trim();
    addContribution(goal.id, {
      amount,
      kind: quickSaveKind,
      source: 'manual',
      note: noteText || (quickSaveKind === 'withdraw' ? '快捷记录：花掉一笔' : '快捷记录：存入一笔'),
      timestamp: new Date().toISOString(),
    });
    setFeedback(`${quickSaveKind === 'withdraw' ? '已记录花掉' : '已新增'} ${formatCurrency(amount)}`);
    setShowQuickSaveDialog(false);
    setQuickSaveAmount('10');
    setQuickSaveKind('deposit');
    setQuickSaveNote('');
  };

  const handleSaveGoal = () => {
    const name = editName.trim();
    const targetAmount = Number(editTargetAmount);
    if (!name) {
      setFeedback('目标名称不能为空');
      return;
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setFeedback('目标金额需大于 0');
      return;
    }

    updateGoal(goal.id, {
      name,
      targetAmount,
      dueDate: editDueDate || undefined,
    });
    setIsEditing(false);
    setFeedback('目标信息已更新');
  };

  const handleTrashAction = () => {
    if (goal.deletedAt) {
      restoreGoal(goal.id);
      setFeedback('目标已恢复');
      return;
    }
    setPendingTrashConfirm(true);
  };

  const confirmTrashAction = () => {
    setPendingTrashConfirm(false);
    softDeleteGoal(goal.id);
    navigate('/savings');
  };

  return (
    <div className="savings-page w-full h-full antialiased overflow-x-hidden relative pb-10 min-h-screen">
      <div className="fixed rounded-full blur-[80px] z-0 w-[300px] h-[300px] bg-[rgba(102,221,179,0.15)] top-[-50px] right-[-100px]" />
      <div className="fixed rounded-full blur-[80px] z-0 w-[250px] h-[250px] bg-[rgba(243,224,250,0.4)] bottom-[100px] left-[-50px]" />

      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#4B454E] text-white text-xs font-black z-30">
          {feedback}
        </div>
      )}

      <div className="max-w-md mx-auto px-6 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-24 flex flex-col gap-6 relative z-10">
        <AppPageHeader
          title="目标详情"
          onBack={() => navigate('/savings')}
          rightElement={
            <button
              type="button"
              onClick={handleTrashAction}
              aria-label={goal.deletedAt ? '恢复目标' : '归档目标'}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E] hover:bg-gray-50"
            >
              <Archive className={`w-5 h-5 ${goal.deletedAt ? 'text-emerald-500' : 'text-gray-500'}`} />
            </button>
          }
        />

        <section className="bg-white rounded-[32px] pop-shadow p-8 flex flex-col items-center relative overflow-hidden">
          <div className="flex flex-col items-center mb-6 z-10">
            <div className="w-12 h-12 bg-[#E8F6F1] rounded-full flex items-center justify-center mb-3">
              <i className="ph-fill ph-diamond text-[#66DDB3] text-2xl" />
            </div>
            <h2 className="text-3xl font-black text-[#4B454E]">{goal.name}</h2>
          </div>

          <div className="relative w-[160px] h-[160px] mb-4 z-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" strokeLinecap="round" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#66DDB3"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#66DDB3]">{progress}%</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-6 z-10">
            <span className="text-2xl font-black text-[#66DDB3]">{formatCurrency(totalSaved)}</span>
            <span className="text-lg font-bold text-gray-300">/ {formatCurrency(goal.targetAmount)}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 z-10">
            <span className="px-4 py-1.5 bg-[#E8F6F1] text-[#66DDB3] rounded-full text-xs font-extrabold tracking-wide">
              {categoryName}
            </span>
            <span className="px-4 py-1.5 bg-[#F3E0FA] text-[#B580D1] rounded-full text-xs font-extrabold tracking-wide">
              {accountName}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-[24px] pop-shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-gray-400 mb-1">还需</span>
            <span className="text-sm font-black text-[#4B454E]">{formatCurrency(remaining)}</span>
          </div>
          <div className="bg-white rounded-[24px] pop-shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-gray-400 mb-1">记录笔数</span>
            <span className="text-sm font-black text-[#4B454E]">{activeRecords.length}笔</span>
          </div>
          <div className="bg-white rounded-[24px] pop-shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-gray-400 mb-1">创建</span>
            <span className="text-sm font-black text-[#4B454E]">{formatMonthDay(goal.createdAt)}</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setQuickSaveAmount('10');
              setQuickSaveKind('deposit');
              setQuickSaveNote('');
              setShowQuickSaveDialog(true);
            }}
            className="bg-[#66DDB3] text-white rounded-full py-4 pop-shadow-mint pop-active btn-transition flex items-center justify-center gap-2 font-black text-lg"
          >
            <i className="ph-bold ph-plus-circle" />
            <span>快速攒一笔</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-white text-[#4B454E] rounded-full py-4 pop-shadow pop-active btn-transition flex items-center justify-center gap-2 font-black text-lg"
          >
            <i className="ph-bold ph-pencil-simple" />
            <span>编辑目标</span>
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-[#4B454E]">攒钱记录</h3>
            <span className="text-xs font-bold text-gray-400">
              {activeRecords.length > 0 ? `${activeRecords.length}笔记录` : '暂无记录'}
            </span>
          </div>

          {activeRecords.length === 0 ? (
            <div className="bg-white rounded-[32px] pop-shadow p-10 flex flex-col items-center justify-center text-center min-h-[160px]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <i className="ph-fill ph-notebook text-3xl" />
              </div>
              <p className="text-gray-400 font-bold mb-1">还没有攒钱记录</p>
              <p className="text-gray-300 text-xs font-bold">快去攒第一笔吧！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeRecords.map((record) => (
                <div key={record.id} className="bg-white rounded-[24px] pop-shadow-sm p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-[#4B454E]">
                      <span className={record.kind === 'withdraw' ? 'text-rose-500' : 'text-[#66DDB3]'}>
                        {record.kind === 'withdraw' ? '-' : '+'}
                        {formatCurrency(record.amount)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                      {formatDateTime(record.timestamp || record.createdAt)}
                    </p>
                    {record.note && <p className="text-xs text-gray-400 font-bold mt-1">{record.note}</p>}
                  </div>
                  <div className="px-2 py-1 rounded-full text-[10px] font-black bg-gray-50 text-gray-400">
                    {record.source === 'transaction' ? '关联账本' : '手动记录'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-2 mb-6">
          <button
            type="button"
            onClick={handleTrashAction}
            className="w-full bg-white rounded-[32px] pop-shadow pop-active btn-transition p-5 flex items-center justify-between group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-[#8062E8] font-black text-base flex items-center gap-2">
                <Archive className="w-5 h-5" />
                {goal.deletedAt ? '恢复目标' : '归档此目标'}
              </span>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {goal.deletedAt ? '目标已在归档列表中' : '归档后可随时恢复'}
              </span>
            </div>
            <i className="ph-bold ph-caret-right text-gray-300 group-hover:text-gray-400 transition-colors" />
          </button>
        </section>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-[28px] pop-shadow p-6">
            <h3 className="text-xl font-black text-[#4B454E] mb-5">编辑目标</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-gray-500">目标名称</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 font-extrabold text-sm focus:outline-none focus:border-[#66DDB3]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-500">目标金额</span>
                <input
                  type="number"
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                  className="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 font-extrabold text-sm focus:outline-none focus:border-[#66DDB3]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-500">计划完成日期</span>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 font-extrabold text-sm focus:outline-none focus:border-[#66DDB3]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-12 rounded-2xl bg-white text-[#4B454E] pop-shadow-sm pop-active-sm btn-transition font-black"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="h-12 rounded-2xl bg-[#66DDB3] text-white pop-shadow-mint pop-active btn-transition font-black"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingTrashConfirm && (
        <div className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-[28px] pop-shadow p-6">
            <h3 className="text-xl font-black text-[#4B454E] mb-2">归档目标</h3>
            <p className="text-sm font-bold text-gray-400 mb-6">确定要把这个目标归档吗？可以在归档心愿中随时恢复。</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingTrashConfirm(false)}
                className="h-12 rounded-2xl bg-white text-[#4B454E] pop-shadow-sm pop-active-sm btn-transition font-black"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmTrashAction}
                className="h-12 rounded-2xl bg-[#8062E8] text-white pop-shadow-sm pop-active-sm btn-transition font-black"
              >
                确认归档
              </button>
            </div>
          </div>
        </div>
      )}

      <QuickSaveDialog
        open={showQuickSaveDialog}
        goalName={goal.name}
        kind={quickSaveKind}
        note={quickSaveNote}
        amount={quickSaveAmount}
        onKindChange={setQuickSaveKind}
        onNoteChange={setQuickSaveNote}
        onAmountChange={setQuickSaveAmount}
        onCancel={() => {
          setShowQuickSaveDialog(false);
          setQuickSaveAmount('10');
          setQuickSaveKind('deposit');
          setQuickSaveNote('');
        }}
        onConfirm={handleQuickSave}
      />
    </div>
  );
}
