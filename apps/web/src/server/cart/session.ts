import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { db } from '@/server/db';

const CART_COOKIE = 'neo_cart_id';

export async function getCartId() {
  return cookies().get(CART_COOKIE)?.value ?? null;
}

export async function ensureCartCookie() {
  const store = cookies();
  let cartId = store.get(CART_COOKIE)?.value;
  if (cartId) {
    const existing = await db.cart.findUnique({ where: { id: cartId } });
    if (existing) {
      return cartId;
    }
  }

  cartId = randomUUID();
  await db.cart.create({ data: { id: cartId } });
  store.set(CART_COOKIE, cartId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
  return cartId;
}

export async function getCart(cartId: string | null) {
  if (!cartId) {
    return null;
  }
  return db.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: {
              prices: { where: { active: true }, orderBy: { amount: 'asc' }, take: 1 },
            },
          },
        },
      },
      coupon: true,
    },
  });
}
