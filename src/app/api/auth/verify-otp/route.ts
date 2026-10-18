import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const otp = String(body.otp || '').trim();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP code are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const challenge = await db.otpChallenge.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge || !(await argon2.verify(challenge.codeHash, otp))) {
      return NextResponse.json({ message: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Mark challenge as used
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: { used: true },
    });

    // Create active session
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(rawToken, { type: argon2.argon2id });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session_token',
      value: rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}