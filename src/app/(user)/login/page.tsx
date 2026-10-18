'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      router.push(`/login/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white mb-2">Sign In</h1>
      <p className="text-zinc-400 text-sm mb-8">Enter your credentials to receive an email OTP.</p>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-zinc-300">Password</label>
            <Link href="/forgot-password" className="text-xs text-amber-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-amber-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors mt-2 text-sm"
        >
          {loading ? 'Verifying...' : 'Continue to OTP'}
        </button>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-amber-500 hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}