import React from 'react';

interface QuickSaveDialogProps {
  open: boolean;
  goalName: string;
  kind: 'deposit' | 'withdraw';
  note: string;
  amount: string;
  onKindChange: (value: 'deposit' | 'withdraw') => void;
  onNoteChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function QuickSaveDialog({
  open,
  goalName,
  kind,
  note,
  amount,
  onKindChange,
  onNoteChange,
  onAmountChange,
  onCancel,
  onConfirm,
}: QuickSaveDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[28px] pop-shadow p-6">
        <h3 className="text-lg font-black text-[#4B454E] mb-4">快捷记一笔</h3>
        <p className="text-sm font-bold text-gray-500 mb-3">给「{goalName}」记录存入或花掉（单位：元）</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => onKindChange('deposit')}
            className={`h-10 rounded-xl border text-sm font-black transition ${
              kind === 'deposit'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            存入 (+)
          </button>
          <button
            type="button"
            onClick={() => onKindChange('withdraw')}
            className={`h-10 rounded-xl border text-sm font-black transition ${
              kind === 'withdraw'
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            花掉 (-)
          </button>
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-[#4B454E] font-bold outline-none focus:ring-2 focus:ring-[#66DDB3]/30"
          autoFocus
        />

        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="mt-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-[#4B454E] font-bold outline-none focus:ring-2 focus:ring-[#66DDB3]/30"
          placeholder={kind === 'withdraw' ? '备注：买了什么' : '备注：这笔钱从哪里来'}
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-2xl bg-white text-[#4B454E] pop-shadow-sm pop-active-sm btn-transition font-black"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-2xl bg-[#66DDB3] text-white pop-shadow-mint pop-active btn-transition font-black"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
