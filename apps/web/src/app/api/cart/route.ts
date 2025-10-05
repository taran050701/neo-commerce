import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { ensureCartCookie, getCartId, getCart } from '@/server/cart/session';

export async function GET() {
  const cartId = await ensureCartCookie();
  const cart = await getCart(cartId);
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const cartId = await ensureCartCookie();
  let productId: string | null = null;
  let quantity = 1;
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const payload = await request.json().catch(() => ({}));
    productId = payload.productId ?? null;
    quantity = Number(payload.quantity ?? 1);
  } else {
    const form = await request.formData();
    productId = String(form.get('productId') ?? '');
    quantity = Number(form.get('quantity') ?? 1);
  }

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  await db.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId,
      productId,
      quantity,
    },
  });

  const cart = await getCart(cartId);
  return NextResponse.json(cart, { status: 201 });
}

export async function PATCH(request: Request) {
  const cartId = await getCartId();
  const { productId, quantity } = await request.json();
  if (!productId || typeof quantity !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { cartId, productId } });
  } else {
    await db.cartItem.updateMany({ where: { cartId, productId }, data: { quantity } });
  }
  const cart = await getCart(cartId);
  return NextResponse.json(cart);
}

export async function DELETE(request: Request) {
  const cartId = await getCartId();
  if (!cartId) {
    return NextResponse.json({ error: 'Cart not initialised' }, { status: 400 });
  }
  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  await db.cartItem.deleteMany({ where: { cartId, productId } });
  const cart = await getCart(cartId);
  return NextResponse.json(cart);
}
