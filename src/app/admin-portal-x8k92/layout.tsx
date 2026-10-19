import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Film, Clock, Users, ArrowLeft, ShieldAlert, LayoutDashboard } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-8 w-full md:w-auto">
          {/* Brand */}
          <div className="flex items-center space-x-2 text-amber-500 font-black text-base shrink-0">
            <ShieldAlert className="w-5 h-5" />
            <span>Admin Portal</span>
          </div>

          {/* Horizontal Nav Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Link
              href="/admin-portal-x8k92"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin-portal-x8k92/plays"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Plays</span>
            </Link>
            <Link
              href="/admin-portal-x8k92/transactions"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Transactions</span>
            </Link>
            <Link
              href="/admin-portal-x8k92/users"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users</span>
            </Link>
          </nav>
        </div>

        {/* Exit Admin / Return to Public Site */}
        <div className="shrink-0 w-full md:w-auto flex justify-end">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}