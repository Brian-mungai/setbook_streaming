'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, CheckCircle } from 'lucide-react';

export default function AccountPage() {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setProfile(data.user);
      })
      .catch(() => setError('Failed to load profile data.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-500">Loading account details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-2">My Account</h1>
      <p className="text-zinc-400 text-sm mb-8">Manage your personal information and profile settings.</p>

      {message && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl mb-6 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">First Name</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Last Name</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address (Read-only)</label>
          <div className="relative">
            <input
              type="email"
              disabled
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-zinc-400 text-sm cursor-not-allowed"
              value={profile.email}
            />
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Phone Number (M-Pesa)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="0712345678"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-white text-sm focus:outline-none focus:border-amber-500"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Account Role</label>
          <div className="relative">
            <input
              type="text"
              disabled
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-zinc-400 text-sm uppercase cursor-not-allowed"
              value={profile.role}
            />
            <Shield className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}