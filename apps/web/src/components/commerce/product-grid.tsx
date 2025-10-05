import { ProductForListing } from '@/types/commerce';
import { ProductCard } from '@/components/commerce/product-card';

interface ProductGridProps {
  products: ProductForListing[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-white/20">
        <p className="text-sm text-slate-400">{emptyMessage ?? 'No products available.'}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
