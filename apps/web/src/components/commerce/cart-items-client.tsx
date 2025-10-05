'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/utils/currency';

interface CartItemClient {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemsClientProps {
  initialItems: CartItemClient[];
  currency: string;
}

export function CartItemsClient({ initialItems, currency }: CartItemsClientProps) {
  const [items, setItems] = useState<CartItemClient[]>(initialItems);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const hasItems = items.length > 0;

  const displayCurrency = currency.toUpperCase();
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const updateQuantity = async (productId: string, quantity: number) => {
    setPendingId(productId);
    try {
      const endpoint = quantity <= 0 ? 'DELETE' : 'PATCH';
      const response = await fetch('/api/cart', {
        method: endpoint,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      const data = await response.json();
      const nextItems: CartItemClient[] = (data?.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        name: item.product?.name ?? 'Item',
        price: Number(item.product?.prices?.[0]?.amount ?? 0),
      }));
      setItems(nextItems);
      window.dispatchEvent(new Event('cart:updated'));
    } catch (error) {
      // optimistic revert not needed; simply ignore
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-glass">
        {!hasItems && <p className="text-sm text-slate-300">Your cart is empty.</p>}
        {hasItems && (
          <ul className="space-y-4 text-sm text-slate-300">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatCurrency(item.price, displayCurrency)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={pendingId === item.productId}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-aurora-teal/40 bg-aurora-teal/20 text-lg text-aurora-teal transition-colors hover:bg-aurora-teal/30 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm text-slate-100">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={pendingId === item.productId}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-aurora-teal/40 bg-aurora-teal/20 text-lg text-aurora-teal transition-colors hover:bg-aurora-teal/30 disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, 0)}
                    disabled={pendingId === item.productId}
                    className="text-xs text-aurora-amber underline-offset-4 hover:underline disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-glass">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, displayCurrency)}</span>
        </div>
        <div className="mt-4 space-y-3">
          <button
            type="button"
            disabled={!hasItems}
            onClick={() => {
              if (!hasItems) return;
              window.location.href = '/checkout';
            }}
            className="inline-flex w-full justify-center rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/30 transition-transform hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Checkout
          </button>
          <a href="/" className="block text-center text-sm text-aurora-teal underline-offset-4 hover:underline">
            Continue shopping
          </a>
        </div>
      </div>
    </div>
  );
}
