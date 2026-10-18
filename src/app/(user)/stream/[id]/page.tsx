import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Film, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import StreamClientView from '@/components/StreamClientView';

interface StreamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StreamPage({ params }: StreamPageProps) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      redirect('/login');
    }

    // 1. Fetch play and all related scenes with video assets
    const play = await db.play.findUnique({
      where: { id },
      include: {
        scenes: {
          orderBy: { sequence: 'asc' },
          include: { videoAsset: true },
        },
      },
    });

    if (!play) {
      notFound();
    }

    // 2. Check user entitlement (Admins bypass)
    const isOwner = user.role === 'ADMIN';
    let entitlement = null;

    if (!isOwner) {
      entitlement = await db.entitlement.findFirst({
        where: {
          userId: user.id,
          playId: play.id,
        },
      });
    }

    const isUnlocked = isOwner || !!entitlement;

    // 3. Fallback resolution for video URL
    const firstScene = play.scenes && play.scenes.length > 0 ? play.scenes[0] : null;
    const streamUrl =
      firstScene?.videoAsset?.storageKey ||
      firstScene?.videoAsset?.url ||
      firstScene?.videoUrl ||
      (play as any).videoUrl ||
      null;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                isUnlocked
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {isUnlocked ? 'Unlocked Stream' : 'Locked Stream'}
            </span>
          </div>
        </div>

        {/* Client Video Player & Automatic Payment Popup Container */}
        <StreamClientView
          play={{
            id: play.id,
            title: play.title,
            price: play.price,
            description: play.description,
          }}
          streamUrl={streamUrl}
          isUnlocked={isUnlocked}
        />

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <h1 className="text-xl font-extrabold text-white">{play.title}</h1>
          {play.author && (
            <p className="text-xs text-amber-400 font-medium">
              Playwright / Author: {play.author}
            </p>
          )}
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line pt-2 border-t border-zinc-800/80">
            {play.description}
          </p>
        </div>
      </div>
    );
  } catch (error: any) {
    if (
      error?.digest?.startsWith('NEXT_REDIRECT') ||
      error?.message?.includes('NEXT_REDIRECT')
    ) {
      throw error;
    }

    console.error('Stream Page Error:', error);

    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 max-w-lg mx-auto text-red-400 space-y-2">
          <p className="text-base font-bold">Failed to load the stream page</p>
          <p className="text-xs text-zinc-400">
            {error.message || 'Check your server logs.'}
          </p>
        </div>
      </div>
    );
  }
}