import React from 'react';

export type BadgeVariant = 'accepted' | 'warning' | 'error' | 'neutral' | 'flagged' | 'passed';

interface IssueBadgeProps {
  variant: BadgeVariant;
  label?: string;
  count?: number;
  className?: string;
}

export const IssueBadge: React.FC<IssueBadgeProps> = ({
  variant,
  label,
  count,
  className = '',
}) => {
  let text = label || '';
  let colorStyles = '';

  switch (variant) {
    case 'accepted':
    case 'passed':
      colorStyles = 'bg-[#E4EFE9] text-[#3C7A5F]';
      if (!text) text = count !== undefined ? `${count} passed` : 'Accepted';
      break;
    case 'warning':
    case 'flagged':
      colorStyles = 'bg-[#F6E9DA] text-[#B8752E]';
      if (!text) text = count !== undefined ? `${count} cells repaired` : 'Warning';
      break;
    case 'error':
      colorStyles = 'bg-[#F5E1E1] text-[#A63D40]';
      if (!text) text = count !== undefined ? `${count} errors` : 'Error';
      break;
    case 'neutral':
    default:
      colorStyles = 'bg-[#E7EBF0] text-[#2E4057]';
      if (!text) text = count !== undefined ? `${count} rows` : 'Info';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap ${colorStyles} ${className}`}
    >
      {text}
    </span>
  );
};
