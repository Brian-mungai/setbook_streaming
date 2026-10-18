import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import argon2 from 'argon2';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();
    const cookieStore = await cookies();
    const verifiedEmail = cookieStore.get('reset_verified_email')?.value;

    if (!verifiedEmail || verifiedEmail !== email) {
      return NextResponse.json({ message: 'Unauthorized password reset attempt. Please re-verify your OTP.' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 400 });
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate active sessions and clear the reset cookie
    await db.session.deleteMany({ where: { userId: user.id } });
    cookieStore.set({
      name: 'reset_verified_email',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}