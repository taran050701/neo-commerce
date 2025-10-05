import { notFound } from 'next/navigation';
import { getAllProducts, getProductsByCategory } from '@/server/products/queries';
import { ProductGrid } from '@/components/commerce/product-grid';

const VALID_CATEGORIES = ['wearables', 'smart-home', 'mobility'];

type Props = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: Props) {
  const slug = params.slug.toLowerCase();
  if (slug !== 'all' && !VALID_CATEGORIES.includes(slug)) {
    return notFound();
  }

  const products = slug === 'all' ? await getAllProducts() : await getProductsByCategory(slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold capitalize">{slug.replace('-', ' ')} drops</h1>
          <p className="text-sm text-slate-300">
            Semantic search + pgvector filtering hydrates this grid from Supabase at runtime.
          </p>
        </div>
      </div>
      <ProductGrid products={products} emptyMessage="Inventory coming soon. Upload via Admin → Products." />
    </div>
  );
}
