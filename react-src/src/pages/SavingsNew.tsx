import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavingsStore, type SavingsAccount } from '@/stores/savingsStore';
import '@/styles/savings-page.css';
import AppPageHeader from '@/components/AppPageHeader';

type NewGoalFormState = {
  name: string;
  targetAmount: string;
  categoryId: string;
  accountId: string;
  dueDate: string;
};

export default function SavingsNew() {
  const navigate = useNavigate();
  const store = useSavingsStore();
  const accounts = Array.isArray(store.accounts) ? store.accounts : [];
  const categories = Array.isArray(store.categories) ? store.categories : [];
  const { createGoal } = store;

  const accountOptions = useMemo(() => {
    const preferredIds = ['cash', 'bank'];
    const preferred = preferredIds
      .map((id) => accounts.find((account) => account.id === id))
      .filter((account): account is SavingsAccount => Boolean(account));
    return preferred.length > 0 ? preferred : accounts;
  }, [accounts]);

  const [form, setForm] = useState<NewGoalFormState>(() => {
    const defaultCategory = categories[0];
    const defaultAccount = accounts.find((account) => account.id === 'cash') ?? accounts[0];
    return {
      name: '',
      targetAmount: '0.00',
      categoryId: defaultCategory?.id ?? '',
      accountId: defaultAccount?.id ?? '',
      dueDate: '',
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0 || accountOptions.length === 0) return;
    setForm((prev) => {
      const categoryExists = categories.some((item) => item.id === prev.categoryId);
      const accountExists = accountOptions.some((item) => item.id === prev.accountId);
      const nextCategoryId = categoryExists ? prev.categoryId : categories[0].id;
      const nextAccountId = accountExists ? prev.accountId : accountOptions[0].id;
      if (nextCategoryId === prev.categoryId && nextAccountId === prev.accountId) {
        return prev;
      }
      return {
        ...prev,
        categoryId: nextCategoryId,
        accountId: nextAccountId,
      };
    });
  }, [categories, accountOptions]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleChange = (field: keyof NewGoalFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setFeedback('请先填写心愿名称');
      return;
    }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      setFeedback('请填写大于 0 的目标金额');
      return;
    }
    if (!form.categoryId || !form.accountId) {
      setFeedback('请选择分类和来源账户');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const selectedCategory =
        categories.find((category) => category.id === form.categoryId) ?? categories[0];
      const goal = createGoal({
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        accountId: form.accountId,
        categoryId: selectedCategory?.id ?? form.categoryId,
        color: selectedCategory?.color,
        icon: selectedCategory?.icon,
        dueDate: form.dueDate || undefined,
      });
      navigate(`/savings/${goal.id}`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountLabel = (account: SavingsAccount) => {
    if (account.id === 'cash') return '现金钱包';
    if (account.id === 'bank') return '银行卡';
    if (account.id === 'envelope') return '零花信封';
    return account.name;
  };

  return (
    <div className="savings-page min-h-screen text-[#4B454E] overflow-x-hidden relative">
      <div className="fixed -top-[100px] -left-[100px] w-[300px] h-[300px] bg-[#66DDB3] rounded-full blur-[100px] opacity-20 pointer-events-none z-0" />
      <div className="fixed bottom-[100px] -right-[50px] w-[250px] h-[250px] bg-[#A78BFA] rounded-full blur-[80px] opacity-10 pointer-events-none z-0" />

      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#4B454E] text-white text-xs font-black z-30">
          {feedback}
        </div>
      )}

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-6 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-24">
        <div className="mb-6">
          <AppPageHeader
            title="新建心愿"
            onBack={() => navigate('/savings')}
          />
        </div>

        <main className="flex-1 flex flex-col gap-6 pb-24">
          <section>
            <label className="block text-sm font-extrabold ml-4 mb-3 text-[#4B454E]/80 tracking-wide">
              心愿名称 <span className="text-[#FF6B6B]">*</span>
            </label>
            <div className="bg-white rounded-[24px] p-5 pop-shadow group focus-within:ring-2 focus-within:ring-[#66DDB3]/30 transition-all">
              <input
                type="text"
                placeholder="给你的心愿起个名字..."
                className="w-full bg-transparent outline-none text-lg font-bold placeholder-gray-300 text-[#4B454E]"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
          </section>

          <section>
            <label className="block text-sm font-extrabold ml-4 mb-3 text-[#4B454E]/80 tracking-wide">
              目标金额 <span className="text-[#FF6B6B]">*</span>
            </label>
            <div className="bg-white rounded-[24px] p-5 pop-shadow flex items-center gap-2 group focus-within:ring-2 focus-within:ring-[#66DDB3]/30 transition-all">
              <span className="text-[#3CC9A0] text-3xl font-black">¥</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-transparent outline-none text-3xl font-black text-[#4B454E] placeholder-gray-300"
                value={form.targetAmount}
                onChange={(e) => handleChange('targetAmount', e.target.value)}
              />
            </div>
          </section>

          <section>
            <label className="block text-sm font-extrabold ml-4 mb-3 text-[#4B454E]/80 tracking-wide">
              分类
            </label>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1 -mx-1">
              {categories.map((category) => {
                const selected = form.categoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleChange('categoryId', category.id)}
                    className={
                      selected
                        ? 'flex-shrink-0 bg-[#66DDB3] text-white px-6 py-3 rounded-full pop-shadow-mint font-extrabold text-sm whitespace-nowrap active:transform active:translate-y-1 active:shadow-none transition-all'
                        : 'flex-shrink-0 bg-white text-[#4B454E] px-6 py-3 rounded-full pop-shadow-sm font-extrabold text-sm whitespace-nowrap hover:bg-gray-50 active-scale'
                    }
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="block text-sm font-extrabold ml-4 mb-3 text-[#4B454E]/80 tracking-wide">
              来源账户
            </label>
            <div className="bg-white rounded-[24px] px-5 py-2 pop-shadow">
              {accountOptions.map((account, index) => {
                const isCash = account.id === 'cash';
                const isBank = account.id === 'bank';
                return (
                  <label
                    key={account.id}
                    className={`flex items-center justify-between py-4 cursor-pointer ${
                      index < accountOptions.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCash ? 'bg-[#E8F6F1] text-[#66DDB3]' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        <i
                          className={`text-xl ${
                            isCash ? 'ph-fill ph-wallet' : isBank ? 'ph-fill ph-credit-card' : 'ph-fill ph-wallet'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="font-bold text-[#4B454E]">{getAccountLabel(account)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isCash && <span className="text-sm font-bold text-gray-400">¥0.00</span>}
                      <input
                        type="radio"
                        name="source-account"
                        className="custom-radio"
                        checked={form.accountId === account.id}
                        onChange={() => handleChange('accountId', account.id)}
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <label className="block text-sm font-extrabold ml-4 mb-3 text-[#4B454E]/80 tracking-wide">
              截止日期 <span className="font-normal text-gray-400">（选填）</span>
            </label>
            <button
              type="button"
              className="w-full bg-white rounded-[24px] p-5 pop-shadow flex items-center justify-between cursor-pointer active-scale group"
              onClick={() => {
                // 聚焦到隐藏的日期输入，复用浏览器日期选择器
                const input = document.getElementById('savings-due-date-input') as HTMLInputElement | null;
                if (input) {
                  input.showPicker?.();
                  input.focus();
                }
              }}
            >
              <span
                className={`font-bold text-lg ${
                  form.dueDate ? 'text-[#4B454E]' : 'text-gray-300'
                }`}
              >
                {form.dueDate ? form.dueDate : '请选择截止日期'}
              </span>
              <i
                className="ph-bold ph-calendar-blank text-2xl text-gray-300 group-hover:text-[#66DDB3] transition-colors"
                aria-hidden="true"
              />
            </button>
            <input
              id="savings-due-date-input"
              type="date"
              className="sr-only"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </section>
        </main>

        <div className="fixed bottom-8 left-0 right-0 px-6 max-w-md mx-auto z-20">
          <button
            type="button"
            className="w-full h-16 bg-[#66DDB3] rounded-[24px] pop-shadow-btn flex items-center justify-center gap-2 group"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <span className="text-white font-black text-xl tracking-wide">
              {submitting ? '创建中…' : '创建心愿'}
            </span>
            {!submitting && (
              <i className="ph-bold ph-sparkle text-white text-xl group-hover:animate-pulse" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
