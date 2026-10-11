import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/shop-page.css';
import GameStorage, { type PlayerStats, type ShopItem } from '@/lib/gameStorage';
import AppPageHeader from '@/components/AppPageHeader';

type CategoryKey = 'all' | 'stationery' | 'skins' | 'toys';
type ProductName = '超级笔记本' | '30分钟游戏券' | '艺术画笔' | '神秘盲盒' | '酷酷墨镜' | '星球贴纸';

const PRODUCT_CATALOG: Record<ProductName, ShopItem & { category: Exclude<CategoryKey, 'all'> }> = {
  '超级笔记本': {
    id: 'notebook-pro',
    name: '超级笔记本',
    description: '限量 100 本',
    icon: '📘',
    price: 500,
    type: 'badge',
    category: 'stationery',
  },
  '30分钟游戏券': {
    id: 'game-ticket-30m',
    name: '30分钟游戏券',
    description: '周末可用',
    icon: '🎮',
    price: 800,
    type: 'title',
    category: 'toys',
  },
  '艺术画笔': {
    id: 'art-brush',
    name: '艺术画笔',
    description: '绘画课专用',
    icon: '🖌️',
    price: 350,
    type: 'badge',
    category: 'stationery',
  },
  '神秘盲盒': {
    id: 'mystery-box',
    name: '神秘盲盒',
    description: '有机会开出大奖',
    icon: '🎁',
    price: 100,
    type: 'title',
    category: 'toys',
  },
  '酷酷墨镜': {
    id: 'cool-glasses',
    name: '酷酷墨镜',
    description: '虚拟形象装扮',
    icon: '🕶️',
    price: 200,
    type: 'skin',
    category: 'skins',
  },
  '星球贴纸': {
    id: 'planet-sticker',
    name: '星球贴纸',
    description: '一套5张',
    icon: '🪐',
    price: 50,
    type: 'badge',
    category: 'skins',
  },
};

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryKey>('all');
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshShopData = () => {
    try {
      const stats = GameStorage.getPlayerStats();
      const bag = GameStorage.getInventory();
      setPlayerStats(stats);
      setInventory(bag);
    } catch (e) {
      console.error('加载玩家统计失败', e);
    }
  };

  useEffect(() => {
    refreshShopData();
  }, []);

  const handleBack = () => {
    navigate('/my');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleFeatureClick = () => {
    setCategory('skins');
    showToast('已切换到「虚拟装扮」');
  };

  const isOwned = (name: ProductName) => inventory.includes(PRODUCT_CATALOG[name].id);

  const canShowCard = (cardCategory: Exclude<CategoryKey, 'all'>) =>
    category === 'all' || category === cardCategory;

  const handleAdd = (name: ProductName) => {
    const item = PRODUCT_CATALOG[name];
    const result = GameStorage.buyItem(item);
    showToast(result.message);
    if (result.success) {
      refreshShopData();
    }
  };

  const renderBuyButton = (name: ProductName) => {
    const owned = isOwned(name);
    return (
      <button
        type="button"
        onClick={() => handleAdd(name)}
        disabled={owned}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          owned
            ? 'bg-emerald-100 text-emerald-500 cursor-not-allowed'
            : 'bg-slate-100 text-slate-400 hover:bg-yellow-400 hover:text-white'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {owned ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          )}
        </svg>
      </button>
    );
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <div className="shop-page h-screen w-full flex flex-col overflow-hidden text-slate-700 bg-white relative">
      {toastMessage && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-black px-4 py-2 rounded-full shadow-lg">
          {toastMessage}
        </div>
      )}
      <main className="flex-1 overflow-y-auto shop-hide-scrollbar relative z-10 pb-28">
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-teal-50 via-blue-50 to-purple-50 pointer-events-none" />
        <div className="absolute inset-0 z-0 shop-bg-pattern opacity-50 pointer-events-none" />

        <div className="relative z-10 px-6 pt-6 flex flex-col min-h-full max-w-md mx-auto w-full">
          <AppPageHeader
            title="金币商城"
            onBack={handleBack}
            className="mb-6"
            titleClassName="text-3xl text-slate-800 tracking-tight"
            rightElement={(
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-yellow-100">
                <svg className="w-5 h-5 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
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
                <span className="font-black text-slate-700 text-base">
                  {playerStats?.totalCoins ?? 0}
                </span>
              </div>
            )}
          />

          <div className="mb-6">
            <p className="text-slate-500 text-sm font-black mt-1">
              努力学习赚金币，换取心仪的礼物吧！
            </p>
          </div>

          <button
            type="button"
            onClick={handleFeatureClick}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-[32px] p-6 mb-8 text-white shop-card-shadow relative overflow-hidden group text-left"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10" />
            <div className="absolute right-10 bottom-0 w-20 h-20 bg-white opacity-10 rounded-full transform translate-y-10" />

            <div className="relative z-10 flex justify-between items-center">
              <div>
                <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block shadow-sm">
                  新品上架
                </span>
                <h2 className="text-2xl font-black mb-1">限量版皮肤</h2>
                <p className="text-purple-100 text-sm mb-4">
                  酷炫宇航员套装等你来拿
                </p>
                <span className="inline-flex items-center justify-center bg-white text-violet-600 px-4 py-2 rounded-xl font-black text-sm shadow-sm">
                  去看看
                </span>
              </div>

              <div className="w-24 h-24 relative transform group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <circle cx="50" cy="50" r="40" fill="#DDD6FE" opacity="0.3" />
                  <path d="M30 35 C30 15, 70 15, 70 35 V50 C70 70, 30 70, 30 50 Z" fill="white" />
                  <circle cx="50" cy="45" r="15" fill="#3B82F6" />
                  <path d="M55 40 Q58 38 60 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                  <rect x="25" y="55" width="50" height="30" rx="10" fill="white" />
                  <rect x="35" y="60" width="30" height="20" rx="5" fill="#E2E8F0" />
                  <circle cx="40" cy="70" r="3" fill="#EF4444" />
                  <circle cx="50" cy="70" r="3" fill="#F59E0B" />
                  <circle cx="60" cy="70" r="3" fill="#10B981" />
                </svg>
              </div>
            </div>
          </button>

          <div className="flex gap-3 overflow-x-auto shop-hide-scrollbar mb-6 pb-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`px-5 py-2 rounded-full font-black text-sm shadow-md whitespace-nowrap ${
                category === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-500 border border-slate-100 shadow-sm'
              }`}
            >
              全部
            </button>
            <button
              type="button"
              onClick={() => setCategory('stationery')}
              className={`px-5 py-2 rounded-full font-black text-sm border border-slate-100 shadow-sm whitespace-nowrap ${
                category === 'stationery' ? 'bg-slate-50 text-slate-600' : 'bg-white text-slate-500'
              }`}
            >
              学习文具
            </button>
            <button
              type="button"
              onClick={() => setCategory('skins')}
              className={`px-5 py-2 rounded-full font-black text-sm border border-slate-100 shadow-sm whitespace-nowrap ${
                category === 'skins' ? 'bg-slate-50 text-slate-600' : 'bg-white text-slate-500'
              }`}
            >
              虚拟装扮
            </button>
            <button
              type="button"
              onClick={() => setCategory('toys')}
              className={`px-5 py-2 rounded-full font-black text-sm border border-slate-100 shadow-sm whitespace-nowrap ${
                category === 'toys' ? 'bg-slate-50 text-slate-600' : 'bg-white text-slate-500'
              }`}
            >
              娱乐玩具
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {canShowCard('stationery') && (
              <div className="bg-white rounded-[32px] p-4 flex flex-col shop-card-shadow relative group">
                <div className="bg-blue-50 rounded-2xl h-32 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-100 opacity-50 rounded-2xl transform rotate-3 scale-110" />
                  <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <rect x="25" y="15" width="50" height="70" rx="4" fill="#60A5FA" />
                    <rect x="25" y="15" width="10" height="70" rx="2" fill="#3B82F6" />
                    <rect x="42" y="30" width="25" height="4" rx="2" fill="white" opacity="0.5" />
                    <rect x="42" y="40" width="25" height="4" rx="2" fill="white" opacity="0.5" />
                    <circle cx="60" cy="70" r="8" fill="#FDE047" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-slate-700">超级笔记本</h3>
                  <p className="text-xs text-slate-400">
                    {isOwned('超级笔记本') ? '已拥有' : PRODUCT_CATALOG['超级笔记本'].description}
                  </p>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <text x="12" y="16" fontSize="10" textAnchor="middle" fontWeight="bold" fill="white">$</text>
                      </svg>
                      <span className="font-black text-lg text-slate-700">{PRODUCT_CATALOG['超级笔记本'].price}</span>
                    </div>
                    {renderBuyButton('超级笔记本')}
                  </div>
                </div>
              </div>
            )}

            {canShowCard('toys') && (
              <div className="bg-white rounded-[32px] p-4 flex flex-col shop-card-shadow relative group">
                <div className="bg-purple-50 rounded-2xl h-32 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-100 opacity-50 rounded-2xl transform -rotate-2 scale-110" />
                  <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <path
                      d="M20 40 C20 20, 40 20, 50 35 C60 20, 80 20, 80 40 V55 C80 70, 65 70, 65 55 L50 65 L35 55 C35 70, 20 70, 20 55 Z"
                      fill="#C084FC"
                    />
                    <circle cx="30" cy="45" r="4" fill="white" opacity="0.8" />
                    <circle cx="70" cy="40" r="3" fill="#FCA5A5" />
                    <circle cx="78" cy="48" r="3" fill="#FCD34D" />
                    <circle cx="62" cy="48" r="3" fill="#60A5FA" />
                    <circle cx="70" cy="56" r="3" fill="#34D399" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-slate-700">30分钟游戏券</h3>
                  <p className="text-xs text-slate-400">
                    {isOwned('30分钟游戏券') ? '已拥有' : PRODUCT_CATALOG['30分钟游戏券'].description}
                  </p>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <text x="12" y="16" fontSize="10" textAnchor="middle" fontWeight="bold" fill="white">$</text>
                      </svg>
                      <span className="font-black text-lg text-slate-700">{PRODUCT_CATALOG['30分钟游戏券'].price}</span>
                    </div>
                    {renderBuyButton('30分钟游戏券')}
                  </div>
                </div>
              </div>
            )}

            {canShowCard('stationery') && (
              <div className="bg-white rounded-[32px] p-4 flex flex-col shop-card-shadow relative group">
                <div className="bg-yellow-50 rounded-2xl h-32 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-100 opacity-50 rounded-2xl transform rotate-1 scale-110" />
                  <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <rect x="45" y="45" width="10" height="40" rx="2" fill="#FDBA74" />
                    <path d="M40 45 L60 45 L65 20 Q65 10, 50 10 Q35 10, 35 20 Z" fill="#F87171" />
                    <path d="M40 45 L60 45" stroke="#E5E7EB" strokeWidth="2" />
                    <path d="M45 10 Q50 0, 55 10" stroke="#FECACA" strokeWidth="3" fill="none" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-slate-700">艺术画笔</h3>
                  <p className="text-xs text-slate-400">
                    {isOwned('艺术画笔') ? '已拥有' : PRODUCT_CATALOG['艺术画笔'].description}
                  </p>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <text x="12" y="16" fontSize="10" textAnchor="middle" fontWeight="bold" fill="white">$</text>
                      </svg>
                      <span className="font-black text-lg text-slate-700">{PRODUCT_CATALOG['艺术画笔'].price}</span>
                    </div>
                    {renderBuyButton('艺术画笔')}
                  </div>
                </div>
              </div>
            )}

            {canShowCard('toys') && (
              <div className="bg-white rounded-[32px] p-4 flex flex-col shop-card-shadow relative group">
                <div className="bg-green-50 rounded-2xl h-32 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-100 opacity-50 rounded-2xl transform -rotate-3 scale-110" />
                  <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <path d="M25 40 L75 40 L70 80 L30 80 Z" fill="#34D399" />
                    <rect x="20" y="30" width="60" height="15" rx="2" fill="#10B981" />
                    <path d="M45 30 V80" stroke="#059669" strokeWidth="2" opacity="0.2" />
                    <text x="50" y="70" fontFamily="Nunito" fontWeight="800" fontSize="30" fill="white" textAnchor="middle">
                      ?
                    </text>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-slate-700">神秘盲盒</h3>
                  <p className="text-xs text-slate-400">
                    {isOwned('神秘盲盒') ? '已拥有' : PRODUCT_CATALOG['神秘盲盒'].description}
                  </p>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <text x="12" y="16" fontSize="10" textAnchor="middle" fontWeight="bold" fill="white">$</text>
                      </svg>
                      <span className="font-black text-lg text-slate-700">{PRODUCT_CATALOG['神秘盲盒'].price}</span>
                    </div>
                    {renderBuyButton('神秘盲盒')}
                  </div>
                </div>
              </div>
            )}

            {canShowCard('skins') && (
              <div className="bg-white rounded-[32px] p-4 flex flex-col shop-card-shadow relative group">
                <div className="bg-red-50 rounded-2xl h-32 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-100 opacity-50 rounded-2xl transform rotate-2 scale-110" />
                  <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <path d="M20 40 L80 40" stroke="#F87171" strokeWidth="2" />
                    <path d="M20 40 Q20 60, 35 60 Q50 60, 50 40 Z" fill="#FCA5A5" />
                    <path d="M50 40 Q50 60, 65 60 Q80 60, 80 40 Z" fill="#FCA5A5" />
                    <path d="M25 45 L35 55" stroke="white" strokeWidth="2" opacity="0.5" />
                    <path d="M55 45 L65 55" stroke="white" strokeWidth="2" opacity="0.5" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-slate-700">酷酷墨镜</h3>
                  <p className="text-xs text-slate-400">
                    {isOwned('酷酷墨镜') ? '已拥有' : PRODUCT_CATALOG['酷酷墨镜'].description}
                  </p>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <text x="12" y="16" fontSize="10" textAnchor="middle" fontWeight="bold" fill="white">$</text>
                      </svg>
                      <span className="font-black text-lg text-slate-700">{PRODUCT_CATALOG['酷酷墨镜'].price}</span>
                    </div>
                    {renderBuyButton('酷酷墨镜')}
                  </div>
                </div>
              </div>
            )}

            {canShowCard('skins') && (
              <div className="bg-white rounded-[32px] p-4 flex flex-col shop-card-shadow relative group">
                <div className="bg-indigo-50 rounded-2xl h-32 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-100 opacity-50 rounded-2xl transform -rotate-1 scale-110" />
                  <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <circle cx="50" cy="50" r="25" fill="#818CF8" />
                    <path d="M25 50 Q50 80, 75 50" stroke="#C7D2FE" strokeWidth="4" fill="none" />
                    <path d="M30 40 Q50 10, 70 40" stroke="#C7D2FE" strokeWidth="4" fill="none" opacity="0.5" />
                    <circle cx="40" cy="45" r="3" fill="#E0E7FF" />
                    <circle cx="60" cy="60" r="2" fill="#E0E7FF" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-slate-700">星球贴纸</h3>
                  <p className="text-xs text-slate-400">
                    {isOwned('星球贴纸') ? '已拥有' : PRODUCT_CATALOG['星球贴纸'].description}
                  </p>
                  <div className="mt-2 flex justify-between items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <text x="12" y="16" fontSize="10" textAnchor="middle" fontWeight="bold" fill="white">$</text>
                      </svg>
                      <span className="font-black text-lg text-slate-700">{PRODUCT_CATALOG['星球贴纸'].price}</span>
                    </div>
                    {renderBuyButton('星球贴纸')}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 mb-4 text-center">
            <p className="text-slate-400 text-sm font-black">
              没有更多商品啦 ~
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
