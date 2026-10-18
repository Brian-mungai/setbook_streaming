import { db } from '@/lib/db';
import Link from 'next/link';
import Form from 'next/form';
import { Play, Search, X, Film } from 'lucide-react';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';

  // Query published plays directly from PostgreSQL via Prisma, filtered by search if provided
  let plays = [];
  try {
    plays = await db.play.findMany({
      where: {
        published: true,
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { author: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to fetch plays from database:', err);
    plays = [];
  }

  // Hero banner only displays when not actively searching
  const heroPlay = !searchQuery ? plays[0] : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white space-y-12 pb-24">
      {/* HERO BANNER - LATEST ADMIN PRODUCTION */}
      {heroPlay && (
        <section className="relative w-full h-[500px] md:h-[600px] flex items-end p-6 md:p-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={heroPlay.bannerUrl || heroPlay.posterUrl}
              alt={heroPlay.title}
              className="w-full h-full object-cover filter brightness-50 scale-105 transform transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              By {heroPlay.author || 'Renowned Playwright'}
            </span>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {heroPlay.title}
            </h1>

            <p className="text-xs md:text-sm text-zinc-300 line-clamp-3 max-w-2xl leading-relaxed">
              {heroPlay.description}
            </p>

            <div className="flex items-center space-x-4 pt-4">
              <Link
                href={`/stream/${heroPlay.id}`}
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-7 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Stream Production</span>
              </Link>
              <div className="text-sm font-black text-white bg-zinc-900/80 border border-zinc-800 px-5 py-3.5 rounded-2xl backdrop-blur-md">
                KES {Number(heroPlay.price).toFixed(2)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CATALOGUE & SEARCH SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">Theatrical Productions Catalogue</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Search and stream high-definition setbooks with instant M-Pesa authorization.
            </p>
          </div>

          {/* Search Form (Submits query to trigger Server Component search) */}
          <Form action="/" className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by title, author, or keyword..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-xs rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <Link
                href="/"
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Link>
            )}
          </Form>
        </div>

        {/* Catalogue Grid */}
        {plays.length === 0 ? (
          <div className="p-16 text-center bg-zinc-900/60 border border-zinc-800/80 rounded-3xl space-y-3">
            <Film className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-300">
              {searchQuery ? `No setbook plays match "${searchQuery}"` : 'No plays uploaded by admin yet.'}
            </p>
            {searchQuery && (
              <Link href="/" className="text-xs text-amber-400 hover:underline font-semibold inline-block">
                Clear Search Filter
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {plays.map((play) => (
              <div
                key={play.id}
                className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Poster Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={play.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
                    alt={play.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-zinc-950/80 border border-zinc-800 px-3 py-1 rounded-full backdrop-blur-md">
                    <span className="text-xs font-black text-amber-400">
                      KES {Number(play.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Info & Watch Action */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {play.title}
                    </h3>
                    {play.author && (
                      <p className="text-[11px] font-medium text-amber-500/90">
                        By {play.author}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      {play.description}
                    </p>
                  </div>

                  <Link
                    href={`/stream/${play.id}`}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Stream</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}