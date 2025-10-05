import { NextResponse } from 'next/server';
import { createRecoveryToken } from '@/server/cart/recovery';
import { db } from '@/server/db';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const tokenPayload = auth.split(' ')[1];
  if (tokenPayload !== process.env.RECOVERY_CRON_SECRET) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const abandonedCarts = await db.cart.findMany({
    where: {
      status: 'active',
      updatedAt: {
        lt: new Date(Date.now() - 1000 * 60 * 60),
      },
      recoveryToken: null,
    },
    include: {
      items: { include: { product: true } },
    },
    take: 25,
  });

  const payload = [];
  for (const cart of abandonedCarts) {
    if (!cart.email) continue;
    const token = await createRecoveryToken(cart.id);
    payload.push({
      email: cart.email,
      deepLink: `${process.env.NEXT_PUBLIC_APP_URL}/recover/${token}`,
      items: cart.items.map((item) => ({ name: item.product.name, quantity: item.quantity })),
    });
  }

  // TODO: send payload to Resend / Stripe customer portal integration.

  return NextResponse.json({ processed: payload.length });
}
