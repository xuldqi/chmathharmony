import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

export type ContributionSource = 'manual' | 'transaction';

export interface SavingsAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'envelope' | 'other';
  currency: string;
  description?: string;
}

export interface SavingsCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  accountId: string;
  categoryId: string;
  color: string;
  icon: string;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  note?: string;
  kind?: 'deposit' | 'withdraw';
  source: ContributionSource;
  linkedTransactionId?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SavingsBackupPayload {
  version: string;
  platform: 'android' | 'harmony-react' | string;
  exportedAt: string;
  savingsGoals: SavingsGoal[];
  savingsRecords: SavingsContribution[];
  savingsAccounts: SavingsAccount[];
  savingsCategories: SavingsCategory[];
}

interface ImportResult {
  success: boolean;
  importedGoals: number;
  importedRecords: number;
  message?: string;
}

interface ExportResult {
  data: SavingsBackupPayload;
  blob?: Blob;
}

interface CreateGoalInput {
  name: string;
  targetAmount: number;
  accountId: string;
  categoryId: string;
  color?: string;
  icon?: string;
  description?: string;
  dueDate?: string;
}

type UpdateGoalInput = Partial<CreateGoalInput>;

interface ContributionInput {
  amount: number;
  note?: string;
  kind?: 'deposit' | 'withdraw';
  source: ContributionSource;
  linkedTransactionId?: string;
  timestamp: string;
}

interface SavingsState {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  accounts: SavingsAccount[];
  categories: SavingsCategory[];
  lastExportedAt?: string;
  createGoal: (input: CreateGoalInput) => SavingsGoal;
  updateGoal: (goalId: string, input: UpdateGoalInput) => SavingsGoal | null;
  softDeleteGoal: (goalId: string) => void;
  restoreGoal: (goalId: string) => void;
  purgeGoal: (goalId: string) => void;
  addContribution: (goalId: string, input: ContributionInput) => SavingsContribution | null;
  updateContribution: (recordId: string, input: Partial<ContributionInput>) => SavingsContribution | null;
  softDeleteContribution: (recordId: string) => void;
  restoreContribution: (recordId: string) => void;
  removeContribution: (recordId: string) => void;
  getGoalContributions: (goalId: string, includeDeleted?: boolean) => SavingsContribution[];
  importFromBackup: (payload: unknown) => ImportResult;
  exportToBackup: () => ExportResult;
  resetStore: () => void;
}

const STORAGE_KEY = 'savings_center_state';

const defaultAccounts: SavingsAccount[] = [
  { id: 'cash', name: '现金钱包', type: 'cash', currency: 'CNY', description: '日常现金收支' },
  { id: 'bank', name: '银行卡', type: 'bank', currency: 'CNY', description: '主力储蓄账户' },
  { id: 'envelope', name: '零花信封', type: 'envelope', currency: 'CNY', description: '零花零钱管理' },
];

const defaultCategories: SavingsCategory[] = [
  { id: 'education', name: '教育成长', color: '#f97316', icon: 'education', description: '课程、书籍、培训等' },
  { id: 'toy', name: '梦想清单', color: '#a855f7', icon: 'dream', description: '玩具、心愿礼物' },
  { id: 'travel', name: '出行探险', color: '#0ea5e9', icon: 'travel', description: '旅行、夏令营费用' },
  { id: 'emergency', name: '应急金', color: '#facc15', icon: 'emergency', description: '备用金、应急费用' },
];

