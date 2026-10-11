import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TabConfigManager,
  useCustomTabs,
  AVAILABLE_TAB_PAGES,
  AVAILABLE_TAB_ICONS,
  TAB_PRESETS,
  type TabItemConfig,
  type TabPageOption,
  type TabPreset,
} from '@/lib/tabConfig';
import AppPageHeader from '@/components/AppPageHeader';
import TabIconRenderer from '@/components/TabIconRenderer';
import { Sliders, Check, X, Lock } from 'lucide-react';
import '@/styles/settings-page.css';

export default function TabCustomize() {
  const navigate = useNavigate();
  const customTabs = useCustomTabs();

  // 当前正在编辑的 Tab 索引（0 | 1 | 2，null 为未打开）
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 编辑弹窗中的草稿状态
  const [draftPageKey, setDraftPageKey] = useState<string>('basic');
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftIconKey, setDraftIconKey] = useState<string>('calc');

  // 提示消息
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // 打开编辑面板
  const handleOpenEdit = (index: number) => {
    const tab = customTabs[index];
    const page = AVAILABLE_TAB_PAGES.find((p) => p.key === tab.pageKey) || AVAILABLE_TAB_PAGES[0];
    setDraftPageKey(tab.pageKey);
    setDraftTitle(tab.title || page.defaultTitle);
    setDraftIconKey(tab.iconKey || page.defaultIcon);
    setEditingIndex(index);
  };

  // 切换选择功能时，自动建议该功能的默认名称与图标
  const handleSelectPage = (page: TabPageOption) => {
    setDraftPageKey(page.key);
    setDraftTitle(page.defaultTitle);
    setDraftIconKey(page.defaultIcon);
  };

  // 保存当前 Tab 编辑
  const handleSaveTab = () => {
    if (editingIndex === null) return;
    const cleanTitle = draftTitle.trim().slice(0, 4) || '导航';
    const updated = [...customTabs];
    updated[editingIndex] = {
      ...updated[editingIndex],
      pageKey: draftPageKey,
      title: cleanTitle,
      iconKey: draftIconKey,
    };
    TabConfigManager.saveTabs(updated);
    setEditingIndex(null);
    showToast(`第 ${editingIndex + 1} 个 Tab 已成功更新`);
  };

  // 恢复出厂默认
  // 触发预览卡片弹跳动效的临时状态
  const [popKey, setPopKey] = useState<number>(0);

  // 一键应用场景推荐模版
  const handleApplyPreset = (preset: TabPreset) => {
    TabConfigManager.saveTabs(preset.tabs);
    setPopKey((prev) => prev + 1);
    showToast(`已切换为「${preset.name}」`);
  };

  return (
    <div className="tab-customize-page bg-gradient-to-b from-[#E8F6F1] via-[#F3E8F5] to-[#FCE7F3] min-h-screen w-full flex flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] text-[#4B454E] relative">
      {/* 顶部 Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[90] bg-slate-800/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-in fade-in zoom-in">
          {toastMessage}
        </div>
      )}

      {/* 顶部导航标题 */}
      <AppPageHeader
        title="底栏导航定制"
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-col gap-4 w-full max-w-md mx-auto pb-12">
        {/* 实时底栏预览 */}
        <div className="flex flex-col gap-1.5 animate-subtle-spring">
          <span className="text-xs font-black text-slate-500 ml-1">底栏预览</span>
          <div
            key={popKey}
            className={`bg-white rounded-[24px] p-3 shadow-md border border-slate-100 flex items-center justify-around transition-all ${
              popKey > 0 ? 'animate-spring-pop ring-2 ring-indigo-200/60' : ''
            }`}
          >
            {customTabs.map((t, idx) => {
              const page = AVAILABLE_TAB_PAGES.find((p) => p.key === t.pageKey) || AVAILABLE_TAB_PAGES[idx];
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1 py-1">
                  <div className="text-blue-600">
                    <TabIconRenderer iconKey={t.iconKey || page.defaultIcon} size={22} />
                  </div>
                  <span className="text-[11px] font-black text-slate-800">{t.title || page.defaultTitle}</span>
                </div>
              );
            })}
            {/* 功能 (固定) */}
            <div className="flex flex-col items-center gap-1 flex-1 py-1 opacity-70">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-slate-600">
                <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm0 9.72L5.98 9.5 12 6.28 18.02 9.5 12 12.72zM6 13.3V17c0 2.2 2.69 4 6 4s6-1.8 6-4v-3.7l-6 3.27L6 13.3z" />
              </svg>
              <span className="text-[11px] font-bold text-slate-600">功能</span>
            </div>
            {/* 我的 (固定) */}
            <div className="flex flex-col items-center gap-1 flex-1 py-1 opacity-70">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-slate-600">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-[11px] font-bold text-slate-600">我的</span>
            </div>
          </div>
        </div>

        {/* 快捷推荐模版区 */}
        <div className="flex flex-col gap-2 animate-subtle-spring anim-delay-1">
          <span className="text-xs font-black text-slate-500 ml-1">场景模板</span>

          <div className="grid grid-cols-2 gap-2.5">
            {TAB_PRESETS.map((preset) => {
              // 检查当前是否完全匹配该模版
              const isMatch = preset.tabs.every((pt, idx) => customTabs[idx]?.pageKey === pt.pageKey);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`bg-white rounded-[20px] p-3 text-left border transition-all active:scale-[0.96] cursor-pointer flex flex-col justify-between ${
                    isMatch
                      ? 'border-indigo-400 ring-2 ring-indigo-200/70 shadow-sm bg-indigo-50/20'
                      : 'border-slate-100 hover:border-indigo-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-slate-800">{preset.name}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isMatch
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isMatch ? '生效中' : preset.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2.5">
                    {preset.tabs.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md"
                      >
                        {t.title}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 个可定制项列表 */}
        <div className="flex flex-col gap-3 animate-subtle-spring anim-delay-2">
          <span className="text-xs font-black text-slate-500 ml-1">自定义导航</span>

          {customTabs.map((tab, index) => {
            const page = AVAILABLE_TAB_PAGES.find((p) => p.key === tab.pageKey) || AVAILABLE_TAB_PAGES[index];
            const title = tab.title || page.defaultTitle;
            const iconKey = tab.iconKey || page.defaultIcon;

            return (
              <div
                key={tab.id || index}
                className="bg-white rounded-[24px] p-4 flex items-center justify-between border border-slate-100 shadow-sm active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                    <TabIconRenderer iconKey={iconKey} size={24} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-800 truncate">{title}</span>
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/60">
                        位置 {index + 1}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium truncate mt-0.5">
                      {page.desc}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(index)}
                  className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  调整
                </button>
              </div>
            );
          })}
        </div>

        {/* 2 个固定项列表 */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-black text-slate-500 ml-1">固定导航</span>

          <div className="bg-slate-100/70 rounded-[20px] p-3.5 flex items-center justify-between border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm0 9.72L5.98 9.5 12 6.28 18.02 9.5 12 12.72zM6 13.3V17c0 2.2 2.69 4 6 4s6-1.8 6-4v-3.7l-6 3.27L6 13.3z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">功能</span>
                <span className="text-xs text-slate-400">全部功能与计算器</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-slate-200/80 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              固定
            </span>
          </div>

          <div className="bg-slate-100/70 rounded-[20px] p-3.5 flex items-center justify-between border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">我的</span>
                <span className="text-xs text-slate-400">个人中心与设置</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-slate-200/80 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              固定
            </span>
          </div>
        </div>
      </div>

      {/* 调整 Tab 模态弹窗 */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col p-6 shadow-2xl animate-in slide-in-from-bottom">
            {/* 弹窗顶部 */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800">
                  定制位置 {editingIndex + 1} 导航项
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 滚动配置区域 */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-5 no-scrollbar">
              {/* 1. 绑定功能 */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2">
                  1. 选择绑定的功能页面
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TAB_PAGES.map((page) => {
                    const isSelected = draftPageKey === page.key;
                    return (
                      <button
                        key={page.key}
                        type="button"
                        onClick={() => handleSelectPage(page)}
                        className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-black ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {page.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{page.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. 修改 Tab 名字 */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2">
                  2. 自定义 Tab 标题（限 1~4 字）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="输入 Tab 名称..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const p = AVAILABLE_TAB_PAGES.find((item) => item.key === draftPageKey);
                      if (p) setDraftTitle(p.defaultTitle);
                    }}
                    className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    重置默认
                  </button>
                </div>
              </div>

              {/* 3. 挑选 Tab 图标 */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2">
                  3. 挑选 Tab 图标
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {AVAILABLE_TAB_ICONS.map((icon) => {
                    const isSelected = draftIconKey === icon.key;
                    return (
                      <button
                        key={icon.key}
                        type="button"
                        onClick={() => setDraftIconKey(icon.key)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100/60'
                        }`}
                      >
                        <TabIconRenderer iconKey={icon.key} size={22} />
                        <span className="text-[10px] font-bold">{icon.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 弹窗底部操作 */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-full text-sm active:scale-95 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveTab}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-full text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                保存生效
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
