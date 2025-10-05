import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface NeoBadgeProps {
  children: ReactNode;
  tone?: 'default' | 'success' | 'warning';
  className?: string;
}

const toneMap: Record<NonNullable<NeoBadgeProps['tone']>, string> = {
  default: 'bg-white/10 text-slate-200',
  success: 'bg-neon-green/10 text-neon-green',
  warning: 'bg-neon-pink/10 text-neon-pink',
};

export function NeoBadge({ children, tone = 'default', className }: NeoBadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
