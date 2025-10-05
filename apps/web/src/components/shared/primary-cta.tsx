import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface PrimaryCTAProps {
  href: string;
  children: string;
  className?: string;
}

export function PrimaryCTA({ href, children, className }: PrimaryCTAProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-aurora-violet/30 transition-all duration-300 hover:-translate-y-[1px]',
        className,
      )}
    >
      {children}
    </Link>
  );
}
