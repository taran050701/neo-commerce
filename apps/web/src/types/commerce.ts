import type { Product, Category, Review, Price } from '@prisma/client';

type Relation<T> = T | null;

type SerializedPrice = Omit<Price, 'amount'> & { amount: number };

type WithCategory = Product & { category: Relation<Category> };
type WithPricing = Omit<WithCategory, 'prices'> & { prices: SerializedPrice[] };

export type ProductForListing = WithPricing & {
  reviews: Array<Pick<Review, 'rating'>>;
};

export type ProductWithDetails = WithPricing & {
  inventory?: { quantity: number } | null;
  reviews: Array<Omit<Review, 'createdAt'> & { createdAt: Date }>;
};

export type CategoryWithProducts = Category & {
  products: ProductForListing[];
};
