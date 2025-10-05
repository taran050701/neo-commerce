'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

type CartSummary = {
  items: Array<{ quantity: number }>;
};

export function CartButton() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let active = true;

    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('Failed to load cart');
        }
        const data = (await response.json()) as CartSummary | null;
        if (!active) return;
        const qty = data?.items?.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 0;
        setCount(qty);
      } catch (error) {
        if (active) {
          setCount(0);
        }
      }
    };

    fetchCart();

    const handler = () => fetchCart();
    window.addEventListener('cart:updated', handler);
    return () => {
      active = false;
      window.removeEventListener('cart:updated', handler);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-100 transition-colors hover:border-aurora-teal/60 hover:text-aurora-teal"
      aria-label="View cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-aurora-violet to-aurora-teal px-1 text-[0.65rem] font-semibold text-slate-900 shadow-lg shadow-aurora-violet/40">
          {count}
        </span>
      )}
    </Link>
  );
}
