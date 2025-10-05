'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { GlassCard } from '@/components/shared/glass-card';

const DEMO_USERS = [
  { email: 'admin@demo.dev', label: 'Admin' },
  { email: 'user@demo.dev', label: 'Demo user' },
];

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params?.get('callbackUrl') ?? '/account';
  const [email, setEmail] = useState('admin@demo.dev');
  const [password, setPassword] = useState('password123');
  const initialError = params?.get('error');
  const [error, setError] = useState<string | null>(
    initialError ? 'Please sign in to continue with the correct credentials.' : null,
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const targetUrl = callbackUrl || (email === 'admin@demo.dev' ? '/admin/dashboard' : '/account');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: targetUrl,
      });
      if (result?.error) {
        setError('Invalid credentials. Try the demo accounts listed above.');
        return;
      }
      router.push(result?.url ?? targetUrl);
      router.refresh();
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-aurora-violet/45 blur-3xl" />
        <div className="absolute right-[-6rem] top-32 h-80 w-80 rounded-full bg-aurora-teal/35 blur-[140px]" />
        <div className="absolute bottom-[-8rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-aurora-amber/25 blur-[130px]" />
      </div>

      <GlassCard className="relative z-10 w-full max-w-lg space-y-8 bg-slate-950/75 p-10 shadow-[0_36px_90px_rgba(4,7,21,0.65)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-aurora-teal">Neo Commerce</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-100">Sign in</h1>
          </div>
          <div className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">
            Secure portal
          </div>
        </div>

        <p className="text-sm text-slate-300">
          Demo accounts: <span className="font-semibold">admin@demo.dev</span> / <span className="font-semibold">user@demo.dev</span>. Password: <span className="font-semibold">password123</span>.
        </p>

        <div className="flex gap-3">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword('password123');
              }}
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition-colors hover:border-aurora-teal/60 hover:text-aurora-teal"
            >
              {demo.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
            />
          </label>
          {error && <p className="text-xs text-aurora-amber">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-aurora-violet px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-100 shadow shadow-aurora-violet/35 transition-transform hover:-translate-y-[2px] disabled:opacity-50"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Need access? Contact your workspace admin.</span>
          <Link href="/" className="text-aurora-teal underline-offset-4 hover:underline">
            Return home
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
