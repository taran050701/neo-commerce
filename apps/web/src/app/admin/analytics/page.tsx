import { Suspense } from 'react';
import { formatCurrency } from '@/utils/currency';
import { GlassCard } from '@/components/shared/glass-card';
import { fetchDashboardData } from '@/app/admin/dashboard/page';

async function MetricsOverview() {
  const data = await fetchDashboardData();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Revenue (all time)</p>
        <p className="mt-2 text-3xl font-semibold text-slate-100">{formatCurrency(data.totals.revenue)}</p>
        <p className="mt-1 text-xs text-slate-400">Average order value: {formatCurrency(data.totals.averageOrderValue)}</p>
      </GlassCard>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
        <p className="mt-2 text-3xl font-semibold text-slate-100">{data.totals.orders}</p>
        <p className="mt-1 text-xs text-slate-400">Recovered carts: {data.totals.recoveryRate.toFixed(1)}%</p>
      </GlassCard>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Users</p>
        <p className="mt-2 text-3xl font-semibold text-slate-100">{data.totals.users}</p>
        <p className="mt-1 text-xs text-slate-400">Login events tracked in last 7 days.</p>
      </GlassCard>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory signals</p>
        <p className="mt-2 text-3xl font-semibold text-slate-100">{data.inventory.filter((item) => item.quantity <= item.threshold).length}</p>
        <p className="mt-1 text-xs text-slate-400">Products at or below threshold.</p>
      </GlassCard>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Analytics</h2>
        <p className="text-sm text-slate-400">
          Deep dives into commerce performance. Funnel breakdowns and anomaly detection will layer onto this workspace.
        </p>
      </div>
      <Suspense fallback={<GlassCard>Loading metrics…</GlassCard>}>
        {/* @ts-expect-error Async Server Component */}
        <MetricsOverview />
      </Suspense>
      <GlassCard className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Next up</h3>
        <p className="text-sm text-slate-300">
          Add cohort retention charts, assistant response quality scoring, and export tools for CSV or BI integrations.
        </p>
      </GlassCard>
    </div>
  );
}
