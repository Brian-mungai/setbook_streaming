import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import argon2 from 'argon2';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return null;

  // Find all active sessions and match tokenHash
  const sessions = await db.session.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  for (const session of sessions) {
    if (await argon2.verify(session.tokenHash, sessionToken)) {
      return session.user;
    }
  }

  return null;
}