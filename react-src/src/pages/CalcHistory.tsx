import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, Copy, Check, Clock, Calculator, Sigma, Divide } from 'lucide-react';
import AppPageHeader from '@/components/AppPageHeader';
import HistoryStorage, { type CalcHistoryItem } from '@/lib/historyStorage';
import { useIsCurrentTab } from '@/lib/tabConfig';
import MainTabBar from '@/components/MainTabBar';

const FractionToken: React.FC<{ token: string; size?: 'sm' | 'lg' }> = ({ token, size = 'sm' }) => {
  // 匹配带整数的带分数：形如 2又3/5 或 -2又3/5
  const mixedMatch = token.match(/^(-?\d+)又(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const [, whole, num, den] = mixedMatch;
    return (
      <span className="inline-flex items-center gap-0.5 mx-0.5 align-middle">
        <span className={size === 'lg' ? 'text-lg font-black' : 'text-xs font-bold'}>{whole}</span>
        <span className="inline-flex flex-col items-center justify-center leading-none">
          <span className={size === 'lg' ? 'text-xs font-black' : 'text-[10px] font-bold'}>{num}</span>
          <span className="w-full h-[1.5px] bg-current my-[1px] rounded-full" />
          <span className={size === 'lg' ? 'text-xs font-black' : 'text-[10px] font-bold'}>{den}</span>
        </span>
      </span>
    );
  }

  // 匹配纯分数：形如 3/5 或 -3/5
  const fracMatch = token.match(/^(-?)(\d+)\/(\d+)$/);
  if (fracMatch) {
    const [, sign, num, den] = fracMatch;
    return (
      <span className="inline-flex items-center gap-0.5 mx-0.5 align-middle">
        {sign && <span className={size === 'lg' ? 'text-base font-black' : 'text-xs font-bold'}>-</span>}
        <span className="inline-flex flex-col items-center justify-center leading-none">
          <span className={size === 'lg' ? 'text-xs font-black' : 'text-[10px] font-bold'}>{num}</span>
          <span className="w-full h-[1.5px] bg-current my-[1px] rounded-full" />
          <span className={size === 'lg' ? 'text-xs font-black' : 'text-[10px] font-bold'}>{den}</span>
        </span>
      </span>
    );
  }

  return <span>{token}</span>;
};

const FractionInlineRenderer: React.FC<{ text: string; size?: 'sm' | 'lg' }> = ({ text, size = 'sm' }) => {
  const parts = text.split(' ');
  return (
    <div className={`flex items-center flex-wrap gap-1 ${size === 'lg' ? 'text-xl font-black text-[#0F172A]' : 'text-xs font-bold text-[#64748B]'}`}>
      {parts.map((p, idx) => (
        <React.Fragment key={idx}>
          <FractionToken token={p} size={size} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default function CalcHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'all' | 'standard' | 'scientific' | 'fraction' | null;
  const isTab = useIsCurrentTab('/calc-history');

  const [historyList, setHistoryList] = useState<CalcHistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'standard' | 'scientific' | 'fraction'>(
    initialTab && ['all', 'standard', 'scientific', 'fraction'].includes(initialTab) ? initialTab : 'all'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistoryList(HistoryStorage.getHistory());
  }, []);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return historyList;
    return historyList.filter((item) => item.type === activeFilter);
  }, [historyList, activeFilter]);

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) {
      console.warn('复制失败:', e);
    }
  };

  const handleDeleteItem = (id: string) => {
    HistoryStorage.deleteRecord(id);
    setHistoryList(HistoryStorage.getHistory());
  };

  const handleClearAll = () => {
    HistoryStorage.clearHistory();
    setHistoryList([]);
    setShowClearConfirm(false);
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${date} ${hours}:${minutes}`;
  };

  return (
    <div className={`bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-[#EFF6FF] min-h-screen w-full flex flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] ${isTab ? 'pb-28' : 'pb-6'} text-[#334155]`}>
      {/* 顶部标题栏 */}
      <AppPageHeader
        title="计算历史"
        onBack={isTab ? undefined : () => navigate(-1)}
        showBack={!isTab}
        rightElement={
          historyList.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-2 text-[#94A3B8] hover:text-red-500 active:scale-95 transition-all"
              title="清空历史"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : undefined
        }
      />

      {/* 过滤器 Tab 切换 */}
      <div className="flex bg-[#E2E8F0]/60 p-1 rounded-2xl mb-5 self-center w-full max-w-sm">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            activeFilter === 'all'
              ? 'bg-white text-[#1E293B] shadow-sm'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          全部 ({historyList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('standard')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            activeFilter === 'standard'
              ? 'bg-white text-[#0284C7] shadow-sm'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          基础
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('scientific')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            activeFilter === 'scientific'
              ? 'bg-white text-[#7C3AED] shadow-sm'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          科学
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('fraction')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            activeFilter === 'fraction'
              ? 'bg-white text-[#9333EA] shadow-sm'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          分数
        </button>
      </div>

      {/* 历史流水列表 */}
      <div className="flex-1 flex flex-col gap-3 pb-8 w-full max-w-md mx-auto">
        {filteredList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#E2E8F0]/50 flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <p className="text-base font-black text-[#64748B]">暂无计算历史</p>
            <p className="text-xs font-bold text-[#94A3B8] mt-1">
              在基础、科学或分数计算器完成计算后会自动记录
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[22px] p-4 flex flex-col gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F1F5F9] relative group transition-all"
            >
              {/* 顶部：类型标签与时间 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {item.type === 'scientific' ? (
                    <span className="inline-flex items-center gap-1 bg-[#F3E8FF] text-[#7C3AED] text-[11px] font-black px-2 py-0.5 rounded-md">
                      <Sigma className="w-3 h-3" /> 科学
                    </span>
                  ) : item.type === 'fraction' ? (
                    <span className="inline-flex items-center gap-1 bg-[#F3E8FF] text-[#9333EA] text-[11px] font-black px-2 py-0.5 rounded-md">
                      <Divide className="w-3 h-3" /> 分数
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#E0F2FE] text-[#0284C7] text-[11px] font-black px-2 py-0.5 rounded-md">
                      <Calculator className="w-3 h-3" /> 基础
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#94A3B8]">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>

              {/* 中部：算式与结果 */}
              <div className="flex flex-col gap-1">
                {item.type === 'fraction' ? (
                  <>
                    <FractionInlineRenderer text={item.expression} size="sm" />
                    <FractionInlineRenderer text={item.result} size="lg" />
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-[#64748B] select-all break-all">
                      {item.expression}
                    </span>
                    <span className="text-xl font-black text-[#0F172A] select-all break-all tracking-tight">
                      {item.result}
                    </span>
                  </>
                )}
              </div>

              {/* 底部功能栏 */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.result)}
                  className="inline-flex items-center gap-1 text-xs font-black text-[#0284C7] bg-[#F0F9FF] px-2.5 py-1 rounded-lg active:scale-95 transition-all"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制结果</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 text-[#CBD5E1] hover:text-red-500 active:scale-90 transition-all"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-white rounded-[26px] p-6 max-w-xs w-full flex flex-col items-center text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#1E293B]">清空计算历史？</h3>
            <p className="text-xs font-bold text-[#64748B] mt-1 mb-5">
              清空后所有普通计算与科学计算记录都将删除且无法恢复。
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] text-xs font-black text-[#475569] active:scale-95 transition-all"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-xs font-black text-white active:scale-95 transition-all shadow-sm"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 当作为底部 Tab 展示时，常驻渲染 TabBar */}
      {isTab && <MainTabBar />}
    </div>
  );
}
