import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { GlassCard } from '@/components/shared/glass-card';

const BRAND_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'visa', regex: /^4\d{12}(?:\d{3})?$/ },
  {
    name: 'mastercard',
    regex: /^(5[1-5]\d{14}|2(2[2-9]\d{2}|[3-6]\d{3}|7[01]\d{2}|720\d{2})\d{10})$/,
  },
  { name: 'amex', regex: /^3[47]\d{13}$/ },
  { name: 'discover', regex: /^6(?:011|5\d{2})\d{12}$/ },
];

function detectBrand(cardNumber: string): string {
  const trimmed = cardNumber.replace(/\s+/g, '');
  const match = BRAND_PATTERNS.find((entry) => entry.regex.test(trimmed));
  return match?.name ?? 'card';
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const [addresses, paymentMethods] = await Promise.all([
    db.userAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    db.paymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  async function saveAddress(formData: FormData) {
    'use server';

    const authSession = await auth();
    if (!authSession?.user?.id) {
      redirect('/auth/sign-in');
    }

    const line1 = String(formData.get('line1') ?? '').trim();
    if (!line1) {
      return;
    }

    const address = {
      userId: authSession.user.id,
      label: String(formData.get('label') ?? '').trim() || null,
      line1,
      line2: String(formData.get('line2') ?? '').trim() || null,
      city: String(formData.get('city') ?? '').trim(),
      state: String(formData.get('state') ?? '').trim() || null,
      postalCode: String(formData.get('postalCode') ?? '').trim(),
      country: String(formData.get('country') ?? '').trim() || 'USA',
      isDefault: formData.get('isDefault') === 'on',
    };

    const created = await db.userAddress.create({ data: address });

    if (address.isDefault) {
      await db.userAddress.updateMany({
        where: { userId: authSession.user.id, id: { not: created.id } },
        data: { isDefault: false },
      });
    }

    revalidatePath('/account');
  }

  async function promoteAddress(addressId: string) {
    'use server';

    const authSession = await auth();
    if (!authSession?.user?.id) {
      redirect('/auth/sign-in');
    }

    await db.userAddress.updateMany({
      where: { userId: authSession.user.id },
      data: { isDefault: false },
    });
    await db.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
    revalidatePath('/account');
  }

  async function deleteAddress(addressId: string) {
    'use server';

    const authSession = await auth();
    if (!authSession?.user?.id) {
      redirect('/auth/sign-in');
    }

    await db.userAddress.delete({ where: { id: addressId } });
    revalidatePath('/account');
  }

  async function savePayment(formData: FormData) {
    'use server';

    const authSession = await auth();
    if (!authSession?.user?.id) {
      redirect('/auth/sign-in');
    }

    const rawNumber = String(formData.get('cardNumber') ?? '').replace(/\s+/g, '');
    if (rawNumber.length < 12) {
      return;
    }

    const brand = detectBrand(rawNumber);
    const last4 = rawNumber.slice(-4);
    const exp = String(formData.get('expiry') ?? '').trim();
    const [expMonthStr, expYearStr] = exp.split('/');
    const expMonth = Number(expMonthStr);
    const expYear = Number(expYearStr) + (expYearStr.length === 2 ? 2000 : 0);

    const created = await db.paymentMethod.create({
      data: {
        userId: authSession.user.id,
        brand,
        last4,
        expMonth,
        expYear,
        isDefault: formData.get('isDefault') === 'on',
      },
    });

    if (formData.get('isDefault') === 'on') {
      await db.paymentMethod.updateMany({
        where: { userId: authSession.user.id, id: { not: created.id } },
        data: { isDefault: false },
      });
    }

    revalidatePath('/account');
  }

  async function promotePayment(methodId: string) {
    'use server';

    const authSession = await auth();
    if (!authSession?.user?.id) {
      redirect('/auth/sign-in');
    }

    await db.paymentMethod.updateMany({ where: { userId: authSession.user.id }, data: { isDefault: false } });
    await db.paymentMethod.update({ where: { id: methodId }, data: { isDefault: true } });
    revalidatePath('/account');
  }

  async function deletePayment(methodId: string) {
    'use server';

    const authSession = await auth();
    if (!authSession?.user?.id) {
      redirect('/auth/sign-in');
    }

    await db.paymentMethod.delete({ where: { id: methodId } });
    revalidatePath('/account');
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100">Account</h1>
          <p className="mt-2 text-sm text-slate-300">Manage your saved addresses, cards, and checkout preferences.</p>
        </div>
        <Link
          href="/account/orders"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition-colors hover:border-aurora-teal/60 hover:text-aurora-teal"
        >
          Order history
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <GlassCard className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Add a new address</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shipping details for quicker checkout</p>
          </div>
          <form action={saveAddress} className="grid gap-3">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Label
              <input
                name="label"
                placeholder="Home"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Address line 1
              <input
                name="line1"
                required
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Address line 2
              <input
                name="line2"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                City
                <input
                  name="city"
                  required
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                State / Region
                <input
                  name="state"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Postal code
                <input
                  name="postalCode"
                  required
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Country
                <input
                  name="country"
                  defaultValue="USA"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-teal focus:outline-none"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <input type="checkbox" name="isDefault" className="rounded border-white/20 bg-white/5" />
              Make default
            </label>
            <button
              type="submit"
              className="rounded-full bg-aurora-violet px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 shadow-lg shadow-aurora-violet/20 hover:opacity-90"
            >
              Save address
            </button>
          </form>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Saved addresses</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fast checkout defaults</p>
            </div>
          </div>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="font-semibold text-slate-100">{address.label ?? 'Address'}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}
                  {address.state ? `, ${address.state}` : ''} {address.postalCode}
                </p>
                <p className="text-slate-400">{address.country}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!address.isDefault && (
                    <form action={promoteAddress.bind(null, address.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 hover:border-aurora-teal/50 hover:text-aurora-teal"
                      >
                        Set default
                      </button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, address.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 hover:border-aurora-amber/50 hover:text-aurora-amber"
                    >
                      Remove
                    </button>
                  </form>
                  {address.isDefault && (
                    <span className="rounded-full bg-aurora-teal/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-aurora-teal">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
            {!addresses.length && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                No saved addresses yet.
              </p>
            )}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <GlassCard className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Save a card</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Store the basics — we keep only the last four digits.</p>
          </div>
          <form action={savePayment} className="space-y-4">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Card number
              <input
                name="cardNumber"
                autoComplete="off"
                required
                placeholder="4242 4242 4242 4242"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-violet focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Expiry (MM/YY)
              <input
                name="expiry"
                required
                placeholder="09/30"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:border-aurora-violet focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <input type="checkbox" name="isDefault" className="rounded border-white/20 bg-white/5" />
              Make default
            </label>
            <button
              type="submit"
              className="rounded-full bg-aurora-teal px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-aurora-teal/30 hover:opacity-90"
            >
              Save card
            </button>
          </form>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Stored payment methods</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Masked for your security</p>
            </div>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="font-semibold text-slate-100 uppercase tracking-[0.3em]">{method.brand}</p>
                <p className="text-slate-300">•••• •••• •••• {method.last4}</p>
                <p className="text-xs text-slate-400">Expires {String(method.expMonth).padStart(2, '0')}/{method.expYear}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!method.isDefault && (
                    <form action={promotePayment.bind(null, method.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 hover:border-aurora-violet/60 hover:text-aurora-violet"
                      >
                        Set default
                      </button>
                    </form>
                  )}
                  <form action={deletePayment.bind(null, method.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200 hover:border-aurora-amber/60 hover:text-aurora-amber"
                    >
                      Remove
                    </button>
                  </form>
                  {method.isDefault && (
                    <span className="rounded-full bg-aurora-violet/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-aurora-violet">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
            {!paymentMethods.length && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                No saved cards yet.
              </p>
            )}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
