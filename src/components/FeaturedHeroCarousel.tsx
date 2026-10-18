'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play as PlayIcon, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

interface FeaturedPlay {
  id: string;
  title: string;
  description: string | null;
  price: number;
  author: string | null;
  posterUrl: string | null;
  bannerUrl?: string | null;
}

interface FeaturedHeroCarouselProps {
  plays: FeaturedPlay[];
}

export default function FeaturedHeroCarousel({ plays }: FeaturedHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (plays.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % plays.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [plays.length]);

  if (!plays || plays.length === 0) return null;

  const currentPlay = plays[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? plays.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % plays.length);
  };

  return (
    <div className="relative w-full h-[420px] md:h-[480px] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl mb-12 group">
      {/* Background Banner / Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        {currentPlay.bannerUrl || currentPlay.posterUrl ? (
          <img
            src={currentPlay.bannerUrl || currentPlay.posterUrl || ''}
            alt={currentPlay.title}
            className="w-full h-full object-cover object-center opacity-40 transition-all duration-700 scale-105 group-hover:scale-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950" />
        )}
        
        {/* Dark Vignette Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full max-w-3xl flex flex-col justify-end p-6 md:p-12 space-y-4">
        {/* Author / Tag Badge */}
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
            Featured Production
          </span>
          {currentPlay.author && (
            <span className="text-xs text-zinc-300 font-medium">By {currentPlay.author}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {currentPlay.title}
        </h1>

        {/* Description */}
        <p className="text-zinc-300 text-xs md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl">
          {currentPlay.description || 'Exclusive acted setbook streaming production with full scene access.'}
        </p>

        {/* Action Button & Price */}
        <div className="pt-2 flex items-center space-x-4">
          <Link
            href={`/stream/${currentPlay.id}`}
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-2xl flex items-center space-x-2 shadow-lg shadow-amber-950/40 transition-all transform hover:-translate-y-0.5"
          >
            <PlayIcon className="w-4 h-4 fill-current" />
            <span>Watch Stream</span>
          </Link>

          <span className="text-xs font-bold text-amber-400 bg-zinc-900/80 border border-zinc-800 px-3.5 py-2.5 rounded-xl">
            KES {currentPlay.price.toFixed(2)}
          </span>
        </div>

        {/* Carousel Indicators (Dots) */}
        {plays.length > 1 && (
          <div className="flex items-center space-x-2 pt-4">
            {plays.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-amber-500' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {plays.length > 1 && (
        <div className="absolute right-6 bottom-6 z-10 flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all"
            aria-label="Previous play"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all"
            aria-label="Next play"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
