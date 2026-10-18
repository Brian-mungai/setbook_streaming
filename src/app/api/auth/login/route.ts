import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import { sendEmail } from '@/services/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Account is suspended or deactivated.' }, { status: 403 });
    }

    // Generate 6-digit OTP code valid for 10 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate prior active OTPs
    await db.otpChallenge.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    await db.otpChallenge.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    await sendEmail({
      to: user.email,
      subject: 'Your Setbook Streaming Login OTP',
      html: `<p>Your single-use login OTP code is: <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ success: true, message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}