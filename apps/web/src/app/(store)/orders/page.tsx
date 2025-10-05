import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { formatCurrency } from '@/utils/currency';
import { GlassCard } from '@/components/shared/glass-card';

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const isSuccess = searchParams?.status === 'success';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-100">Orders</h1>
      {isSuccess && (
        <GlassCard className="border-aurora-teal/40 text-sm text-aurora-teal">
          Payment confirmed. Your order is being prepared.
        </GlassCard>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-glass">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Order #{order.id.slice(-8)}</span>
              <span className="text-xs uppercase tracking-[0.3em]">{order.status}</span>
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
            <p className="mt-4 text-sm text-slate-200">
              Total: {formatCurrency(Number(order.totalAmount), order.currency)}
            </p>
          </div>
        ))}
        {!orders.length && <p className="text-sm text-slate-300">No orders yet.</p>}
      </div>
    </div>
  );
}
