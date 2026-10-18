import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PlayCard from '@/components/PlayCard';
import { Library } from 'lucide-react';

export default async function LibraryPage() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect('/login');
    }

    // Fetch user entitlements (safely omitting orderBy to avoid schema mismatches)
    const entitlements = await db.entitlement.findMany({
      where: {
        userId: user.id,
      },
      include: {
        play: {
          include: {
            scenes: true,
          },
        },
      },
    });

    const plays = entitlements.map((item) => item.play).filter(Boolean);

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-zinc-800">
          <Library className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-extrabold text-white">My Library</h1>
        </div>

        {plays.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-3">
            <p className="text-sm font-semibold">You haven't unlocked any plays yet.</p>
            <p className="text-xs text-zinc-500">Explore the catalog and purchase a play to start streaming.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plays.map((play) => (
              <PlayCard key={play.id} play={play} isUnlocked={true} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    // Allow Next.js internal redirects to work properly
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Library Page Fatal Error:', error);

    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 max-w-lg mx-auto text-red-400 space-y-2">
          <p className="text-base font-bold">Failed to load your library</p>
          <p className="text-xs text-zinc-400">{error.message || 'Check your server terminal for detailed error logs.'}</p>
        </div>
      </div>
    );
  }
}