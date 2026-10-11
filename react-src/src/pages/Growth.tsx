import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/growth-page.css';
import GameStorage, { type LocalProfile, type PlayerStats } from '@/lib/gameStorage';
import MainTabBar from '@/components/MainTabBar';

export default function Growth() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);

  useEffect(() => {
    try {
      const stats = GameStorage.getPlayerStats();
      const profile = GameStorage.getOrCreateLocalProfile();
      setPlayerStats(stats);
      setLocalProfile(profile);
    } catch (e) {
      console.error('加载玩家统计失败', e);
    }
  }, []);

  return (
    <div className="growth-page h-screen w-full flex flex-col overflow-hidden text-slate-700 bg-white">
      <main className="flex-1 overflow-y-auto growth-hide-scrollbar relative z-10">
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-teal-50 via-green-50 to-purple-50 pointer-events-none" />

        <div className="relative z-10 px-6 pt-6 pb-24 flex flex-col min-h-full max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate('/my')}
              className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden flex-shrink-0"
              aria-label="头像"
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(localProfile?.avatarSeed ?? 'Felix')}`}
                alt={localProfile?.displayName ?? 'Avatar'}
                className="w-full h-full"
              />
            </button>

            <h1 className="flex-1 text-3xl font-black text-slate-800 tracking-tight truncate min-w-0">成长中心</h1>

            <div className="flex gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-yellow-100">
                <svg className="w-5 h-5 text-yellow-400 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" className="text-yellow-400" />
                  <path
                    d="M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"
                    className="text-yellow-500 opacity-50"
                  />
                  <text
                    x="12"
                    y="16"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                    fill="white"
                  >
                    $
                  </text>
                </svg>
                <span className="font-black text-slate-700 text-sm">
                  {playerStats?.totalCoins ?? 0}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-violet-100">
                <svg className="w-5 h-5 text-violet-500 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.83 5.74 6.34.92-4.59 4.47 1.08 6.32L12 16.96 6.34 19.45l1.08-6.32L2.83 8.66l6.34-.92L12 2z" />
                </svg>
                <span className="font-black text-slate-700 text-sm">{playerStats?.totalStars ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="text-left mb-8">
            <div className="space-y-1">
              <p className="text-slate-500 text-sm font-bold">
                看看最近学得怎么样，金币都用到哪里啦
              </p>
              <p className="text-slate-400 text-xs font-bold">
                报告、目标和商城都在这里，方便家长一起看
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-8">
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="bg-white rounded-[32px] p-6 flex flex-col items-center text-center growth-card-shadow cursor-pointer relative group overflow-hidden"
            >
              <div className="w-20 h-20 mb-3 relative transform group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <rect x="10" y="70" width="80" height="2" rx="1" fill="#E2E8F0" />
                  <rect x="20" y="45" width="15" height="25" rx="3" fill="#60A5FA" />
                  <rect x="42" y="30" width="15" height="40" rx="3" fill="#34D399" />
                  <rect x="64" y="15" width="15" height="55" rx="3" fill="#818CF8" />
                  <circle cx="68" cy="25" r="1.5" fill="white" />
                  <circle cx="75" cy="25" r="1.5" fill="white" />
                  <path d="M69 29 Q71.5 31 74 29" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-black text-slate-700 text-base">学习报告</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/savings')}
              className="bg-white rounded-[32px] p-6 flex flex-col items-center text-center growth-card-shadow cursor-pointer relative group overflow-hidden"
            >
              <div className="w-20 h-20 mb-3 relative transform group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <circle cx="50" cy="50" r="35" fill="#FECACA" />
                  <circle cx="50" cy="50" r="25" fill="white" />
                  <circle cx="50" cy="50" r="15" fill="#F87171" />
                  <path d="M80 20 L55 45" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                  <path d="M80 20 L75 20 L80 25 Z" fill="#475569" />
                  <circle cx="46" cy="48" r="1.5" fill="white" />
                  <circle cx="54" cy="48" r="1.5" fill="white" />
                  <path d="M47 53 Q50 55 53 53" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-black text-slate-700 text-base">心愿存钱罐</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="bg-white rounded-[32px] p-6 flex flex-col items-center text-center growth-card-shadow cursor-pointer relative group overflow-hidden"
            >
              <div className="w-20 h-20 mb-3 relative transform group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <path d="M35 30 Q50 10 65 30" stroke="#FBBF24" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M25 30 L75 30 L80 80 L20 80 Z" fill="#FCD34D" />
                  <path d="M25 30 L75 30 L80 80 L20 80 Z" fill="url(#stripe)" fillOpacity="0.2" />
                  <defs>
                    <pattern
                      id="stripe"
                      width="10"
                      height="10"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#F59E0B" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <path d="M80 20 L82 25 L87 25 L83 29 L84 34 L80 31 L76 34 L77 29 L73 25 L78 25 Z" fill="#F472B6" />
                  <circle cx="42" cy="55" r="2.5" fill="#78350F" />
                  <circle cx="58" cy="55" r="2.5" fill="#78350F" />
                  <path d="M48 62 Q50 65 52 62" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="38" cy="58" r="3" fill="#FCA5A5" opacity="0.6" />
                  <circle cx="62" cy="58" r="3" fill="#FCA5A5" opacity="0.6" />
                </svg>
              </div>
              <span className="font-black text-slate-700 text-base">金币商城</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/report-issue')}
              className="bg-white rounded-[32px] p-6 flex flex-col items-center text-center growth-card-shadow cursor-pointer relative group overflow-hidden"
            >
              <div className="w-20 h-20 mb-3 relative transform group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <path d="M20 25 H80 Q90 25 90 35 V65 Q90 75 80 75 H40 L25 85 L25 75 Q10 75 10 65 V35 Q10 25 20 25 Z" fill="#C084FC" />
                  <circle cx="40" cy="50" r="2.5" fill="white" />
                  <circle cx="60" cy="50" r="2.5" fill="white" />
                  <path d="M45 58 Q50 62 55 58" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <g transform="translate(60, 50) rotate(-15)">
                    <rect x="0" y="0" width="8" height="25" fill="#FDE047" rx="1" />
                    <path d="M0 0 L4 -6 L8 0 Z" fill="#F87171" />
                    <path d="M0 25 L4 29 L8 25 Z" fill="#FDE047" />
                    <path d="M4 29 L4 29" stroke="#333" strokeWidth="2" />
                  </g>
                </svg>
              </div>
              <span className="font-black text-slate-700 text-base">问题反馈</span>
            </button>
          </div>
        </div>
      </main>
      <MainTabBar />
    </div>
  );
}
