'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Brand & Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 overflow-hidden rounded-lg border border-amber-500/30">
              <Image src="/logo.png" alt="Logo" width={150} height={50} className="object-contain"
    priority />
            </div>
            <span className="text-white font-black tracking-wider uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Setbook Streaming
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your premier platform for streaming Kenyan setbook plays, cinematic performances, and educational theatrical productions.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold tracking-wider text-sm uppercase">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                <span className="text-amber-500">›</span> <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/library" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                <span className="text-amber-500">›</span> <span>My Library</span>
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                <span className="text-amber-500">›</span> <span>About Us</span>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                <span className="text-amber-500">›</span> <span>Contact Us</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Social & Contact Profiles */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold tracking-wider text-sm uppercase">Connect With Us</h3>
          <p className="text-xs text-zinc-400">Reach out or follow us on our official channels:</p>
          
          <div className="flex flex-wrap gap-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/254707556362" 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/lucianlucy20/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-pink-500 hover:bg-pink-500/10 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/people/Lucy-Mbuu/pfbid0RssC4mS26ziwVekCSUtNrd4hNKaBcVFhwcHMtkwvCHYJs4U8mX1386YVThQ9pD7Fl/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:lucianlucy969@gmail.com"
              aria-label="Email"
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500 hover:bg-amber-500/10 transition-all"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-400">
        <p>© {new Date().getFullYear()} Setbook Streaming Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}