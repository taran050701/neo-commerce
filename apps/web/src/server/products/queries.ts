import { cache } from 'react';
import { db } from '@/server/db';
import { ProductForListing, ProductWithDetails } from '@/types/commerce';

function serializeListing(product: any): ProductForListing {
  return {
    ...product,
    prices: product.prices.map((price: any) => ({
      ...price,
      amount: Number(price.amount ?? 0),
    })),
    reviews: product.reviews?.map((review: any) => ({ rating: review.rating ?? 0 })) ?? [],
  };
}

function serializeDetails(product: any): ProductWithDetails {
  return {
    ...product,
    prices: product.prices.map((price: any) => ({
      ...price,
      amount: Number(price.amount ?? 0),
    })),
    reviews: product.reviews?.map((review: any) => ({ ...review })) ?? [],
  };
}

export const getFeaturedProducts = cache(async (): Promise<ProductForListing[]> => {
  const products = await db.product.findMany({
    where: { featured: true },
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' } },
      reviews: { select: { rating: true } },
    },
    take: 8,
  });
  return products.map(serializeListing);
});

export const getTrendingProducts = cache(async (): Promise<ProductForListing[]> => {
  const products = await db.product.findMany({
    orderBy: { popularity: 'desc' },
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' } },
      reviews: { select: { rating: true } },
    },
    take: 8,
  });
  return products.map(serializeListing);
});

export const getProductBySlug = cache(async (slug: string): Promise<ProductWithDetails | null> => {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' } },
      inventory: { select: { quantity: true } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 12 },
    },
  });
  return product ? serializeDetails(product) : null;
});

export const getProductsByCategory = cache(async (slug: string): Promise<ProductForListing[]> => {
  const products = await db.product.findMany({
    where: { category: { slug } },
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' } },
      reviews: { select: { rating: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return products.map(serializeListing);
});

export async function getSimilarProducts(productId: string) {
  const products = await db.product.findMany({
    where: {
      id: { not: productId },
    },
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' } },
      reviews: { select: { rating: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 4,
  });
  return products.map(serializeListing);
}

export const getAllProducts = cache(async (): Promise<ProductForListing[]> => {
  const products = await db.product.findMany({
    include: {
      category: true,
      prices: { where: { active: true }, orderBy: { amount: 'asc' } },
      reviews: { select: { rating: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return products.map(serializeListing);
});
