import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Gift,
  History,
  Settings as SettingsIcon,
  X,
  Check,
} from 'lucide-react';
import MainTabBar from '@/components/MainTabBar';
import GameStorage, { type PlayerStats, type LocalProfile } from '@/lib/gameStorage';
import StudyDataStorage from '@/lib/studyDataStorage';
import HistoryStorage from '@/lib/historyStorage';
import { useSavingsStore } from '@/stores/savingsStore';
import { formatCurrency } from '@/utils/format';
import { AdControl } from '@/native/adControl';
import '@/styles/mine-page.css';

const AVATAR_EMOJIS = [
  '🐱', '🐼', '🦊', '🐯', '🐰', '🦁', '🐵', '🐸',
  '🦉', '🦄', '🦖', '🐙', '🐬', '🐧', '🐻', '🐨',
  '🐠', '🦋', '🐞', '🐢'
];

function getRandomAvatar(): string {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

export default function My() {
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  // 玩家与学习数据
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [studyDays, setStudyDays] = useState(0);

  // 心愿储蓄数据
  const savingsStore = useSavingsStore();
  const goals = Array.isArray(savingsStore.goals) ? savingsStore.goals : [];
  const contributions = Array.isArray(savingsStore.contributions) ? savingsStore.contributions : [];

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

  const activeGoals = useMemo(() => goals.filter((g) => !g.deletedAt), [goals]);
  const totalSaved = useMemo(
    () => activeGoals.reduce((sum, g) => sum + (savedAmountMap.get(g.id) ?? 0), 0),
    [activeGoals, savedAmountMap]
  );
  const totalTarget = useMemo(
    () => activeGoals.reduce((sum, g) => sum + g.targetAmount, 0),
    [activeGoals]
  );
  const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  // 个人资料弹窗编辑状态
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState<LocalProfile | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [calcCount, setCalcCount] = useState<number>(0);

  useEffect(() => {
    try {
      const stats = GameStorage.getPlayerStats();
      const localProfile = GameStorage.getOrCreateLocalProfile();
      const studyStats = StudyDataStorage.getStudyStats();
      const historyItems = HistoryStorage.getHistory();
      setPlayerStats(stats);
      setProfile(localProfile);
      setStudyDays(studyStats.studyDays || 0);
      setCalcCount(historyItems.length);
    } catch (e) {
      console.error('加载个人中心数据失败', e);
    }
  }, []);

  // 恢复并保持滚动位置
  useEffect(() => {
    const saved = sessionStorage.getItem('my_page_scroll_top');
    if (saved && mainRef.current) {
      mainRef.current.scrollTop = Number(saved);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem('my_page_scroll_top', String(e.currentTarget.scrollTop));
  };

  const handleNavigate = (route: string) => {
    if (mainRef.current) {
      sessionStorage.setItem('my_page_scroll_top', String(mainRef.current.scrollTop));
    }
    navigate(route, { state: { fromSubpage: true } });
  };

  // 跳转应用市场（优先使用原生直接调起华为详情页，失败则降级）
  const handleOpenMarket = async (pkgName: string) => {
    try {
      await AdControl.openAppMarket({ pkgName });
    } catch (e) {
      console.warn('原生调起应用详情失败，尝试降级跳转', e);
      try {
        window.location.href = `market://details?id=${pkgName}`;
      } catch (err) {
        console.error('跳转应用市场失败', err);
      }
    }
  };

  // 拦截系统返回键：若编辑资料弹窗打开，则只关闭弹窗，不跳转页面
  useEffect(() => {
    const handleModalBack = (e: Event) => {
      const customEvent = e as CustomEvent<{ handled: boolean }>;
      if (isProfileEditorOpen) {
        setIsProfileEditorOpen(false);
        setDraftProfile(null);
        if (customEvent.detail) {
          customEvent.detail.handled = true;
        }
      }
    };
    window.addEventListener('chmath:modal-back', handleModalBack);
    return () => window.removeEventListener('chmath:modal-back', handleModalBack);
  }, [isProfileEditorOpen]);

  const openProfileEditor = () => {
    if (!profile) return;
    setDraftProfile({ ...profile });
    setIsProfileEditorOpen(true);
  };

  const closeProfileEditor = () => {
    setIsProfileEditorOpen(false);
    setDraftProfile(null);
  };

  const handleSaveProfile = () => {
    if (!draftProfile) return;
    const displayName = draftProfile.displayName.trim();
    if (!displayName) {
      setProfileMessage('昵称不能为空');
      return;
    }

    const nextProfile: LocalProfile = {
      ...draftProfile,
      displayName,
    };

    GameStorage.setLocalProfile(nextProfile);
    setProfile(nextProfile);
    closeProfileEditor();
    setProfileMessage('资料已保存');
  };

  useEffect(() => {
    if (!profileMessage) return;
    const timer = window.setTimeout(() => setProfileMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [profileMessage]);

  const avatarSeed = profile?.avatarSeed ?? '🐼';
  const displayName = profile?.displayName ?? '学习伙伴';


  // 精选 8 款互补应用推荐（真实高清应用图标）
  const RECOMMENDED_APPS = [
    {
      id: 'toolbox',
      name: '一个工具箱',
      category: '系统工具',
      desc: '400+ 实用黑科技日常与学习百宝箱',
      pkg: 'com.toolbox.onea',
      iconUrl: '/assets/recommended-apps/toolbox.png',
    },
    {
      id: 'supercal',
      name: '精准函数计算',
      category: '科学教育',
      desc: '高阶函数/微积分/几何数理深度互补神器',
      pkg: 'com.tsto.supercal',
      iconUrl: '/assets/recommended-apps/supercal.png',
    },
    {
      id: 'jizhangriji',
      name: '记账日记',
      category: '财务记账',
      desc: '极简日常收支流水，算完就随手记',
      pkg: 'com.novcat.liferecorder',
      iconUrl: '/assets/recommended-apps/liferecorder.png',
    },
    {
      id: 'lightfasting',
      name: '轻松轻断食',
      category: '健康健美',
      desc: '科学饮食节奏，轻盈生活健康管家',
      pkg: 'com.lightfasting.light_fasting_52',
      iconUrl: '/assets/recommended-apps/lightfasting.png',
    },
    {
      id: 'borcal',
      name: '多彩计算器',
      category: '生活实用',
      desc: '个性化潮流复古皮肤，极简日常算术',
      pkg: 'com.borcal.app',
      iconUrl: '/assets/recommended-apps/borcal.png',
    },
    {
      id: 'lifelist',
      name: '人生清单',
      category: '习惯效率',
      desc: '记录100个愿望与成长足迹，生活更有盼头',
      pkg: 'com.life.list',
      iconUrl: '/assets/recommended-apps/lifelist.png',
    },
    {
      id: 'lockjishiqi',
      name: '专注倒数',
      category: '时间管理',
      desc: '纪念倒数日与沉浸番茄钟，目标规划必备',
      pkg: 'com.lock.daysmatter',
      iconUrl: '/assets/recommended-apps/daysmatter.png',
    },
    {
      id: 'milkteanote',
      name: '小鹿喝水',
      category: '健康生活',
      desc: '趣味定时饮水提醒与身体补水追踪',
      pkg: 'com.lucky.watera',
      iconUrl: '/assets/recommended-apps/watera.png',
    },
  ];

  return (
    <div className="mine-page h-screen w-full flex flex-col overflow-hidden text-[#4B454E] bg-gradient-to-b from-[#E8F6F1] via-[#F1EEFA] to-[#FCE7F3] relative">
      {/* 顶部轻量提示 */}
      {profileMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[80] bg-slate-800/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all">
          {profileMessage}
        </div>
      )}

      <main
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto mine-hide-scrollbar relative z-10"
      >
        <div className="relative z-10 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-28 flex flex-col max-w-md mx-auto w-full">
          
          {/* 统一页面顶部标题栏：左侧「我的」，右侧纯图标「设置」按钮 */}
          <header className="mb-3.5 flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight text-[#4B454E]">我的</h1>
            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              aria-label="设置"
              className="p-2 text-[#64748B] active:text-[#334155] active:scale-90 transition-all cursor-pointer"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </header>

          {/* 1. 个人信息卡片（仅保留头像、昵称与编辑） */}
          <div
            onClick={openProfileEditor}
            className="bg-white w-full rounded-[24px] p-4 flex items-center justify-between mine-card-interactive border border-slate-100/90 mb-3.5 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-2xl select-none">
                {avatarSeed.startsWith('kid-') ? '🐼' : avatarSeed}
              </div>
              <span className="text-base font-black text-slate-800 leading-snug">
                {displayName}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openProfileEditor();
              }}
              className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full hover:bg-indigo-100 active:scale-95 transition-all shrink-0 cursor-pointer border border-indigo-100/80"
            >
              编辑
            </button>
          </div>

          {/* 2. 心愿存钱罐（独占一行大卡片、适度高度、少字、无 >） */}
          <div
            onClick={() => handleNavigate('/savings')}
            className="w-full bg-white rounded-[24px] p-4 mine-card-interactive border border-slate-100/90 mb-3.5 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base font-black text-slate-800 leading-tight">
                    心愿存钱罐
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate mt-1">
                    {activeGoals.length > 0
                      ? `${activeGoals[0].name} · 达成 ${progressPercent}%`
                      : '记录小愿望，攒下大梦想'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {totalSaved > 0 ? (
                  <span className="text-xs font-black text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100/80">
                    已攒 {formatCurrency(totalSaved)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100/80">
                    开启存钱
                  </span>
                )}
              </div>
            </div>

            {/* 当存在有效目标且有目标金额时，展示超精细的迷你进度条 */}
            {activeGoals.length > 0 && totalTarget > 0 && (
              <div className="w-full bg-pink-50 h-1.5 rounded-full mt-3 overflow-hidden border border-pink-100/50">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(progressPercent, 4))}%` }}
                />
              </div>
            )}
          </div>

          {/* 3. 第二行：学习报告 & 计算历史（并排一行大卡片、适度高度、少字、无 >） */}
          <div className="grid grid-cols-2 gap-3 mb-3.5">
            {/* 学习报告 */}
            <div
              onClick={() => handleNavigate('/report')}
              className="bg-white rounded-[22px] p-3.5 mine-card-interactive border border-slate-100/90 flex flex-col justify-between text-left cursor-pointer min-h-[110px]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 leading-tight">
                  学习报告
                </h3>
                <p className="text-xs font-bold text-sky-600 mt-1 truncate">
                  {studyDays > 0 ? `已坚持 ${studyDays} 天` : '查看分析'}
                </p>
              </div>
            </div>

            {/* 计算历史 */}
            <div
              onClick={() => handleNavigate('/calc-history')}
              className="bg-white rounded-[22px] p-3.5 mine-card-interactive border border-slate-100/90 flex flex-col justify-between text-left cursor-pointer min-h-[110px]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-sm">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 leading-tight">
                  计算历史
                </h3>
                <p className="text-xs font-bold text-emerald-600 mt-1 truncate">
                  {calcCount > 0 ? `已记录 ${calcCount} 条` : '近期算式记录'}
                </p>
              </div>
            </div>
          </div>

          {/* 4. 精选应用推荐（华为应用市场极简风格，带立体的阴影） */}
          <div className="flex flex-col gap-2.5 mb-2">
            {/* 专区标题栏 */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">精选应用推荐</h2>
              <span className="text-xs font-medium text-slate-400">8款精选</span>
            </div>

            {/* 华为应用市场风格推荐列表 */}
            <div className="bg-white rounded-[24px] p-2 mine-card-shadow border border-slate-100/90">
              {RECOMMENDED_APPS.map((app, index) => (
                <div
                  key={app.id}
                  onClick={() => handleOpenMarket(app.pkg)}
                  className={`flex items-center justify-between py-3 px-2 hover:bg-slate-50/80 active:bg-slate-100/70 active:scale-[0.985] rounded-2xl transition-all cursor-pointer group select-none ${
                    index !== RECOMMENDED_APPS.length - 1 ? 'border-b border-slate-100/80' : ''
                  }`}
                >
                  {/* 左侧应用大图标与两/三行极简信息 */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-[56px] h-[56px] rounded-[16px] object-cover shadow-[0_2px_8px_rgba(0,0,0,0.08)] shrink-0 group-active:scale-95 transition-transform bg-slate-50"
                    />
                    <div className="flex flex-col min-w-0 justify-center">
                      {/* 第 1 行：应用名 */}
                      <span className="text-[16px] font-bold text-slate-800 truncate leading-tight">
                        {app.name}
                      </span>

                      {/* 第 2 行：分类（华为风浅灰色小字） */}
                      <div className="flex items-center mt-1">
                        <span className="text-[12px] text-slate-400 font-normal leading-tight">
                          {app.category}
                        </span>
                      </div>

                      {/* 第 3 行：一句话极简描述 */}
                      <p className="text-[12px] text-slate-400 font-normal truncate mt-0.5 leading-tight">
                        {app.desc}
                      </p>
                    </div>
                  </div>

                  {/* 右侧华为应用市场同款「查看」胶囊按钮 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMarket(app.pkg);
                    }}
                    className="shrink-0 px-5 py-1.5 bg-[#F2F3F5] text-[#0A59F7] active:bg-[#E4E7EB] active:scale-95 rounded-full text-[13px] font-bold transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    查看
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <MainTabBar />

      {/* 5. 资料编辑弹窗 */}
      {isProfileEditorOpen && draftProfile && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={closeProfileEditor}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-800 mb-4 text-center">
              编辑个人资料
            </h2>

            {/* 当前选中头像预览 */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-4xl shadow-inner select-none">
                {draftProfile.avatarSeed.startsWith('kid-') ? '🐼' : draftProfile.avatarSeed}
              </div>
              <button
                type="button"
                onClick={() => setDraftProfile({ ...draftProfile, avatarSeed: getRandomAvatar() })}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
              >
                随机换一个
              </button>
            </div>

            {/* 快速挑选头像 Emoji */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-400 mb-2 block">挑选喜欢的萌宠头像</span>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 rounded-2xl bg-slate-50">
                {AVATAR_EMOJIS.map((emoji) => {
                  const isSelected = draftProfile.avatarSeed === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setDraftProfile({ ...draftProfile, avatarSeed: emoji })}
                      className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        isSelected
                          ? 'bg-white shadow-md border-2 border-indigo-500 scale-105'
                          : 'hover:bg-white/80 active:scale-95'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 昵称输入 */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-400 mb-1 block">小朋友昵称</span>
              <input
                type="text"
                maxLength={12}
                value={draftProfile.displayName}
                onChange={(e) => setDraftProfile({ ...draftProfile, displayName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
                placeholder="请输入昵称"
              />
            </div>

            {/* 底部操作按钮 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeProfileEditor}
                className="h-11 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="h-11 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
