'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/kb', label: 'Knowledge Base' },
  { href: '/admin/tickets', label: 'Tickets' },
  { href: '/admin/flags', label: 'Feature Flags' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'rounded-full border border-white/10 px-4 py-2 font-semibold uppercase tracking-[0.3em] transition-colors hover:border-aurora-teal/50 hover:text-aurora-teal',
            pathname.startsWith(link.href) && 'border-aurora-teal/70 text-aurora-teal',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
