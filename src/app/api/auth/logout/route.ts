import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'session_token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return NextResponse.json({ success: true });
}