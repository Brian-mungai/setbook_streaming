import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import { sendEmail } from '@/services/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    // For security reasons, don't reveal if user doesn't exist, just return success
    if (!user) {
      return NextResponse.json({ success: true, message: 'If registered, reset code sent.' });
    }

    // Generate 6-digit code valid for 15 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await argon2.hash(code, { type: argon2.argon2id });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate prior active challenges
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
      subject: 'Password Reset Code - Setbook Streaming',
      html: `<p>Your password reset code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
    });

    return NextResponse.json({ success: true, message: 'Reset code sent to email.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}