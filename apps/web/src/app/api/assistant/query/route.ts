import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

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
    return NextResponse.json(
      {
        reply: 'Our assistant is warming up. Here are top FAQs while we reconnect.',
        fallback: true,
      },
      { status: 200 },
    );
  }
}
