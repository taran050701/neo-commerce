'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/use-session';

interface AddToCartButtonProps {
  productId: string;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'added' | 'error'>('idle');
  const [authPromptShown, setAuthPromptShown] = useState(false);
  const { session } = useSession();
  const pathname = usePathname();

  const isSignedIn = Boolean(session?.user?.id);

  const handleClick = () => {
    if (!isSignedIn) {
      setAuthPromptShown(true);
      const callbackUrl = pathname ?? `/product/${productId}`;
      signIn(undefined, { callbackUrl });
      return;
    }
    if (isPending) return;
    setStatus('idle');
    startTransition(async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity: 1 }),
        });
        if (!response.ok) {
          throw new Error('Failed to add to cart');
        }
        window.dispatchEvent(new Event('cart:updated'));
        setStatus('added');
        setTimeout(() => setStatus('idle'), 2500);
      } catch (error) {
        setStatus('error');
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/40 transition-transform hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? 'Adding…' : isSignedIn ? 'Add to cart' : 'Sign in to purchase'}
      </button>
      {status === 'added' && <p className="text-xs text-aurora-teal">Added to cart.</p>}
      {authPromptShown && !isSignedIn && (
        <p className="text-xs text-slate-400">
          Please sign in or create an account to continue checkout. You will be redirected back to this product.
        </p>
      )}
      {status === 'error' && <p className="text-xs text-aurora-amber">Something went wrong. Try again.</p>}
    </div>
  );
}
