import React from 'react';
import { useNavigate } from 'react-router-dom';

export type CalcMode = 'standard' | 'scientific' | 'fraction';

interface CalcModeSwitcherProps {
  currentMode: CalcMode;
}

export default function CalcModeSwitcher({ currentMode }: CalcModeSwitcherProps) {
  const navigate = useNavigate();

  const MODES: { id: CalcMode; label: string; path: string }[] = [
    { id: 'standard', label: '基础', path: '/calculator' },
    { id: 'scientific', label: '科学', path: '/scientific' },
    { id: 'fraction', label: '分数', path: '/fraction' },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-2 w-full max-w-md mx-auto select-none">
      <div className="flex bg-slate-200/80 p-0.5 rounded-2xl backdrop-blur-xs border border-white/60 shadow-xs">
        {MODES.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                if (!isActive) {
                  navigate(m.path, { replace: true });
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate('/learn')}
        className="text-[11px] font-black text-slate-500 hover:text-indigo-600 flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
      >
        更多工具 &gt;
      </button>
    </div>
  );
}
