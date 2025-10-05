import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { GlassCard } from '@/components/shared/glass-card';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64);
}

export default async function AdminKnowledgeBasePage() {
  const articles = await db.kBArticle.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 24,
  });

  async function createArticle(formData: FormData) {
    'use server';

    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const title = String(formData.get('title') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim() || 'general';
    const body = String(formData.get('body') ?? '').trim();

    if (!title || !body) {
      return;
    }

    let slug = slugify(title);
    if (!slug) {
      slug = `kb-${Date.now()}`;
    }

    const existing = await db.kBArticle.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    await db.kBArticle.create({
      data: {
        slug: finalSlug,
        title,
        category,
        body,
        metadata: {
          createdBy: session.user.id,
          createdAt: new Date().toISOString(),
        },
      },
    });

    await revalidatePath('/admin/kb');
  }

  async function deleteArticle(formData: FormData) {
    'use server';

    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const id = String(formData.get('id') ?? '');
    if (!id) return;

    await db.kBArticle.delete({ where: { id } });
    await revalidatePath('/admin/kb');
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <GlassCard className="h-full space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Knowledge base</h2>
            <p className="text-sm text-slate-400">
              Publish articles that the AI assistant and support agents can reference instantly.
            </p>
          </div>
          <form action={createArticle} className="space-y-4">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Title
              <input
                type="text"
                name="title"
                required
                placeholder="How do refunds work?"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Category
              <input
                type="text"
                name="category"
                placeholder="returns"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Body
              <textarea
                name="body"
                required
                rows={6}
                placeholder="Outline the policy, timelines, and escalation contacts."
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/30"
            >
              Publish article
            </button>
          </form>
        </GlassCard>
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Library</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{articles.length} entries</p>
            </div>
          </div>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-100">{article.title}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-aurora-teal">{article.category}</p>
                  </div>
                  <form action={deleteArticle}>
                    <input type="hidden" name="id" value={article.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400 hover:border-aurora-amber/60 hover:text-aurora-amber"
                    >
                      Remove
                    </button>
                  </form>
                </div>
                <p className="mt-2 line-clamp-3 text-slate-300">{article.body}</p>
                <p className="mt-3 text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Updated {article.updatedAt.toLocaleDateString()} · slug {article.slug}
                </p>
              </div>
            ))}
            {!articles.length && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                No articles yet. Use the form to publish your first knowledge base entry.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
