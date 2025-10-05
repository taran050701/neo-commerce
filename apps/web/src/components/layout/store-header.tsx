'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ChevronDown } from 'lucide-react';
import { NeoBadge } from '@neo/ui';
import { useSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils/cn';
import { CartButton } from '@/components/commerce/cart-button';

const LINKS = [
  { href: '/', label: 'Drops' },
  { href: '/categories/wearables', label: 'Wearables' },
  { href: '/categories/smart-home', label: 'Smart Home' },
  { href: '/categories/mobility', label: 'Mobility' },
];

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export function StoreHeader() {
  const pathname = usePathname();
  const { session, isLoading } = useSession();
  const user = session?.user as SessionUser | undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeHref = useMemo(() => {
    if (!pathname) return '/';
    const match = LINKS.find((link) => link.href !== '/' && pathname.startsWith(link.href));
    if (match) return match.href;
    return pathname === '/' ? '/' : null;
  }, [pathname]);

  const displayName = useMemo(() => {
    if (!user) return null;
    if (user.name) return user.name.split(' ')[0];
    if (user.email) return user.email.split('@')[0];
    return null;
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const menu = useMemo(() => {
    if (isLoading) {
      return {
        heading: 'Loading…',
        items: [{ label: 'Checking credentials', href: null, tone: 'ghost' as const }],
      } as const;
    }

    if (!user) {
      return {
        heading: 'Welcome',
        items: [
          { label: 'Sign in to your account', href: '/auth/sign-in', tone: 'primary' },
          { label: 'Create a new account', href: '/auth/sign-up', tone: 'outline' },
        ],
      } as const;
    }

    const items: Array<{ label: string; href: string | null; tone: 'primary' | 'outline' | 'ghost'; action?: () => Promise<void> }>
      = [
        { label: 'Account settings', href: '/account', tone: 'outline' },
        { label: 'My orders', href: '/account/orders', tone: 'outline' },
        { label: 'Saved carts', href: '/cart', tone: 'outline' },
      ];

    if (user.role === 'ADMIN') {
      items.unshift({ label: 'Admin dashboard', href: '/admin/dashboard', tone: 'primary' });
    }

    items.push({
      label: 'Sign out',
      href: null,
      tone: 'ghost',
      action: async () => {
        setMenuOpen(false);
        await signOut({ callbackUrl: '/' });
      },
    });

    return {
      heading: 'Quick actions',
      items,
    } as const;
  }, [isLoading, user]);

  return (
    <header className="relative z-[200] flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/50 px-6 py-4 shadow-glass backdrop-blur-3xl">
      <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-slate-100">
        <Image
          src="/logo.svg"
          alt="NEO Commerce"
          width={160}
          height={40}
          priority
          className="h-10 w-auto drop-shadow-[0_8px_18px_rgba(37,99,235,0.25)]"
        />
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm text-slate-300 transition-colors hover:text-aurora-teal',
              activeHref === link.href && 'text-aurora-teal',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <NeoBadge tone="success">AI assistant live</NeoBadge>
        <Link
          href={user ? '/account' : '/auth/sign-in'}
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 sm:hidden"
        >
          {user ? 'Account' : 'Sign in'}
        </Link>
        <div className="relative hidden sm:block" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-left text-xs uppercase tracking-[0.3em] text-slate-300 transition-colors hover:border-aurora-teal/50 hover:text-aurora-teal"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span className="flex flex-col">
              <span className="text-[0.65rem] tracking-[0.4em] text-slate-500">
                {isLoading ? 'Loading…' : `Hello, ${displayName ?? 'guest'}`}
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
                Account & Settings
              </span>
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', menuOpen && 'rotate-180')} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-[400] mt-3 w-[19rem] space-y-4 rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-sm text-slate-200 shadow-[0_28px_70px_rgba(5,8,22,0.75)] backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-aurora-teal">{menu.heading}</p>
              <nav className="space-y-2">
                {menu.items.map((item) => {
                  const baseClasses = 'block rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition-colors';
                  if (item.href) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(baseClasses, {
                          'bg-aurora-violet text-slate-100 shadow shadow-aurora-violet/30 hover:bg-aurora-violet/90': item.tone === 'primary',
                          'border border-white/10 bg-white/5 text-slate-200 hover:border-aurora-teal/60 hover:text-aurora-teal': item.tone === 'outline',
                          'border border-white/10 text-slate-200 hover:border-aurora-amber/60 hover:text-aurora-amber': item.tone === 'ghost',
                          'text-slate-400 cursor-default': item.tone === 'muted',
                        })}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className={cn(baseClasses, 'w-full border border-white/10 text-slate-200 hover:border-aurora-amber/60 hover:text-aurora-amber')}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
        <CartButton />
      </div>
    </header>
  );
}
