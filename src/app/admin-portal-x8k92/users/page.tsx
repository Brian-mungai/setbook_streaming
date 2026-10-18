'use client';

import { useState, useEffect } from 'react';
import { Phone, CheckCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(userId: string, role: string, status: string) {
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');
      setMessage('User updated successfully');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-20 text-zinc-500">Loading users...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 pb-4 border-b border-zinc-800">
        <h1 className="text-3xl font-extrabold text-white">User Management</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage user roles, accounts, and status.</p>
      </div>

      {message && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl mb-6 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs bg-zinc-950/50">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-zinc-400">{u.email}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="flex items-center space-x-1.5 text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{u.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                      value={u.role}
                      onChange={(e) => handleUpdate(u.id, e.target.value, u.status)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                      value={u.status}
                      onChange={(e) => handleUpdate(u.id, u.role, e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="PENDING_DELETION">PENDING_DELETION</option>
                      <option value="DELETED">DELETED</option>
                    </select>
                  </td>
                  <td className="p-4 text-right text-xs text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}