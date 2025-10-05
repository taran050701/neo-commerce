import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/server/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const name = String(body.name ?? '').trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    await db.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        role: 'USER',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[register] error', error);
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
