// 底部导航栏 Tab 自定义配置中心
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface TabPageOption {
  key: string;
  name: string;        // 完整功能名称，如 "基础计算器"
  defaultTitle: string; // 默认 Tab 短标题，如 "基础"
  defaultIcon: string;  // 默认图标 key
  route: string;       // 路由路径
  desc: string;        // 简短描述
}

export interface TabItemConfig {
  id: string;          // 'tab_1' | 'tab_2' | 'tab_3'
  pageKey: string;     // 关联的页面 key
  title: string;       // 自定义显示的标题
  iconKey: string;     // 自定义的图标 key
}

// 可选绑定的功能池（除了固定在后两位的“功能”和“我的”）
export const AVAILABLE_TAB_PAGES: TabPageOption[] = [
  { key: 'basic', name: '基础计算器', defaultTitle: '基础', defaultIcon: 'calc', route: '/calculator', desc: '极简大屏日常标准加减乘除' },
  { key: 'scientific', name: '科学计算器', defaultTitle: '科学', defaultIcon: 'flask', route: '/scientific', desc: '三角函数、对数、高阶公式' },
  { key: 'fraction', name: '分数计算器', defaultTitle: '分数', defaultIcon: 'divide', route: '/fraction', desc: '真假分数、带分数与约分通分' },
  { key: 'savings', name: '心愿存钱罐', defaultTitle: '存钱', defaultIcon: 'gift', route: '/savings', desc: '真实零钱存入与心愿达成记录' },
  { key: 'practice', name: '口算挑战', defaultTitle: '挑战', defaultIcon: 'zap', route: '/practice', desc: '计时速算挑战与每日练习打卡' },
  { key: 'calc_history', name: '计算历史', defaultTitle: '历史', defaultIcon: 'history', route: '/calc-history', desc: '近百条计算算式与结果归档' },
  { key: 'report', name: '学习报告', defaultTitle: '报告', defaultIcon: 'chart', route: '/report', desc: '打卡天数与做题成长分析' },
  { key: 'unit', name: '单位换算', defaultTitle: '换算', defaultIcon: 'ruler', route: '/unit-converter', desc: '长度、重量、面积等单位转换' },
  { key: 'currency', name: '汇率换算', defaultTitle: '汇率', defaultIcon: 'coins', route: '/currency-converter', desc: '全球主流货币实时极速折算' },
  { key: 'mortgage', name: '房贷计算', defaultTitle: '房贷', defaultIcon: 'home', route: '/mortgage-calculator', desc: '等额本息/本金还款测算' },
  { key: 'game24', name: '24点速算', defaultTitle: '24点', defaultIcon: 'trophy', route: '/game-24', desc: '益智经典四则运算挑战' },
  { key: 'game2048', name: '数字2048', defaultTitle: '2048', defaultIcon: 'gamepad', route: '/game-2048', desc: '休闲指尖方块合并益智游戏' },
];

// 可选图标列表
export const AVAILABLE_TAB_ICONS: Array<{ key: string; name: string }> = [
  { key: 'calc', name: '计算器' },
  { key: 'flask', name: '科学实验' },
  { key: 'divide', name: '分数积木' },
  { key: 'gift', name: '心愿存钱' },
  { key: 'zap', name: '速算闪电' },
  { key: 'history', name: '历史时钟' },
  { key: 'chart', name: '统计图表' },
  { key: 'coins', name: '金币资产' },
  { key: 'trophy', name: '荣誉奖杯' },
  { key: 'ruler', name: '测量标尺' },
  { key: 'star', name: '精选星标' },
  { key: 'book', name: '学习书本' },
  { key: 'home', name: '房产资产' },
  { key: 'gamepad', name: '游戏手柄' },
  { key: 'heart', name: '心愿爱心' },
  { key: 'flame', name: '每日坚持' },
];

export const DEFAULT_TABS: TabItemConfig[] = [
  { id: 'tab_1', pageKey: 'basic', title: '基础', iconKey: 'calc' },
  { id: 'tab_2', pageKey: 'scientific', title: '科学', iconKey: 'flask' },
  { id: 'tab_3', pageKey: 'fraction', title: '分数', iconKey: 'divide' },
];

export interface TabPreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  tabs: TabItemConfig[];
}

