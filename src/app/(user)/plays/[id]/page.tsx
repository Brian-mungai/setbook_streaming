import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import PlayViewActions from '@/components/PlayViewActions';

interface PlayDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlayDetailsPage({ params }: PlayDetailsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const play = await db.play.findUnique({
    where: { id },
    include: {
      scenes: {
        orderBy: { sequence: 'asc' },
        select: {
          id: true,
          title: true,
          sequence: true,
        },
      },
    },
  });

  if (!play) {
    notFound();
  }

  // Check user entitlement (Admins bypass lock)
  let isUnlocked = user?.role === 'ADMIN';

  if (user && !isUnlocked) {
    const entitlement = await db.entitlement.findFirst({
      where: {
        userId: user.id,
        playId: play.id,
      },
    });
    isUnlocked = !!entitlement;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">{play.title}</h1>
          {play.author && <p className="text-sm text-amber-400 font-semibold">{play.author}</p>}
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line border-t border-zinc-800 pt-4">
          {play.description}
        </p>

        {/* Action Controls & Scenes */}
        <PlayViewActions
          play={{
            id: play.id,
            title: play.title,
            price: play.price,
            description: play.description,
          }}
          scenes={play.scenes}
          isUnlocked={isUnlocked}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}