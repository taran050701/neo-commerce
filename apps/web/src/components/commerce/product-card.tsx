'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductForListing } from '@/types/commerce';
import { formatCurrency } from '@/utils/currency';
import { NeoBadge } from '@neo/ui';

interface ProductCardProps {
  product: ProductForListing;
}

function averageRating(product: ProductForListing) {
  if (!product.reviews?.length) return 0;
  const sum = product.reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0);
  return Math.round((sum / product.reviews.length) * 10) / 10;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.prices[0]?.amount ?? 0;
  const rating = averageRating(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-glass backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-1 hover:border-aurora-teal/60"
    >
      {product.heroImageUrl && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={product.heroImageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="uppercase tracking-[0.3em]">{product.brand ?? 'Neo'}</span>
          {product.featured && <NeoBadge tone="success">Featured</NeoBadge>}
        </div>
        <h3 className="text-lg font-semibold text-slate-100">{product.name}</h3>
        <p className="text-sm text-slate-300 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-2 text-sm text-slate-200">
          <span>{formatCurrency(Number(price))}</span>
          <span>{rating ? `${rating} ★` : 'New'}</span>
        </div>
      </div>
    </Link>
  );
}
