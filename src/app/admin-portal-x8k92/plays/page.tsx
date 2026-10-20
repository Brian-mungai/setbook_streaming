'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, Trash2, Plus, Loader2, Eye } from 'lucide-react';

export default function AdminPlaysManagement() {
  const [plays, setPlays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPlays = async () => {
    try {
      const res = await fetch('/api/admin/plays');
      if (res.ok) {
        const data = await res.json();
        setPlays(data.plays || []);
      }
    } catch (err) {
      console.error('Failed to load plays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlays();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/plays/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPlays(plays.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete play.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting play.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white">Plays Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage, publish, and delete theatrical productions in the system.
          </p>
        </div>
        <Link
          href="/admin-portal-x8k92/plays/new"
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Play</span>
        </Link>
      </div>

      {/* Plays Table */}
      {loading ? (
        <div className="p-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading admin plays catalogue...</p>
        </div>
      ) : plays.length === 0 ? (
        <div className="p-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3">
          <Film className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-zinc-300">No plays found in the database.</p>
          <p className="text-xs text-zinc-500">Click "Upload New Play" to add your first production.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Production</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-xs">
                {plays.map((play) => (
                  <tr key={play.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <img
                        src={play.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
                        alt={play.title}
                        className="w-10 h-12 object-cover rounded-lg bg-zinc-950 shrink-0"
                      />
                      <span className="font-extrabold text-white line-clamp-1">{play.title}</span>
                    </td>
                    <td className="py-4 px-6 text-zinc-300">{play.author || 'N/A'}</td>
                    <td className="py-4 px-6 font-bold text-amber-400">
                      KES {Number(play.price).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                          play.published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {play.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/stream/${play.id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="View Stream"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(play.id, play.title)}
                        disabled={deletingId === play.id}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
                        title="Delete Play"
                      >
                        {deletingId === play.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}