import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { GlassCard } from '@/components/shared/glass-card';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

type Status = (typeof STATUSES)[number];
type Priority = (typeof PRIORITIES)[number];

export default async function AdminTicketsPage() {
  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const metrics = STATUSES.map((status) => ({
    status,
    count: tickets.filter((ticket) => ticket.status === status).length,
  }));

  async function createTicket(formData: FormData) {
    'use server';

    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const priority = (String(formData.get('priority') ?? 'normal') as Priority) ?? 'normal';

    if (!email || !subject) {
      return;
    }

    await db.ticket.create({
      data: {
        email,
        subject,
        priority,
        status: 'open',
        sentiment: formData.get('sentiment') ? String(formData.get('sentiment')) : null,
        assignedTo: formData.get('assignedTo') ? String(formData.get('assignedTo')) : null,
      },
    });

    await revalidatePath('/admin/tickets');
  }

  async function updateTicket(formData: FormData) {
    'use server';

    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const id = String(formData.get('id') ?? '');
    const status = String(formData.get('status') ?? '') as Status;
    const priority = String(formData.get('priority') ?? '') as Priority;
    const assignedTo = String(formData.get('assignedTo') ?? '').trim() || null;

    if (!id || !STATUSES.includes(status) || !PRIORITIES.includes(priority)) {
      return;
    }

    await db.ticket.update({
      where: { id },
      data: {
        status,
        priority,
        assignedTo,
      },
    });

    await revalidatePath('/admin/tickets');
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <GlassCard className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Ticketing desk</h2>
            <p className="text-sm text-slate-400">
              Log escalations from chat or assistant fallbacks and assign them to your support pod.
            </p>
          </div>
          <form action={createTicket} className="space-y-4">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Customer email
              <input
                name="email"
                type="email"
                required
                placeholder="customer@example.com"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Subject
              <input
                name="subject"
                required
                placeholder="Refund request for Aurora Drone"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Priority
                <select
                  name="priority"
                  defaultValue="normal"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                >
                  {PRIORITIES.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Sentiment
                <input
                  name="sentiment"
                  placeholder="negative"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                />
              </label>
            </div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Assign to agent
              <input
                name="assignedTo"
                placeholder="agent@demo.dev"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/30"
            >
              Create ticket
            </button>
          </form>
        </GlassCard>
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Live queue</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Last 50 tickets</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {metrics.map((item) => (
              <span key={item.status} className="rounded-full border border-white/10 px-3 py-1">
                {item.status} · {item.count}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-100">{ticket.subject}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-aurora-teal">{ticket.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Created {new Date(ticket.createdAt).toLocaleString()}</p>
                    <p>Updated {new Date(ticket.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <form action={updateTicket} className="mt-4 grid gap-3 sm:grid-cols-4">
                  <input type="hidden" name="id" value={ticket.id} />
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Status
                    <select
                      name="status"
                      defaultValue={ticket.status as Status}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Priority
                    <select
                      name="priority"
                      defaultValue={ticket.priority as Priority}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                    >
                      {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Assigned
                    <input
                      name="assignedTo"
                      defaultValue={ticket.assignedTo ?? ''}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-teal px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/20 hover:opacity-95"
                    >
                      Save
                    </button>
                  </div>
                </form>
                {ticket.sentiment && (
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">Sentiment: {ticket.sentiment}</p>
                )}
              </div>
            ))}
            {!tickets.length && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                No tickets logged yet. Use the form to capture an escalation.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
