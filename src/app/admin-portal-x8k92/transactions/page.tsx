'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(transactionId: string, status: string) {
    setMessage('');
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update transaction');
      setMessage('Transaction status updated');
      fetchTransactions();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-center py-20 text-zinc-500">Loading transactions...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 pb-4 border-b border-zinc-800">
        <h1 className="text-3xl font-extrabold text-white">Transaction Management</h1>
        <p className="text-zinc-400 text-sm mt-1">Review M-Pesa payments, receipts, and order statuses.</p>
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
                <th className="p-4 font-medium">Production</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Receipt / Phone</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{tx.user?.firstName} {tx.user?.lastName}</div>
                    <div className="text-xs text-zinc-400">{tx.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{tx.play?.title || 'General Purchase'}</div>
                    {tx.scene && <div className="text-xs text-amber-400">Scene: {tx.scene.title}</div>}
                  </td>
                  <td className="p-4 font-semibold text-amber-400">
                    KES {(tx.amount / 100).toFixed(2)}
                  </td>
                  <td className="p-4 text-xs">
                    <div className="text-zinc-200 font-mono">{tx.mpesaReceiptNumber || 'No Receipt'}</div>
                    <div className="text-zinc-500">{tx.phone}</div>
                  </td>
                  <td className="p-4">
                    <select
                      className={`rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none border ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                          : 'bg-red-950/40 text-red-400 border-red-500/30'
                      }`}
                      value={tx.status}
                      onChange={(e) => handleStatusUpdate(tx.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="TIMED_OUT">TIMED_OUT</option>
                      <option value="HELD_BY_ADMIN">HELD_BY_ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 text-right text-xs text-zinc-500">
                    {new Date(tx.createdAt).toLocaleString()}
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