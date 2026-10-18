'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Play as PlayIcon } from 'lucide-react';

interface PlayItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  author: string | null;
  posterUrl: string | null;
}

interface CatalogSearchListProps {
  plays: PlayItem[];
}

export default function CatalogSearchList({ plays }: CatalogSearchListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time filtering by title, author, or description
  const filteredPlays = plays.filter((play) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = play.title?.toLowerCase().includes(query);
    const authorMatch = play.author?.toLowerCase().includes(query);
    const descMatch = play.description?.toLowerCase().includes(query);
    return titleMatch || authorMatch || descMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar: Search on Top Left + Count Badge on Top Right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Top-Left Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search setbooks, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Available Productions Header */}
        <div className="flex items-center space-x-2 text-xs font-medium text-zinc-400">
          <span>Showing</span>
          <span className="text-amber-500 font-bold">{filteredPlays.length}</span>
          <span>of {plays.length} Titles</span>
        </div>
      </div>

      {/* Plays Catalog Grid */}
      {filteredPlays.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
          <PlayIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Matching Productions</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            {searchQuery
              ? `No setbook plays found matching "${searchQuery}". Try searching for another title or author.`
              : 'Our administrators are currently uploading setbook productions. Check back shortly!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlays.map((play) => (
            <div
              key={play.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center">
                  {play.posterUrl ? (
                    <img
                      src={play.posterUrl}
                      alt={play.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <PlayIcon className="w-12 h-12 text-zinc-600" />
                  )}
                  <span className="absolute top-3 right-3 bg-amber-950/80 text-amber-400 font-medium text-xs px-2.5 py-1 rounded-lg border border-amber-500/35">
                    KES {play.price.toFixed(2)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">{play.title}</h3>
                  {play.author && (
                    <p className="text-xs text-amber-500 mb-2 font-medium">
                      By {play.author}
                    </p>
                  )}
                  <p className="text-zinc-400 text-sm line-clamp-2">{play.description}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link
                  href={`/stream/${play.id}`}
                  className="block text-center w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  View Play & Scenes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}