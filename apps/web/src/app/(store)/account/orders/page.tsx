import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { formatCurrency } from '@/utils/currency';
import { GlassCard } from '@/components/shared/glass-card';

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Order history</h1>
        <p className="text-sm text-slate-300">Track your purchases and pick up where you left off.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <GlassCard key={order.id} className="bg-slate-950/65 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
              <span className="font-semibold text-slate-100">Order #{order.id.slice(-8)}</span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                {order.status}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.product.name}</span>
                  <span>
                    {item.quantity} × {formatCurrency(Number(item.unitAmount), order.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
              <p>Total paid: {formatCurrency(Number(order.totalAmount), order.currency)}</p>
              <p className="text-xs text-slate-500">Placed {order.createdAt.toLocaleDateString()}</p>
            </div>
          </GlassCard>
        ))}
        {!orders.length && (
          <GlassCard className="border-dashed border-white/10 text-center text-sm text-slate-300">
            No orders yet. Explore the catalog to get started.
          </GlassCard>
        )}
      </div>
    </div>
  );
}
