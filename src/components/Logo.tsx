import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ColumnRepairLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-[15px]',
    md: 'text-[18px]',
    lg: 'text-[22px]',
  };

  const subTextSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-[12px]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Column Repair Vector Glyph */}
      <div
        className={`${iconSizes[size]} rounded-[8px] bg-[#2E4057] p-1.5 flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden`}
        title="Column Repair"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Column 1 (Left - muted) */}
          <rect
            x="3"
            y="4"
            width="6"
            height="24"
            rx="2"
            fill="#E7EBF0"
            fillOpacity="0.35"
          />
          <line x1="4.5" y1="9" x2="7.5" y2="9" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="4.5" y1="14" x2="7.5" y2="14" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="4.5" y1="19" x2="7.5" y2="19" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="4.5" y1="24" x2="7.5" y2="24" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />

          {/* Foreground Column 2 (Center - Active / Repaired Column in Emerald Sage & White) */}
          <rect
            x="11.5"
            y="3"
            width="9"
            height="26"
            rx="2.5"
            fill="#FFFFFF"
            stroke="#3C7A5F"
            strokeWidth="1.5"
          />
          {/* Header cell in center column */}
          <rect
            x="12.5"
            y="4"
            width="7"
            height="4"
            rx="1"
            fill="#3C7A5F"
          />
          {/* Clean cells */}
          <line x1="13.5" y1="12" x2="18.5" y2="12" stroke="#2E4057" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.5" y1="16.5" x2="18.5" y2="16.5" stroke="#2E4057" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.5" y1="21" x2="18.5" y2="21" stroke="#2E4057" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.5" y1="25.5" x2="17" y2="25.5" stroke="#2E4057" strokeWidth="1.5" strokeLinecap="round" />

          {/* Background Column 3 (Right - muted) */}
          <rect
            x="23"
            y="4"
            width="6"
            height="24"
            rx="2"
            fill="#E7EBF0"
            fillOpacity="0.35"
          />
          <line x1="24.5" y1="9" x2="27.5" y2="9" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="24.5" y1="14" x2="27.5" y2="14" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="24.5" y1="19" x2="27.5" y2="19" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="24.5" y1="24" x2="27.5" y2="24" stroke="#E7EBF0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />

          {/* Repair Spark / Badge on bottom-right of center column */}
          <circle cx="21" cy="22" r="4" fill="#3C7A5F" />
          <path
            d="M19.5 22L20.5 23L22.5 21"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-[#1C1E22] ${textSizes[size]}`}>
              Column<span className="text-[#3C7A5F]">Repair</span>
            </span>
          </div>
          <span className={`font-medium tracking-wide uppercase text-[#6B6E73] ${subTextSizes[size]}`}>
            CSV, XLSX & JSON Type Cleaner
          </span>
        </div>
      )}
    </div>
  );
};
