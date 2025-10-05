import { Metadata } from 'next';
import { getCartId, getCart } from '@/server/cart/session';
import { CartItemsClient } from '@/components/commerce/cart-items-client';

export const metadata: Metadata = {
  title: 'Cart',
};

export default async function CartPage() {
  const cartId = await getCartId();
  const cart = await getCart(cartId);
  const items = (cart?.items ?? []).map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    name: item.product?.name ?? 'Item',
    price: Number(item.product?.prices?.[0]?.amount ?? 0),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-100">Your cart</h1>
      <CartItemsClient initialItems={items} currency={cart?.currency ?? 'usd'} />
    </div>
  );
}
