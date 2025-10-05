'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { GlassCard } from '@/components/shared/glass-card';

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params?.get('callbackUrl') ?? '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(data?.error ?? 'Unable to create account.');
          return;
        }

        setSuccess(true);

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}&error=CredentialsSignin`);
          return;
        }

        router.push(result?.url ?? callbackUrl);
        router.refresh();
      } catch (err) {
        setError('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight px-4">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-300">
            Join Neo Commerce to track orders, save wishlists, and chat with the AI assistant.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Name (optional)
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              placeholder="Ada Lovelace"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              placeholder="you@example.com"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Confirm password
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              placeholder="Retype password"
            />
          </label>
          {error && <p className="text-xs text-aurora-amber">{error}</p>}
          {success && <p className="text-xs text-aurora-teal">Account created! Signing you in…</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/30 transition-transform hover:-translate-y-[1px] disabled:opacity-40"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link href={`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-aurora-teal">
            Sign in here
          </Link>
          .
        </p>
      </GlassCard>
    </div>
  );
}
