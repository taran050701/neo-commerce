import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-2xl',
        'transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-aurora-teal/60',
        className,
      )}
    >
      {children}
    </div>
  );
}