function generateUUID(): string {
  const g = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : null;
  if (g && g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const storage = typeof window !== 'undefined'
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => noopStorage);

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      goals: [],
      contributions: [],
      accounts: defaultAccounts,
      categories: defaultCategories,
      createGoal: (input) => {
        const now = new Date().toISOString();
        const category = get().categories.find((item) => item.id === input.categoryId);
        const goal: SavingsGoal = {
          id: generateUUID(),
          name: input.name,
          targetAmount: Number(input.targetAmount) || 0,
          accountId: input.accountId,
          categoryId: input.categoryId,
          color: input.color || category?.color || '#3b82f6',
          icon: input.icon || category?.icon || 'target',
          description: input.description,
          dueDate: input.dueDate,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          goals: [...state.goals, goal],
        }));

        return goal;
      },
      updateGoal: (goalId, input) => {
        let updatedGoal: SavingsGoal | null = null;
        set((state) => {
          const goals = state.goals.map((goal) => {
            if (goal.id !== goalId) {
              return goal;
            }

            const next: SavingsGoal = {
              ...goal,
              ...input,
              targetAmount: input.targetAmount !== undefined ? Number(input.targetAmount) : goal.targetAmount,
              accountId: input.accountId ?? goal.accountId,
              categoryId: input.categoryId ?? goal.categoryId,
              color: input.color ?? goal.color,
              icon: input.icon ?? goal.icon,
              updatedAt: new Date().toISOString(),
            };

            updatedGoal = next;
            return next;
          });

          return { goals };
        });

        return updatedGoal;
      },
      softDeleteGoal: (goalId) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId && !goal.deletedAt
              ? { ...goal, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },
      restoreGoal: (goalId) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, deletedAt: undefined, updatedAt: new Date().toISOString() } : goal
          ),
        }));
      },
      purgeGoal: (goalId) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== goalId),
          contributions: state.contributions.filter((record) => record.goalId !== goalId),
        }));
      },
      addContribution: (goalId, input) => {
        const goal = get().goals.find((item) => item.id === goalId && !item.deletedAt);
        if (!goal) {
          console.warn('无法添加攒钱记录，目标不存在或已删除');
          return null;
        }

        const now = new Date().toISOString();
        const record: SavingsContribution = {
          id: generateUUID(),
          goalId,
          amount: Number(input.amount),
          note: input.note,
          kind: input.kind || 'deposit',
          source: input.source,
          linkedTransactionId: input.linkedTransactionId,
          timestamp: input.timestamp,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          contributions: [record, ...state.contributions],
          goals: state.goals.map((item) =>
            item.id === goalId ? { ...item, updatedAt: now } : item
          ),
        }));

        return record;
      },
      updateContribution: (recordId, input) => {
        let updated: SavingsContribution | null = null;
        set((state) => {
          const contributions = state.contributions.map((record) => {
            if (record.id !== recordId) {
              return record;
            }

            const next: SavingsContribution = {
              ...record,
              ...input,
              kind: input.kind || record.kind || 'deposit',
              amount: input.amount !== undefined ? Number(input.amount) : record.amount,
              timestamp: input.timestamp ?? record.timestamp,
              updatedAt: new Date().toISOString(),
            };

            updated = next;
            return next;
          });

          return { contributions };
        });

        return updated;
      },
      softDeleteContribution: (recordId) => {
        set((state) => ({
          contributions: state.contributions.map((record) =>
            record.id === recordId && !record.deletedAt
              ? { ...record, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : record
          ),
        }));
      },
      restoreContribution: (recordId) => {
        set((state) => ({
          contributions: state.contributions.map((record) =>
            record.id === recordId ? { ...record, deletedAt: undefined, updatedAt: new Date().toISOString() } : record
          ),
        }));
      },
      removeContribution: (recordId) => {
        set((state) => ({
          contributions: state.contributions.filter((record) => record.id !== recordId),
        }));
      },
      getGoalContributions: (goalId, includeDeleted = false) => {
        const records = get().contributions.filter((record) => record.goalId === goalId);
        return includeDeleted ? records : records.filter((record) => !record.deletedAt);
      },
      importFromBackup: (payload) => {
        try {
          if (!payload || typeof payload !== 'object') {
            return { success: false, importedGoals: 0, importedRecords: 0, message: '备份文件格式不正确' };
          }

          const raw = payload as Partial<SavingsBackupPayload & Record<string, unknown>>;
          const candidate = raw as Record<string, unknown>;

          const normalizeGoals = (value: unknown): Partial<SavingsGoal>[] => {
            if (!Array.isArray(value)) {
              return [];
            }
            return value.filter((item): item is Partial<SavingsGoal> => typeof item === 'object' && item !== null);
          };

          const normalizeRecords = (value: unknown): Partial<SavingsContribution>[] => {
            if (!Array.isArray(value)) {
              return [];
            }
            return value.filter(
              (item): item is Partial<SavingsContribution> =>
                typeof item === 'object' && item !== null && 'goalId' in item
            );
          };

          const normalizeAccounts = (value: unknown): SavingsAccount[] => {
            if (!Array.isArray(value)) {
              return [];
            }
            return value.filter((item): item is SavingsAccount => typeof item === 'object' && item !== null);
          };

          const normalizeCategories = (value: unknown): SavingsCategory[] => {
            if (!Array.isArray(value)) {
              return [];
            }
            return value.filter((item): item is SavingsCategory => typeof item === 'object' && item !== null);
          };

          const goalsSource =
            raw.savingsGoals ??
            candidate.goals ??
            ((candidate as { targetList?: unknown }).targetList ?? []);
          const recordsSource =
            raw.savingsRecords ?? candidate.records ?? (candidate.contributions ?? []);
          const accountsSource = raw.savingsAccounts ?? candidate.accounts;
          const categoriesSource = raw.savingsCategories ?? candidate.categories;

          const primaryAccountId = (accountsSource && normalizeAccounts(accountsSource)[0]?.id) ?? defaultAccounts[0].id;
          const primaryCategoryId =
            (categoriesSource && normalizeCategories(categoriesSource)[0]?.id) ?? defaultCategories[0].id;

          const sanitizedGoals = normalizeGoals(goalsSource).map((goal) => ({
            id: goal.id ?? generateUUID(),
            name: goal.name ?? '攒钱目标',
            targetAmount: Number(goal.targetAmount) || 0,
            accountId: goal.accountId ?? primaryAccountId,
            categoryId: goal.categoryId ?? primaryCategoryId,
            color: goal.color ?? '#38bdf8',
            icon: goal.icon ?? 'target',
            description: goal.description,
            dueDate: goal.dueDate,
            createdAt: goal.createdAt ?? new Date().toISOString(),
            updatedAt: goal.updatedAt ?? new Date().toISOString(),
            deletedAt: goal.deletedAt,
          }));
          const sanitizedRecords = normalizeRecords(recordsSource)
            .filter((record) => !!record.goalId)
            .map((record) => ({
              id: record.id ?? generateUUID(),
              goalId: record.goalId as string,
              amount: Number(record.amount) || 0,
              note: record.note,
              kind: (record as SavingsContribution).kind || 'deposit',
              source: record.source ?? 'manual',
              linkedTransactionId: record.linkedTransactionId,
              timestamp: record.timestamp ?? new Date().toISOString(),
              createdAt: record.createdAt ?? new Date().toISOString(),
              updatedAt: record.updatedAt ?? new Date().toISOString(),
              deletedAt: record.deletedAt,
            }));
          const accounts =
            accountsSource && accountsSource !== undefined ? normalizeAccounts(accountsSource) : [];
          const categories =
            categoriesSource && categoriesSource !== undefined ? normalizeCategories(categoriesSource) : [];

          set({
            goals: sanitizedGoals,
            contributions: sanitizedRecords,
            accounts: accounts.length ? accounts : defaultAccounts,
            categories: categories.length ? categories : defaultCategories,
          });

          return {
            success: true,
            importedGoals: sanitizedGoals.length,
            importedRecords: sanitizedRecords.length,
          };
        } catch (error) {
          console.error('导入攒钱数据失败', error);
          return {
            success: false,
            importedGoals: 0,
            importedRecords: 0,
            message: '导入过程中出现错误',
          };
        }
      },
      exportToBackup: () => {
        const state = get();
        const exportedAt = new Date().toISOString();

        const data: SavingsBackupPayload = {
          version: '1.0.0',
          platform: 'harmony-react',
          exportedAt,
          savingsGoals: state.goals,
          savingsRecords: state.contributions,
          savingsAccounts: state.accounts,
          savingsCategories: state.categories,
        };

        let blob: Blob | undefined;
        try {
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        } catch (error) {
          console.warn('无法生成导出文件Blob对象', error);
        }

        set({ lastExportedAt: exportedAt });

        return { data, blob };
      },
      resetStore: () => {
        set({
          goals: [],
          contributions: [],
          accounts: defaultAccounts,
          categories: defaultCategories,
          lastExportedAt: undefined,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage,
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState as SavingsState;
        }

        const state = persistedState as Partial<SavingsState>;

        if (version < 2) {
          state.accounts = state.accounts && state.accounts.length ? state.accounts : defaultAccounts;
          state.categories = state.categories && state.categories.length ? state.categories : defaultCategories;
        }

        return state as SavingsState;
      },
      partialize: (state) => ({
        goals: state.goals,
        contributions: state.contributions,
        accounts: state.accounts,
        categories: state.categories,
        lastExportedAt: state.lastExportedAt,
      }),
    }
  )
);
