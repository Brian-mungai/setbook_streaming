import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  consentGiven: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input data or consent not given.' }, { status: 400 });
    }

    const { firstName, lastName, email, phone, password } = parsed.data;

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email or phone number already registered.' }, { status: 400 });
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        consentGiven: true,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}