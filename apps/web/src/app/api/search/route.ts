import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/server/db';

const VECTOR_DIMENSION = 768;

export async function POST(request: Request) {
  const body = await request.json();
  const query = String(body.query ?? '').trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const embeddings = Array.isArray(body.embedding) ? (body.embedding as number[]) : undefined;

  const keywordResults = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: query.split(' ') } },
      ],
    },
    include: {
      prices: { where: { active: true }, orderBy: { amount: 'asc' }, take: 1 },
      category: true,
    },
    take: 12,
  });

  let vectorResults: typeof keywordResults = [];
  if (embeddings?.length === VECTOR_DIMENSION) {
    const normalised = embeddings.map((value) => Number(value) || 0);
    const vector = `[${normalised.map((value) => value.toFixed(6)).join(',')}]`;
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM "Product" ORDER BY vector <-> ${vector} LIMIT 12`
    );
    const ids = rows.map((row) => row.id);
    vectorResults = await db.product.findMany({
      where: { id: { in: ids } },
      include: {
        prices: { where: { active: true }, orderBy: { amount: 'asc' }, take: 1 },
        category: true,
      },
    });
  }

  const merged = [...keywordResults];
  for (const item of vectorResults) {
    if (!merged.find((existing) => existing.id === item.id)) {
      merged.push(item);
    }
  }

  await db.searchEvent.create({
    data: {
      query,
      mode: embeddings ? 'hybrid' : 'keyword',
      zeroResults: merged.length === 0,
    },
  });

  return NextResponse.json({ query, results: merged.slice(0, 12) });
}
