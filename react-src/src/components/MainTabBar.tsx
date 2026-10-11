import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomTabs, AVAILABLE_TAB_PAGES } from '@/lib/tabConfig';
import TabIconRenderer from '@/components/TabIconRenderer';
import '../styles/calculator-page.css';

type MainTabBarProps = {
  variant?: 'fixed' | 'inline';
};

const MainTabBar: React.FC<MainTabBarProps> = ({ variant = 'fixed' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const customTabs = useCustomTabs();

  // 判断是否处于某个前置自定义 Tab
  const activeCustomIndex = customTabs.findIndex((t) => {
    const page = AVAILABLE_TAB_PAGES.find((p) => p.key === t.pageKey);
    if (!page) return false;
    if (page.route === '/calculator') {
      return pathname === '/' || pathname === '/calculator' || pathname === '/home';
    }
    return pathname.startsWith(page.route);
  });

  const isAnyCustomActive = activeCustomIndex !== -1;

  // 固定 Tab 4: 功能（当未被前置 Tab 命中时激活）
  const isLearn =
    !isAnyCustomActive &&
    (pathname.startsWith('/learn') ||
      pathname.startsWith('/practice') ||
      pathname.startsWith('/game') ||
      pathname.startsWith('/visual-math') ||
      pathname.startsWith('/time-master') ||
      pathname.startsWith('/money-cashier'));

  // 固定 Tab 5: 我的（当未被前置 Tab 命中时激活）
  const isMine =
    !isAnyCustomActive &&
    (pathname.startsWith('/my') ||
      pathname.startsWith('/growth') ||
      pathname.startsWith('/report') ||
      pathname.startsWith('/shop') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/tab-customize') ||
      pathname.startsWith('/voice-select') ||
      pathname.startsWith('/parent-dashboard') ||
      pathname.startsWith('/privacy-policy') ||
      pathname.startsWith('/children-privacy') ||
      pathname.startsWith('/user-agreement') ||
      pathname === '/about' ||
      pathname === '/contact');

  const nav = (
    <nav className="tab-bar">
      {/* 1 ~ 3. 前三项可定制 Tab */}
      {customTabs.map((t, idx) => {
        const pageDef = AVAILABLE_TAB_PAGES.find((p) => p.key === t.pageKey) || AVAILABLE_TAB_PAGES[idx];
        const isActive = activeCustomIndex === idx;
        const displayTitle = t.title || pageDef.defaultTitle;
        const displayIcon = t.iconKey || pageDef.defaultIcon;

        return (
          <button
            key={t.id || `custom_tab_${idx}`}
            type="button"
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (pageDef.route === '/calculator' || pageDef.route === '/scientific' || pageDef.route === '/fraction') {
                localStorage.setItem('last_calc_mode', pageDef.route);
              }
              navigate(pageDef.route, { state: {} });
            }}
          >
            <TabIconRenderer iconKey={displayIcon} size={22} />
            <div className="tab-label">{displayTitle}</div>
          </button>
        );
      })}

      {/* 4. 系统固定 Tab：功能 */}
      <button
        type="button"
        className={`tab-item ${isLearn ? 'active' : ''}`}
        onClick={() => {
          navigate('/learn', { state: {} });
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm0 9.72L5.98 9.5 12 6.28 18.02 9.5 12 12.72zM6 13.3V17c0 2.2 2.69 4 6 4s6-1.8 6-4v-3.7l-6 3.27L6 13.3z" />
        </svg>
        <div className="tab-label">功能</div>
      </button>

      {/* 5. 系统固定 Tab：我的 */}
      <button
        type="button"
        className={`tab-item ${isMine ? 'active' : ''}`}
        onClick={() => {
          navigate('/my', { state: {} });
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <div className="tab-label">我的</div>
      </button>
    </nav>
  );

  if (variant === 'inline') {
    return nav;
  }

  return <div className="main-tabbar-shell">{nav}</div>;
};

export default MainTabBar;
