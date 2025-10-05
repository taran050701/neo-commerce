'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useSession } from '@/hooks/use-session';

export function AdminTopbar() {
  const { session } = useSession();
  const name = session?.user?.name ?? session?.user?.email ?? 'Admin';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-4 text-sm text-slate-200 shadow-glass">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Neo Commerce Admin</p>
        <h2 className="text-lg font-semibold text-slate-100">Welcome back, {name.split(' ')[0]}.</h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition-colors hover:border-aurora-teal/60 hover:text-aurora-teal"
        >
          View storefront
        </Link>
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition-colors hover:border-aurora-teal/60 hover:text-aurora-teal"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-full bg-gradient-to-r from-aurora-violet to-aurora-teal px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/30 hover:-translate-y-[1px] hover:opacity-95"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
