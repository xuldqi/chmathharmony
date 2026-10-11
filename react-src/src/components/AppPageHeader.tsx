import React from 'react';

interface AppPageHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
  titleClassName?: string;
  rightElement?: React.ReactNode;
  backAriaLabel?: string;
}

export default function AppPageHeader({
  title,
  onBack,
  showBack = true,
  className = '',
  titleClassName = '',
  rightElement,
  backAriaLabel = '返回上一页',
}: AppPageHeaderProps) {
  const shouldShowBack = showBack && typeof onBack === 'function';

  return (
    <header
      className={`w-full flex items-center justify-between gap-3 ${
        shouldShowBack ? 'min-h-[40px]' : 'min-h-[36px]'
      } mb-3.5 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {shouldShowBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backAriaLabel}
            className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center pop-shadow-sm pop-shadow-sm-active transition-all text-[#4B454E] cursor-pointer"
          >
            <span className="text-xl leading-none" aria-hidden="true">←</span>
          </button>
        )}
        <h1 className={`text-xl font-extrabold tracking-tight text-[#4B454E] truncate ${titleClassName}`}>
          {title}
        </h1>
      </div>

      {/* 右侧插槽 */}
      {rightElement && (
        <div className="flex-shrink-0 flex justify-end">
          {rightElement}
        </div>
      )}
    </header>
  );
}
