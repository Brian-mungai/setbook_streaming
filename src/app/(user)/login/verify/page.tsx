'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      // Check if user is an ADMIN and redirect to obfuscated path
      if (data.user?.role === 'ADMIN') {
        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin-portal-x8k92';
        window.location.href = `${adminPath}`;
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white mb-2">Enter Email OTP</h1>
      <p className="text-zinc-400 text-sm mb-8">
        We have sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
      </p>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">6-Digit OTP Code</label>
          <input
            type="text"
            maxLength={6}
            required
            placeholder="123456"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-white text-center tracking-widest text-lg focus:outline-none focus:border-amber-500"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors mt-2 text-sm"
        >
          {loading ? 'Verifying Code...' : 'Verify & Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500">Loading verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}