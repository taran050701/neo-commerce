import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { db } from '@/server/db';

type Hit = {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  score?: number;
};

async function buildLocalFallback(query: string) {
  const trimmed = query.trim();

  const articles = await db.kBArticle.findMany({
    where: trimmed
      ? {
          OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { body: { contains: trimmed, mode: 'insensitive' } },
            { category: { contains: trimmed, mode: 'insensitive' } },
          ],
        }
      : {},
    orderBy: { updatedAt: 'desc' },
    take: 3,
  });

  const hits: Hit[] = articles.map((article, idx) => ({
    id: article.id,
    question: article.title,
    answer: article.body,
    category: article.category,
    score: articles.length ? (articles.length - idx) / articles.length : undefined,
  }));

  if (!hits.length) {
    return {
      reply: 'Our assistant is warming up. Here are the top FAQs while we reconnect.',
      fallback: true,
      hits: [],
    };
  }

  const summary = `Here are ${hits.length} topics that might help: ${hits
    .map((hit) => hit.question)
    .join(', ')}.`;

  return {
    reply: summary,
    fallback: true,
    hits,
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = String(body.message ?? '').trim();

  if (!message) {
    return NextResponse.json({ reply: 'Please include a message for the assistant.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${env.AI_SERVICE_URL}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message, mode: body.mode ?? 'faq' }),
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`AI service error ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[assistant] fallback', error);
    const fallback = await buildLocalFallback(message);
    return NextResponse.json(fallback, { status: 200 });
  }
}
