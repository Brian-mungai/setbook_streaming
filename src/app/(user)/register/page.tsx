'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    consentGiven: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!form.consentGiven) {
      setError('You must agree to data collection to create an account.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-2">Create Account</h1>
      <p className="text-zinc-400 text-sm mb-8">Join to stream professional setbook productions.</p>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">First Name</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Last Name</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Kenyan Phone Number (e.g. 07XXXXXXXX)</label>
          <input
            type="tel"
            required
            placeholder="0712345678"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Password Field with Eye Toggle */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-amber-500"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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

        {/* Confirm Password Field with Eye Toggle */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-amber-500"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-2">
          <input
            type="checkbox"
            id="consent"
            required
            className="mt-1 rounded bg-zinc-950 border-zinc-800 text-amber-600 focus:ring-amber-500"
            checked={form.consentGiven}
            onChange={(e) => setForm({ ...form, consentGiven: e.target.checked })}
          />
          <label htmlFor="consent" className="text-xs text-zinc-400">
            I explicitly consent to the collection and secure processing of my personal data.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors mt-4 text-sm"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-500 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}