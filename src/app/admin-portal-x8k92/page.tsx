import { db } from '@/lib/db';
import Link from 'next/link';
import { Film, Clock, Users, ArrowRight, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
  try {
    // 1. Fetch system counts safely
    const [totalPlays, totalTransactions, totalUsers] = await Promise.all([
      db.play.count().catch(() => 0),
      db.transaction.count().catch(() => 0),
      db.user.count().catch(() => 0),
    ]);

    // 2. Fetch the 10 most recent transactions for display in the table
    const allTransactions = await db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        play: { select: { title: true } },
      },
    }).catch(() => []);

    // 3. Fetch ALL transactions safely to filter completed ones in JavaScript (bypasses Prisma Enum/case issues)
    const rawTransactions = await db.transaction.findMany({
      select: { amount: true, status: true },
    }).catch(() => []);

    // Filter completed transactions safely regardless of case or enum format
    const totalRevenue = rawTransactions.reduce((acc, tx) => {
      const statusStr = String(tx.status || '').toUpperCase();
      if (statusStr === 'COMPLETED' || statusStr === 'SUCCESS' || statusStr === 'PAID') {
        const amt = Number(tx.amount) || 0;
        // Handles amounts stored in cents (e.g. 50000 = 500) vs standard currency
        return acc + (amt > 1000 ? amt / 100 : amt);
      }
      return acc;
    }, 0);

    return (
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Portal Dashboard</h1>
            <p className="text-xs text-zinc-400">
              Overview of theatrical catalogue, revenue analytics, and system activities.
            </p>
          </div>
          <Link
            href="/admin-portal-x8k92/plays/new"
            className="self-start md:self-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all"
          >
            + Add New Play
          </Link>
        </div>

        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Total Revenue
              </span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">
              KES {totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-500">From completed M-Pesa payments</p>
          </div>

          {/* Total Plays */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Setbook Plays
              </span>
              <Film className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">{totalPlays}</p>
            <p className="text-[10px] text-zinc-500">Active theatrical productions</p>
          </div>

          {/* Total Transactions */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Transactions
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">{totalTransactions}</p>
            <p className="text-[10px] text-zinc-500">M-Pesa payment requests</p>
          </div>

          {/* Total Users */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Registered Users
              </span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">{totalUsers}</p>
            <p className="text-[10px] text-zinc-500">Patrons and admin accounts</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin-portal-x8k92/plays"
            className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-3 transition-all group shadow-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Manage Plays</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Add setbooks, upload scene assets, update pricing, and pin titles to the banner.
              </p>
            </div>
          </Link>

          <Link
            href="/admin-portal-x8k92/transactions"
            className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-3 transition-all group shadow-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>View Transactions</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Monitor incoming M-Pesa STK push logs, checkout IDs, and payment statuses.
              </p>
            </div>
          </Link>

          <Link
            href="/admin-portal-x8k92/users"
            className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-3 transition-all group shadow-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Manage Users</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                View user accounts, entitlement permissions, and grant administrator roles.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Transactions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">Recent Activity</h2>
            <Link href="/admin-portal-x8k92/transactions" className="text-xs font-bold text-amber-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            {allTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No recent transactions recorded.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {allTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 md:px-6 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-white">{tx.play?.title || 'Setbook Production'}</p>
                      <p className="text-zinc-500">
                        User: {tx.user?.email || 'Patron'} | Phone: {tx.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-extrabold text-amber-400">
                        KES {(Number(tx.amount) > 1000 ? Number(tx.amount) / 100 : Number(tx.amount) || 0).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          String(tx.status || '').toUpperCase() === 'COMPLETED' ||
                          String(tx.status || '').toUpperCase() === 'SUCCESS' ||
                          String(tx.status || '').toUpperCase() === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-12 text-center space-y-4 bg-zinc-900 border border-zinc-800 rounded-3xl">
        <h2 className="text-xl font-bold text-red-500">Error Loading Admin Dashboard</h2>
        <pre className="text-xs bg-zinc-950 p-4 rounded-xl text-zinc-400 max-w-xl mx-auto overflow-auto text-left">
          {error?.message || String(error)}
        </pre>
      </div>
    );
  }
}