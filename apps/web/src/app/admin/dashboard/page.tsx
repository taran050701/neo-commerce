import { cache, Fragment } from 'react';
import { db } from '@/server/db';
import { GlassCard } from '@/components/shared/glass-card';
import { formatCurrency } from '@/utils/currency';

export const fetchDashboardData = cache(async () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);

  const [orders, users, inventory, loginEvents, carts] = await Promise.all([
    db.order.findMany({
      include: { items: true },
    }),
    db.user.count(),
    db.product.findMany({
      include: {
        inventory: true,
      },
    }),
    db.auditLog.findMany({
      where: {
        action: 'login',
        createdAt: { gte: start },
      },
      select: {
        createdAt: true,
        metadata: true,
      },
    }),
    db.cart.findMany({
      select: {
        status: true,
      },
    }),
  ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const averageOrderValue = orders.length ? revenue / orders.length : 0;

  const loginMatrix: Record<string, Record<'ADMIN' | 'USER' | 'AGENT' | 'UNKNOWN', number>> = {};
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    loginMatrix[key] = { ADMIN: 0, USER: 0, AGENT: 0, UNKNOWN: 0 };
  }

  loginEvents.forEach((event) => {
    const key = event.createdAt.toISOString().slice(0, 10);
    if (!loginMatrix[key]) {
      loginMatrix[key] = { ADMIN: 0, USER: 0, AGENT: 0, UNKNOWN: 0 };
    }
    const role = (event.metadata as any)?.role ?? 'UNKNOWN';
    if (role in loginMatrix[key]) {
      loginMatrix[key][role as 'ADMIN' | 'USER' | 'AGENT' | 'UNKNOWN'] += 1;
    } else {
      loginMatrix[key].UNKNOWN += 1;
    }
  });

  const normalizedInventory = inventory.map((product) => ({
    id: product.id,
    name: product.name,
    quantity: product.inventory?.quantity ?? 0,
    threshold: product.inventory?.threshold ?? 5,
  }));

  const recoveryRate = (() => {
    const recovered = carts.filter((cart) => cart.status === 'recovered').length;
    return carts.length ? (recovered / carts.length) * 100 : 0;
  })();

  return {
    totals: {
      revenue,
      averageOrderValue,
      orders: orders.length,
      users,
      recoveryRate,
    },
    loginMatrix,
    inventory: normalizedInventory,
  };
});

async function fetchAiSummary(input: string) {
  const base = process.env.AI_SERVICE_URL;
  if (!base) return null;
  try {
    const response = await fetch(`${base}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input, mode: 'faq' }),
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.reply === 'string' ? data.reply : null;
  } catch (error) {
    return null;
  }
}

function LoginHeatmap({ matrix }: { matrix: Record<string, Record<string, number>> }) {
  const days = Object.keys(matrix).sort();
  const roles = ['ADMIN', 'USER', 'AGENT', 'UNKNOWN'];
  const max = Math.max(
    1,
    ...days.flatMap((day) => roles.map((role) => matrix[day]?.[role] ?? 0)),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Login matrix (last 7 days)</span>
        <span>Intensity = login volume</span>
      </div>
      <div className="grid grid-cols-[80px_repeat(7,_minmax(0,1fr))] gap-2 text-xs text-slate-300">
        <span />
        {days.map((day) => (
          <span key={day} className="text-center">
            {day.slice(5)}
          </span>
        ))}
        {roles.map((role) => (
          <Fragment key={role}>
            <span className="flex items-center font-semibold text-slate-200">
              {role.toLowerCase()}
            </span>
            {days.map((day) => {
              const value = matrix[day]?.[role] ?? 0;
              const intensity = value / max;
              return (
                <div
                  key={`${role}-${day}`}
                  className="h-9 rounded-xl border border-white/5 bg-slate-900"
                  style={{
                    background: `linear-gradient(135deg, rgba(96, 165, 250, ${Math.max(intensity, 0.08)}) 0%, rgba(168, 85, 247, ${Math.max(intensity / 1.5, 0.05)}) 100%)`,
                  }}
                >
                  <div className="text-center text-[0.65rem] font-semibold text-slate-100">
                    {value || ''}
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function InventoryBar({ data }: { data: { id: string; name: string; quantity: number; threshold: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.quantity));
  const sorted = [...data].sort((a, b) => a.quantity - b.quantity);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Inventory snapshot</span>
        <span>Units on hand</span>
      </div>
      <div className="space-y-2">
        {sorted.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="truncate">{item.name}</span>
              <span className={item.quantity <= item.threshold ? 'text-aurora-amber' : 'text-slate-400'}>
                {item.quantity}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber"
                style={{ width: `${Math.min(100, (item.quantity / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data = await fetchDashboardData();

  const aiSummary = await fetchAiSummary(
    `Provide a short insight summarizing revenue ${data.totals.revenue.toFixed(2)}, ` +
      `average order value ${data.totals.averageOrderValue.toFixed(2)}, recovery rate ${data.totals.recoveryRate.toFixed(1)}%, ` +
      `${Object.keys(data.loginMatrix).length} day login matrix and inventory counts ${data.inventory
        .map((item) => `${item.name}:${item.quantity}`)
        .join(', ')}.`,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total revenue</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{formatCurrency(data.totals.revenue)}</p>
          <p className="mt-1 text-xs text-slate-400">Average order value {formatCurrency(data.totals.averageOrderValue)}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{data.totals.orders}</p>
          <p className="mt-1 text-xs text-slate-400">Recovery rate {data.totals.recoveryRate.toFixed(1)}%</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Users</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{data.totals.users}</p>
          <p className="mt-1 text-xs text-slate-400">Active logins tracked in the past 7 days.</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI insight</p>
          <p className="mt-2 text-sm text-slate-300">
            {aiSummary ?? 'Assistant service unavailable. Metrics can be reviewed manually below.'}
          </p>
        </GlassCard>
      </div>

      <GlassCard>
        <LoginHeatmap matrix={data.loginMatrix} />
      </GlassCard>

      <GlassCard>
        <InventoryBar data={data.inventory} />
      </GlassCard>
    </div>
  );
}
