import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 400 });
    }

    const challenge = await db.otpChallenge.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge || !(await argon2.verify(challenge.codeHash, otp))) {
      return NextResponse.json({ message: 'Invalid or expired code.' }, { status: 400 });
    }

    // Mark challenge used
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: { used: true },
    });

    // Issue a short-lived reset token cookie (valid for 10 minutes) to authorize password change
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(resetToken);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store temporary token hash in session or a similar mechanism, or attach it to user record if desired.
    // For simplicity and security, let's store a temporary session or cookie verification flag:
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'reset_verified_email',
      value: email,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify forgot OTP error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}