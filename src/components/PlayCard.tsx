'use client';

import { Play as PlayIcon, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlayCardProps {
  play: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    posterUrl?: string | null;
  };
  isUnlocked?: boolean;
  onUnlockClick?: (play: any) => void;
}

export default function PlayCard({ play, isUnlocked = false, onUnlockClick }: PlayCardProps) {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(play.price > 1000 ? play.price / 100 : play.price);

  const handleCardClick = () => {
    if (isUnlocked) {
      router.push(`/stream/${play.id}`);
    } else {
      onUnlockClick && onUnlockClick(play);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-all shadow-xl cursor-pointer"
    >
      {/* Poster Image */}
      <div className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden">
        {play.posterUrl ? (
          <img
            src={play.posterUrl}
            alt={play.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <PlayIcon className="w-12 h-12" />
          </div>
        )}

        {/* Lock / Unlock Badge */}
        <div className="absolute top-3 right-3">
          {isUnlocked ? (
            <span className="bg-emerald-500/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-lg">
              Unlocked
            </span>
          ) : (
            <span className="bg-black/80 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md flex items-center space-x-1 shadow-lg">
              <Lock className="w-3 h-3 mr-1 inline" />
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Play Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors">
            {play.title}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
            {play.description}
          </p>
        </div>

        <div>
          {isUnlocked ? (
            <div className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/40">
              <PlayIcon className="w-4 h-4 fill-current" />
              <span>Watch Stream</span>
            </div>
          ) : (
            <div className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-950/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Play ({formattedPrice})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}