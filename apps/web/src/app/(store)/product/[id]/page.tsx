import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, getSimilarProducts } from '@/server/products/queries';
import { ProductGrid } from '@/components/commerce/product-grid';
import { PrimaryCTA } from '@/components/shared/primary-cta';
import { AddToCartButton } from '@/components/commerce/add-to-cart-button';
import { formatCurrency } from '@/utils/currency';

export const metadata: Metadata = {
  title: 'Product details',
};

type Props = {
  params: { id: string };
};

export default async function ProductPage({ params }: Props) {
  const { id } = params;
  const product = await getProductBySlug(id);
  if (!product) {
    return notFound();
  }
  const similar = await getSimilarProducts(product.id);
  const price = Number(product.prices[0]?.amount ?? 0);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-10 lg:grid-cols-[3fr,2fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-glass">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.brand ?? 'Neo'}</p>
                <h1 className="text-4xl font-semibold text-slate-100">{product.name}</h1>
              </div>
              <p className="text-sm text-slate-300">{product.description}</p>
              {product.gallery && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {product.gallery.slice(0, 2).map((url: string, index: number) => (
                    <div key={url} className="relative h-48 overflow-hidden rounded-2xl">
                      <Image src={`${url}?auto=format&fit=crop&w=600&q=80`} alt={`Gallery ${index}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {product.specs && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-glass">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Specifications</h2>
              <dl className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                {Object.entries(product.specs as Record<string, unknown>).map(([key, value]) => (
                  <div key={key}>
                    <dt className="uppercase tracking-[0.25em] text-xs text-slate-500">{key}</dt>
                    <dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glass">
            <p className="text-sm text-slate-300">Pricing</p>
            <p className="text-3xl font-semibold text-slate-100">{formatCurrency(price)}</p>
            {product.inventory && (
              <p className="text-xs text-slate-400">Stock: {product.inventory.quantity} units</p>
            )}
            <AddToCartButton productId={product.id} />
            <PrimaryCTA href="/cart" className="mt-3 inline-flex w-full justify-center">
              Go to cart
            </PrimaryCTA>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-glass">
            <h2 className="text-lg font-semibold text-slate-100">Customer reviews</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {product.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-aurora-teal">{review.rating} ★</p>
                  <p className="font-medium text-slate-100">{review.title}</p>
                  <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-slate-300">{review.body}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-100">Similar vibes</h2>
        <ProductGrid products={similar} emptyMessage="We will surface similar drops once embeddings sync." />
      </section>
    </div>
  );
}
