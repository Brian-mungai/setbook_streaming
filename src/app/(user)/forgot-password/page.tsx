'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset code');

      // Redirect to OTP verification page first!
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white mb-2">Reset Password</h1>
      <p className="text-zinc-400 text-sm mb-8">Enter your account email to receive a password reset code.</p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors mt-2 text-sm"
        >
          {loading ? 'Sending Code...' : 'Send Reset Code'}
        </button>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Remembered your password?{' '}
          <Link href="/login" className="text-amber-500 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}