import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const playId = params.id;
    const { title, videoUrl, order } = await req.json();

    const scene = await db.scene.create({
      data: {
        playId,
        title,
        videoUrl,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ success: true, scene });
  } catch (error) {
    console.error('Create scene error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
