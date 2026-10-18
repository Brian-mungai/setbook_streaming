import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 1. GET: Fetch all plays including scenes and video assets
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const plays = await db.play.findMany({
      include: {
        scenes: {
          include: { videoAsset: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ plays });
  } catch (err: any) {
    console.error('Fetch admin plays error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// 2. POST: Create Play, create VideoAsset, and link Scene
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      author,
      price,
      description,
      castDetails,
      posterUrl,
      published,
      videoUrl,
    } = body;

    // Validation: Required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Play title and video recording file are required.' },
        { status: 400 }
      );
    }

    const parsedPrice = price !== undefined && price !== '' ? Number(price) : 0;
    const validDescription = description && description.trim() !== '' 
      ? description.trim() 
      : `Theatrical production of ${title}.`;

    // Generate auto unique slug
    const autoSlug = `${title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

    const defaultPoster = 'https://images.unsplash.com/photo-1485846234645-a62644f84728';
    const originalFilename = videoUrl.split('/').pop() || 'production.mp4';

    // Step 1: Create VideoAsset record for the uploaded video file
    const videoAsset = await db.videoAsset.create({
      data: {
        originalFilename,
        storageKey: videoUrl,
        fileSize: 1024 * 1024 * 10, // Default estimated size placeholder
        mimeType: 'video/mp4',
        processingStatus: 'READY',
      },
    });

    // Step 2: Create Play and nest the Scene linked to the VideoAsset
    const newPlay = await db.play.create({
      data: {
        title: title.trim(),
        slug: autoSlug,
        author: author ? author.trim() : null,
        castDetails: castDetails ? castDetails.trim() : null,
        price: parsedPrice,
        description: validDescription,
        posterUrl: posterUrl || defaultPoster,
        published: published ?? true,
        scenes: {
          create: [
            {
              title: `${title.trim()} - Full Production`,
              description: validDescription,
              duration: 0, // Can be updated later or extracted
              sequence: 1,
              price: 0, // Included in main play price
              videoAssetId: videoAsset.id,
            },
          ],
        },
      },
      include: {
        scenes: {
          include: { videoAsset: true },
        },
      },
    });

    return NextResponse.json({ success: true, play: newPlay }, { status: 201 });
  } catch (err: any) {
    console.error('Create play error detail:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to publish play.' },
      { status: 500 }
    );
  }
}