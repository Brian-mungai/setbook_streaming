'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Home, BookOpen, Info, Mail, User, LogOut } from 'lucide-react';

interface NavigationClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export default function NavigationClient({ isLoggedIn, isAdmin }: NavigationClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Link */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-amber-500/30 group-hover:border-amber-500 transition-colors bg-zinc-900">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm md:text-base font-black tracking-widest text-amber-500 uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Setbook Streaming
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/library"
                  className="hidden sm:inline-block text-sm font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1"
                >
                  My Library
                </Link>
                <Link
                  href="/account"
                  className="text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-lg transition-colors border border-zinc-700"
                >
                  My Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:inline-block"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              onClick={toggleSidebar}
              aria-label="Open menu"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="relative w-7 h-7 overflow-hidden rounded-lg border border-amber-500/30">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">Menu</span>
          </div>
          <button
            onClick={toggleSidebar}
            aria-label="Close menu"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          <Link
            href="/"
            onClick={toggleSidebar}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5 text-amber-500" />
            <span>Home</span>
          </Link>

          <Link
            href="/library"
            onClick={toggleSidebar}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>My Library</span>
          </Link>

          <Link
            href="/about"
            onClick={toggleSidebar}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Info className="w-5 h-5 text-amber-500" />
            <span>About Us</span>
          </Link>

          <Link
            href="/contact"
            onClick={toggleSidebar}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Mail className="w-5 h-5 text-amber-500" />
            <span>Contact Us</span>
          </Link>

          <div className="pt-4 border-t border-zinc-800 mt-4 space-y-2">
            <Link
              href="/account"
              onClick={toggleSidebar}
              className="flex items-center space-x-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <User className="w-5 h-5 text-amber-500" />
              <span>My Account</span>
            </Link>

            {isLoggedIn && (
              <button
                onClick={() => {
                  toggleSidebar();
                  handleLogout();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}