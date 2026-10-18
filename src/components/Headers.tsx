'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Library, User, Shield, LogOut } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin-portal-x8k92';

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-zinc-950 font-bold" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-wide">
            SETBOOK<span className="text-amber-500">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Explore Plays
          </Link>

          {user && (
            <Link
              href="/library"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                pathname === '/library' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>My Library</span>
            </Link>
          )}

          {/* Obfuscated Admin Link (Only Visible to Admin Role) */}
          {user?.role === 'ADMIN' && (
            <Link
              href={adminPath}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-amber-500/30 transition-colors ${
                pathname.startsWith(adminPath)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* User Account / Auth Actions */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800">
              <Link
                href="/profile"
                className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl transition-all"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-200">{user.name.split(' ')[0]}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-md shadow-amber-500/10"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}