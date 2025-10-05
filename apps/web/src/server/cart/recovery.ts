import { randomUUID } from 'crypto';
import { db } from '@/server/db';

export async function createRecoveryToken(cartId: string) {
  const token = randomUUID();
  await db.cart.update({
    where: { id: cartId },
    data: {
      recoveryToken: token,
      recoverySentAt: new Date(),
    },
  });
  return token;
}

export async function markRecoveryRedeemed(token: string) {
  await db.cart.updateMany({
    where: { recoveryToken: token },
    data: {
      status: 'recovered',
      recoveryRedeemedAt: new Date(),
    },
  });
}
