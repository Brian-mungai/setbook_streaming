import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import NavigationClient from './NavigationClient';

export default async function NavigationSidebar() {
  let isLoggedIn = false;
  let isAdmin = false;

  try {
    const user = await getCurrentUser();
    if (user) {
      isLoggedIn = true;
      isAdmin = user.role === 'ADMIN';
    }
  } catch (e) {
    isLoggedIn = false;
    isAdmin = false;
  }

  return <NavigationClient isLoggedIn={isLoggedIn} isAdmin={isAdmin} />;
}