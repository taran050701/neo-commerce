import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { getCartId, getCart } from '@/server/cart/session';
import { formatCurrency } from '@/utils/currency';

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in?callbackUrl=/checkout');
  }
  const cartId = await getCartId();
  const cart = await getCart(cartId);

  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  const defaultAddressRecord = await db.userAddress.findFirst({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
  });

  const initialAddress = defaultAddressRecord
    ? [
        defaultAddressRecord.line1,
        defaultAddressRecord.line2,
        `${defaultAddressRecord.city}${defaultAddressRecord.state ? `, ${defaultAddressRecord.state}` : ''} ${defaultAddressRecord.postalCode}`.trim(),
        defaultAddressRecord.country,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const addresses = await db.userAddress.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc', createdAt: 'desc' },
  });

  const paymentMethods = await db.paymentMethod.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc', createdAt: 'desc' },
  });

  const defaultAddress = addresses[0] ?? defaultAddressRecord ?? null;
  const defaultPayment = paymentMethods[0] ?? null;

  const maskedCardNumber = defaultPayment ? `•••• •••• •••• ${defaultPayment.last4}` : '';
  const defaultCardName = defaultPayment ? defaultPayment.brand.toUpperCase() : '';
  const defaultCardExpiry = defaultPayment
    ? `${String(defaultPayment.expMonth).padStart(2, '0')}/${String(defaultPayment.expYear).slice(-2)}`
    : '';

  const subtotal = cart.items.reduce((acc, item) => {
    const amount = Number(item.product.prices[0]?.amount ?? 0);
    return acc + amount * item.quantity;
  }, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glass">
        <h1 className="text-2xl font-semibold text-slate-100">Secure checkout</h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter your details, confirm shipping, and let Stripe handle encrypted payments. AI assistant summaries accompany Stripe receipts for full context.
        </p>
        <form className="mt-6 space-y-5" action="/api/checkout/session" method="post">
          <input type="hidden" name="cartId" value={cart.id} />
          <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">
            Email
            <input
              name="email"
              required
              defaultValue={session?.user?.email ?? ''}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
            />
          </label>
          {addresses.length > 1 && (
            <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">
              Use saved address
              <select
                name="addressId"
                defaultValue={defaultAddress?.id ?? ''}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {(address.label ?? 'Saved')} • {address.city}
                  </option>
                ))}
                <option value="">New address</option>
              </select>
            </label>
          )}
          <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">
            Address
            <textarea
              name="address"
              required
              placeholder="123 Aurora Way, Neo City"
              defaultValue={initialAddress}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
            />
          </label>
          <fieldset className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <legend className="px-2 text-xs uppercase tracking-[0.3em] text-slate-500">Payment method</legend>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input type="radio" name="paymentMethod" value="card" defaultChecked className="h-4 w-4" />
              Credit / Debit Card
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input type="radio" name="paymentMethod" value="upi" className="h-4 w-4" />
              UPI / Wallet (coming soon)
            </label>
          </fieldset>
          {paymentMethods.length > 0 && (
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Use saved card
              <select
                name="cardId"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              >
                <option value="">New card</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.brand.toUpperCase()} •••• {method.last4} ({String(method.expMonth).padStart(2, '0')}/{method.expYear})
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4 sm:grid-cols-2">
            <label className="sm:col-span-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              Name on card
              <input
                name="cardName"
                required
                placeholder="Taran Rajpal"
                defaultValue={defaultCardName}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              Card number
              <input
                name="cardNumber"
                required
                inputMode="numeric"
                maxLength={19}
                placeholder="4242 4242 4242 4242"
                defaultValue={maskedCardNumber}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Expiry (MM/YY)
              <input
                name="cardExpiry"
                required
                placeholder="09/28"
                defaultValue={defaultCardExpiry}
                pattern="^(0[1-9]|1[0-2])\/(\d{2})$"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              CVC
              <input
                name="cardCvc"
                required
                inputMode="numeric"
                maxLength={4}
                placeholder="123"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/30"
          >
            Proceed to Stripe
          </button>
        </form>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-glass">
        <h2 className="text-lg font-semibold text-slate-100">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span>
                {item.product.name} · <span className="text-xs text-slate-500">{item.quantity} ×</span>
              </span>
              <span>{formatCurrency(Number(item.product.prices[0]?.amount ?? 0) * item.quantity, cart.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, cart.currency)}</span>
        </div>
      </div>
    </div>
  );
}
