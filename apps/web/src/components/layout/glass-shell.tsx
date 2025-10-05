import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassShellProps {
  children: ReactNode;
  className?: string;
}

export function GlassShell({ children, className }: GlassShellProps) {
  return (
    <div className={cn('mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8', className)}>
      {children}
    </div>
  );
}