export const TAB_PRESETS: TabPreset[] = [
  {
    id: 'default',
    name: '经典默认',
    badge: '默认',
    desc: '基础 · 科学 · 分数',
    tabs: [
      { id: 'tab_1', pageKey: 'basic', title: '基础', iconKey: 'calc' },
      { id: 'tab_2', pageKey: 'scientific', title: '科学', iconKey: 'flask' },
      { id: 'tab_3', pageKey: 'fraction', title: '分数', iconKey: 'divide' },
    ],
  },
  {
    id: 'savings',
    name: '日常存钱',
    badge: '常用',
    desc: '基础 · 存钱 · 历史',
    tabs: [
      { id: 'tab_1', pageKey: 'basic', title: '基础', iconKey: 'calc' },
      { id: 'tab_2', pageKey: 'savings', title: '存钱', iconKey: 'gift' },
      { id: 'tab_3', pageKey: 'calc_history', title: '历史', iconKey: 'history' },
    ],
  },
  {
    id: 'student',
    name: '学生备战',
    badge: '学习',
    desc: '科学 · 分数 · 报告',
    tabs: [
      { id: 'tab_1', pageKey: 'scientific', title: '科学', iconKey: 'flask' },
      { id: 'tab_2', pageKey: 'fraction', title: '分数', iconKey: 'divide' },
      { id: 'tab_3', pageKey: 'report', title: '报告', iconKey: 'chart' },
    ],
  },
  {
    id: 'family',
    name: '亲子益智',
    badge: '启蒙',
    desc: '口算 · 24点 · 报告',
    tabs: [
      { id: 'tab_1', pageKey: 'practice', title: '口算', iconKey: 'zap' },
      { id: 'tab_2', pageKey: 'game24', title: '24点', iconKey: 'trophy' },
      { id: 'tab_3', pageKey: 'report', title: '报告', iconKey: 'chart' },
    ],
  },
  {
    id: 'wealth',
    name: '买房理财',
    badge: '实用',
    desc: '房贷 · 汇率 · 换算',
    tabs: [
      { id: 'tab_1', pageKey: 'mortgage', title: '房贷', iconKey: 'home' },
      { id: 'tab_2', pageKey: 'currency', title: '汇率', iconKey: 'coins' },
      { id: 'tab_3', pageKey: 'unit', title: '换算', iconKey: 'ruler' },
    ],
  },
  {
    id: 'life',
    name: '生活便民',
    badge: '效率',
    desc: '基础 · 换算 · 汇率',
    tabs: [
      { id: 'tab_1', pageKey: 'basic', title: '基础', iconKey: 'calc' },
      { id: 'tab_2', pageKey: 'unit', title: '换算', iconKey: 'ruler' },
      { id: 'tab_3', pageKey: 'currency', title: '汇率', iconKey: 'coins' },
    ],
  },
];

const STORAGE_KEY = 'chmath_custom_tabs_v1';
const UPDATE_EVENT = 'chmath:tabs-updated';

export class TabConfigManager {
  static getTabs(): TabItemConfig[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_TABS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 3) {
        // 校验有效性
        return parsed.map((item, idx) => {
          const fallback = DEFAULT_TABS[idx];
          const pageExists = AVAILABLE_TAB_PAGES.some((p) => p.key === item.pageKey);
          return {
            id: item.id || fallback.id,
            pageKey: pageExists ? item.pageKey : fallback.pageKey,
            title: typeof item.title === 'string' && item.title.trim() ? item.title.trim().slice(0, 5) : fallback.title,
            iconKey: item.iconKey || fallback.iconKey,
          };
        });
      }
      return DEFAULT_TABS;
    } catch (e) {
      console.warn('[TabConfigManager] 读取自定义 Tab 配置失败:', e);
      return DEFAULT_TABS;
    }
  }

  static saveTabs(tabs: TabItemConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UPDATE_EVENT));
      }
    } catch (e) {
      console.error('[TabConfigManager] 保存自定义 Tab 配置失败:', e);
    }
  }

  static resetTabs(): TabItemConfig[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UPDATE_EVENT));
      }
    } catch (e) {
      console.error('[TabConfigManager] 重置自定义 Tab 配置失败:', e);
    }
    return DEFAULT_TABS;
  }
}

// React 自定义 Hook，用于实时响应 Tab 变动
export function useCustomTabs(): TabItemConfig[] {
  const [tabs, setTabs] = useState<TabItemConfig[]>(() => TabConfigManager.getTabs());

  useEffect(() => {
    const handleUpdate = () => {
      setTabs(TabConfigManager.getTabs());
    };
    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return tabs;
}

// 检查某个路由是否作为当前底部 Tab 之一展示（如果在二级入口跳转进入，则不作为一级 Tab）
export function useIsCurrentTab(route: string): boolean {
  const tabs = useCustomTabs();
  const location = useLocation();

  const state = location.state as { fromFeature?: boolean; fromSubpage?: boolean; isSecondary?: boolean } | null;
  if (state?.fromFeature || state?.fromSubpage || state?.isSecondary) {
    return false;
  }

  return tabs.some((t) => {
    const page = AVAILABLE_TAB_PAGES.find((p) => p.key === t.pageKey);
    return page?.route === route;
  });
}
