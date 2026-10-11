import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const tabs = [
  { key: 'home', label: '首页', icon: '🏠', path: '/' },
  { key: 'my', label: '我的', icon: '👤', path: '/my' },
];

const shouldHighlight = (pathname: string, path: string) => {
  if (path === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(path);
};

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-4 px-4 z-40 pointer-events-none">
      <div className="mx-auto max-w-xl md:max-w-2xl pointer-events-auto">
        <div className="rounded-3xl bg-white/85 backdrop-blur border border-white shadow-lg shadow-slate-300/40 px-4 py-2 flex items-center justify-around">
          {tabs.map((tab) => {
            const active = shouldHighlight(location.pathname, tab.path);
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => navigate(tab.path)}
                className={clsx(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all',
                  active
                    ? 'bg-sky-100/80 text-sky-600 shadow-inner shadow-sky-200 border border-sky-200'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
