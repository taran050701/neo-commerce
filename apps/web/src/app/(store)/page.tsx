import { Metadata } from 'next';
import Link from 'next/link';
import { getFeaturedProducts, getTrendingProducts } from '@/server/products/queries';
import { ProductGrid } from '@/components/commerce/product-grid';
import { GlassCard } from '@/components/shared/glass-card';
import { PrimaryCTA } from '@/components/shared/primary-cta';

export const metadata: Metadata = {
  title: 'NEO•Commerce — Futuristic Storefront',
};

export default async function StorefrontPage() {
  const [featured, trending] = await Promise.all([getFeaturedProducts(), getTrendingProducts()]);

  return (
    <div className="flex flex-col gap-12">
      <section className="grid gap-10 md:grid-cols-[3fr,2fr]">
        <GlassCard className="relative overflow-hidden">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.65em] text-slate-400">Welcome to the future</p>
              <h1 className="text-4xl font-semibold md:text-5xl">
                AI-native commerce that responds before customers ask.
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                Discover immersive product drops, personalised bundles, and an AI assistant that knows your order history, wishlist, and tickets—without ever leaving the page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <PrimaryCTA href="/categories/wearables">Explore the catalog</PrimaryCTA>
              <Link href="/admin/dashboard" className="text-sm text-slate-300 underline-offset-4 hover:underline">
                Learn about our engine
              </Link>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Assistant snapshot</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>• Hybrid semantic + pgvector search across specs, reviews, and FAQs.</li>
            <li>• Cart recovery nudges, coupon experiments, and sentiment-tagged transcripts.</li>
            <li>• Edge-cached analytics streaming into admin dashboards.</li>
          </ul>
        </GlassCard>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-100">Featured drops</h2>
          <Link href="/categories/wearables" className="text-sm text-aurora-teal underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={featured} emptyMessage="Featured products are coming online soon." />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-100">Trending now</h2>
          <Link href="/categories/all" className="text-sm text-aurora-teal underline-offset-4 hover:underline">
            Browse catalog
          </Link>
        </div>
        <ProductGrid products={trending} emptyMessage="Trending products will appear once analytics sync." />
      </section>
    </div>
  );
}
