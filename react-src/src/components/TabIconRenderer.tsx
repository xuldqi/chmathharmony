import React from 'react';
import {
  Gift,
  Zap,
  History,
  BarChart3,
  Coins,
  Trophy,
  Ruler,
  Star,
  BookOpen,
  Home,
  Gamepad2,
  Heart,
  Flame,
} from 'lucide-react';

interface TabIconRendererProps {
  iconKey: string;
  size?: number;
  className?: string;
}

export const TabIconRenderer: React.FC<TabIconRendererProps> = ({
  iconKey,
  size = 22,
  className = '',
}) => {
  switch (iconKey) {
    case 'calc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      );
    case 'flask':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M7 2v2h1v3.24L4.04 15.2c-.67 1.17-.67 2.6 0 3.77.67 1.17 1.91 1.88 3.26 1.88h9.4c1.35 0 2.59-.71 3.26-1.88.67-1.17.67-2.6 0-3.77L16 7.24V4h1V2H7zm4 10.5V9h2v3.5l2.25 4.5h-6.5L11 12.5z" />
        </svg>
      );
    case 'divide':
    case 'fraction':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          {/* 分子方块 */}
          <rect x="8" y="3.5" width="8" height="6.5" rx="1.5" />
          {/* 分数横线 */}
          <rect x="4.5" y="11" width="15" height="2" rx="1" />
          {/* 分母方块 */}
          <rect x="8" y="14" width="8" height="6.5" rx="1.5" />
        </svg>
      );
    case 'gift':
      return <Gift size={size} className={className} />;
    case 'zap':
      return <Zap size={size} className={className} />;
    case 'history':
      return <History size={size} className={className} />;
    case 'chart':
      return <BarChart3 size={size} className={className} />;
    case 'coins':
      return <Coins size={size} className={className} />;
    case 'trophy':
      return <Trophy size={size} className={className} />;
    case 'ruler':
      return <Ruler size={size} className={className} />;
    case 'star':
      return <Star size={size} className={className} />;
    case 'book':
      return <BookOpen size={size} className={className} />;
    case 'home':
      return <Home size={size} className={className} />;
    case 'gamepad':
      return <Gamepad2 size={size} className={className} />;
    case 'heart':
      return <Heart size={size} className={className} />;
    case 'flame':
      return <Flame size={size} className={className} />;
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      );
  }
};

export default TabIconRenderer;
