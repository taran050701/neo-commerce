import { db } from '@/server/db';

export async function getFeatureFlag(key: string) {
  const flag = await db.featureFlag.findUnique({ where: { key } });
  return flag?.value ?? null;
}

export async function setFeatureFlag(key: string, value: unknown, scope = 'global', updatedBy?: string) {
  await db.featureFlag.upsert({
    where: { key },
    update: { value, scope, updatedBy },
    create: { key, value, scope, updatedBy },
  });
}
