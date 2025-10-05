import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { stripe } from '@/lib/stripe';
import { db } from '@/server/db';

type CartWithItems = Awaited<ReturnType<typeof fetchCartById>>;

async function fetchCartById(cartId: string) {
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
    },
  });
}

async function finalizeWithoutStripe(cart: NonNullable<CartWithItems>, email: string, address: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  let userId = cart.userId ?? null;
  const customerEmail = email || cart.email || `guest-${cart.id}@example.com`;
  if (!userId) {
    const existing = await db.user.findUnique({ where: { email: customerEmail } });
    if (existing) {
      userId = existing.id;
    } else {
      const created = await db.user.create({
        data: {
          email: customerEmail,
          role: 'USER',
        },
      });
      userId = created.id;
    }
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    const price = Number(item.product?.prices?.[0]?.amount ?? 0);
    return sum + price * item.quantity;
  }, 0);

  await db.order.create({
    data: {
      userId,
      status: 'paid',
      currency: cart.currency,
      totalAmount: new Prisma.Decimal(totalAmount),
      shippingInfo: address ? { address } : null,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitAmount: new Prisma.Decimal(Number(item.product?.prices?.[0]?.amount ?? 0)),
        })),
      },
    },
  });

  await db.cart.update({
    where: { id: cart.id },
    data: {
      status: 'recovered',
      recoveryRedeemedAt: new Date(),
      email: customerEmail,
    },
  });

  return NextResponse.redirect(`${baseUrl.replace(/\/$/, '')}/orders?status=success`, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const cartId = String(form.get('cartId') ?? '');
  const email = String(form.get('email') ?? '');
  const addressField = form.get('address');
  const addressId = String(form.get('addressId') ?? '').trim();
  const cardId = String(form.get('cardId') ?? '').trim();

  if (!cartId || !email) {
    return NextResponse.json({ error: 'Missing cartId or email' }, { status: 400 });
  }

  const cart = await fetchCartById(cartId);

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart empty' }, { status: 400 });
  }

  let shippingAddress = typeof addressField === 'string' ? addressField.trim() : '';

  if (!shippingAddress && addressId) {
    const savedAddress = await db.userAddress.findUnique({ where: { id: addressId } });
    if (savedAddress && (!cart.userId || savedAddress.userId === cart.userId)) {
      shippingAddress = [
        savedAddress.line1,
        savedAddress.line2,
        `${savedAddress.city}${savedAddress.state ? `, ${savedAddress.state}` : ''} ${savedAddress.postalCode}`.trim(),
        savedAddress.country,
      ]
        .filter(Boolean)
        .join('\n');
    }
  }

  let savedCardMeta: Record<string, string> | undefined;
  if (cardId) {
    const savedCard = await db.paymentMethod.findUnique({ where: { id: cardId } });
    if (savedCard && (!cart.userId || savedCard.userId === cart.userId)) {
      savedCardMeta = {
        savedCardId: savedCard.id,
        savedCardBrand: savedCard.brand,
        savedCardLast4: savedCard.last4,
      };
    }
  }

  if (!stripe) {
    return finalizeWithoutStripe(cart, email, shippingAddress || null);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const lineItems = cart.items.map((item) => {
    const price = Number(item.product.prices[0]?.amount ?? 0) * 100;
    return {
      quantity: item.quantity,
      price_data: {
        currency: cart.currency,
        unit_amount: Math.round(price),
        product_data: {
          name: item.product.name,
        },
      },
    };
  });

  const metadata: Record<string, string> = { cartId };
  if (addressId) {
    metadata.savedAddressId = addressId;
  }
  if (savedCardMeta) {
    Object.assign(metadata, savedCardMeta);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: lineItems,
    success_url: `${baseUrl.replace(/\/$/, '')}/orders?status=success`,
    cancel_url: `${baseUrl.replace(/\/$/, '')}/cart`,
    metadata,
  });

  return NextResponse.redirect(session.url ?? '/cart', 303);
}
