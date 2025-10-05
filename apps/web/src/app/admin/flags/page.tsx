import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { setFeatureFlag } from '@/server/flags/manager';
import { GlassCard } from '@/components/shared/glass-card';

const FEATURE_FLAGS = [
  {
    key: 'FEATURE_SENTIMENT',
    label: 'Sentiment analysis',
    description: 'Toggle assistant sentiment scoring and customer escalation rules.',
  },
  {
    key: 'FEATURE_TICKETING',
    label: 'Ticket automation',
    description: 'Auto-create support tickets and route to the agent queue when confidence dips.',
  },
  {
    key: 'FEATURE_RERANKER',
    label: 'Cross-encoder reranker',
    description: 'Use the Python service to rerank FAQ hits for sharper answers.',
  },
] as const;

type FlagKey = (typeof FEATURE_FLAGS)[number]['key'];

type FlagState = {
  key: FlagKey;
  enabled: boolean;
  updatedAt?: Date;
  updatedBy?: string | null;
};

export default async function AdminFeatureFlagsPage() {
  const storedFlags = await db.featureFlag.findMany({
    where: { key: { in: FEATURE_FLAGS.map((flag) => flag.key) } },
  });

  const envDefaults = FEATURE_FLAGS.reduce<Record<FlagKey, boolean>>((acc, flag) => {
    const raw = (process.env[flag.key] ?? '').toString().toLowerCase();
    acc[flag.key] = raw === 'true';
    return acc;
  }, {} as Record<FlagKey, boolean>);

  const currentStates: Record<FlagKey, FlagState> = FEATURE_FLAGS.reduce((acc, flag) => {
    const record = storedFlags.find((item) => item.key === flag.key);
    const value = typeof record?.value === 'object' && record?.value !== null && 'enabled' in (record.value as any)
      ? Boolean((record.value as any).enabled)
      : envDefaults[flag.key];
    acc[flag.key] = {
      key: flag.key,
      enabled: value,
      updatedAt: record?.updatedAt,
      updatedBy: record?.updatedBy ?? null,
    };
    return acc;
  }, {} as Record<FlagKey, FlagState>);

  async function handleToggle(formData: FormData) {
    'use server';

    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const key = String(formData.get('key')) as FlagKey;
    const value = String(formData.get('value')) === 'true';

    await setFeatureFlag(key, { enabled: value }, 'global', session.user.id);
    await revalidatePath('/admin/flags');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Feature flags</h2>
        <p className="text-sm text-slate-400">
          Flip AI and commerce features without redeploys. Changes persist to the feature flag table instantly.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURE_FLAGS.map((flag) => {
          const state = currentStates[flag.key];
          const nextValue = (!state.enabled).toString();
          return (
            <GlassCard key={flag.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-100">{flag.label}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{flag.key}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    state.enabled
                      ? 'border-aurora-teal/70 text-aurora-teal'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  {state.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-slate-300">{flag.description}</p>
              <form action={handleToggle} className="space-y-2">
                <input type="hidden" name="key" value={flag.key} />
                <input type="hidden" name="value" value={nextValue} />
                <button
                  type="submit"
                  className={`w-full rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition-colors ${
                    state.enabled
                      ? 'bg-white/5 text-slate-200 hover:bg-aurora-amber/20'
                      : 'bg-gradient-to-r from-aurora-violet to-aurora-teal text-slate-900 hover:opacity-95'
                  }`}
                >
                  {state.enabled ? 'Disable feature' : 'Enable feature'}
                </button>
              </form>
              {state.updatedAt && (
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Updated {state.updatedAt.toLocaleString()} {state.updatedBy ? `by ${state.updatedBy}` : ''}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
