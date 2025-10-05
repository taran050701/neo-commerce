import { revalidatePath } from 'next/cache';
import { db } from '@/server/db';
import { auth } from '@/server/auth';
import { GlassCard } from '@/components/shared/glass-card';
import { formatCurrency } from '@/utils/currency';

async function restockProduct(formData: FormData) {
  'use server';

  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const productId = String(formData.get('productId') ?? '');
  const quantity = Number(formData.get('quantity') ?? 0);

  if (!productId || Number.isNaN(quantity) || quantity <= 0) {
    return;
  }

  await db.inventory.update({
    where: { productId },
    data: {
      quantity: { increment: quantity },
    },
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
}

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' }, take: 1 },
      inventory: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 24,
  });

  const serialized = products.map((product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description ?? 'No description yet.',
    price: Number(product.prices[0]?.amount ?? 0),
    category: product.category?.name ?? 'Unassigned',
    quantity: product.inventory?.quantity ?? 0,
    threshold: product.inventory?.threshold ?? 5,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-100">Product catalog</h2>
      <p className="text-sm text-slate-400">
        Monitor inventory levels and trigger restocks. Low inventory cards highlight when levels fall below the configured threshold.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {serialized.map((product) => {
          const lowStock = product.quantity <= product.threshold;
          return (
            <GlassCard key={product.id} className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-slate-100">{product.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">SKU {product.sku}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{product.category}</span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-3">{product.description}</p>
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>{formatCurrency(product.price)}</span>
                <span className={lowStock ? 'text-aurora-amber' : 'text-slate-400'}>
                  Stock {product.quantity}
                </span>
              </div>
              <form action={restockProduct} className="mt-auto flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <input type="hidden" name="productId" value={product.id} />
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Add units to inventory
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={product.threshold}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-aurora-violet to-aurora-teal px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/20 hover:opacity-95"
                >
                  Restock
                </button>
              </form>
            </GlassCard>
          );
        })}
        {!serialized.length && <GlassCard>No products found. Seed the database to get started.</GlassCard>}
      </div>
    </div>
  );
}
