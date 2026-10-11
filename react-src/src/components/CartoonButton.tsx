import React from 'react';
import { useAudio } from '@/hooks/useAudio';

export interface CartoonButtonProps {
  title: string;
  emoji?: string;
  icon?: React.ReactNode;
  bgGradient: string;
  shadowColor: string;
  onClick: () => void;
  sizeClass?: string;
  variant?: 'gentle' | 'playful';
}

const CartoonButton: React.FC<CartoonButtonProps> = ({
  title,
  emoji,
  icon,
  bgGradient,
  shadowColor,
  onClick,
  sizeClass = 'w-40 h-40',
  variant = 'gentle',
}) => {
  const { playButtonClick } = useAudio();
  const isGentle = variant === 'gentle';

  const handleClick = () => {
    playButtonClick();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative ${sizeClass}
        transform transition-all duration-500 ease-out
        ${isGentle ? 'hover:scale-105 active:scale-100' : 'hover:scale-115 hover:-translate-y-3 active:scale-108'}
        group overflow-hidden
      `}
      style={{
        borderRadius: isGentle ? '1.6rem' : '2.8rem',
        boxShadow: isGentle
          ? `0 12px 26px ${shadowColor}25, 0 2px 6px rgba(0,0,0,0.08)`
          : `
            0 20px 40px ${shadowColor}35,
            0 8px 20px ${shadowColor}45,
            0 2px 8px rgba(0,0,0,0.1),
            inset 0 2px 0 rgba(255,255,255,0.7),
            inset 0 -2px 0 rgba(0,0,0,0.15)
          `,
        background: isGentle
          ? bgGradient
              .replace('bg-gradient-to-br', 'linear-gradient(160deg,')
              .replace('bg-gradient-to-br from-', 'linear-gradient(160deg, ')
              .replace(' to-', ', ')
          : `
            radial-gradient(ellipse at top left, rgba(255,255,255,0.4), transparent 50%),
            linear-gradient(145deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05)),
            ${bgGradient.replace('bg-gradient-to-br', 'linear-gradient(135deg,')}
          `
              .replace('bg-gradient-to-br from-', 'linear-gradient(135deg, ')
              .replace(' to-', ', '),
      }}
    >
      {!isGentle && (
        <>
          <div
            className="absolute top-2 left-2 right-8 rounded-full h-10 opacity-75"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
              filter: 'blur(1px)',
            }}
          />

          <div
            className="absolute inset-1 rounded-[2.4rem] opacity-50"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.7), transparent 35%, transparent 65%, rgba(255,255,255,0.4))',
            }}
          />

          <div
            className="absolute inset-3 rounded-[2rem] opacity-40"
            style={{
              background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.9), transparent 60%)',
            }}
          />

          <div
            className="absolute bottom-2 left-4 right-4 rounded-full h-4 opacity-25"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)',
            }}
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <div
          className={`text-5xl mb-2 transform transition-all duration-500 ease-out ${
            isGentle ? 'group-hover:scale-110' : 'group-hover:scale-130 group-hover:rotate-12 group-hover:animate-pulse'
          }`}
          style={{
            filter: isGentle
              ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
              : 'drop-shadow(0 3px 12px rgba(0,0,0,0.4)) drop-shadow(0 0 20px rgba(255,255,255,0.3))',
          }}
        >
          {icon || emoji}
        </div>
        <div
          className="text-white font-semibold text-lg text-center leading-tight"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.2)',
          }}
        >
          {title}
        </div>
      </div>

      {!isGentle && (
        <>
          <div
            className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-200 rounded-[2.5rem]"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)',
              animation: 'group-active:pulse 0.3s ease-out',
            }}
          />

          <div
            className="absolute -inset-3 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[3rem]"
            style={{
              background: `
                radial-gradient(circle, ${shadowColor}30, ${shadowColor}15, transparent 60%),
                radial-gradient(circle, rgba(255,255,255,0.3), transparent 40%)
              `,
              filter: 'blur(12px)',
            }}
          />

          <div
            className="absolute -inset-4 opacity-0 group-hover:opacity-60 transition-all duration-700 rounded-[3.5rem]"
            style={{
              background: `conic-gradient(from 0deg, 
                rgba(255,0,150,0.2), 
                rgba(0,255,255,0.2), 
                rgba(255,255,0,0.2), 
                rgba(255,0,150,0.2)
              )`,
              filter: 'blur(16px)',
              animation: 'group-hover:spin 3s linear infinite',
            }}
          />
        </>
      )}
    </button>
  );
};

export default CartoonButton;

