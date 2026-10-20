import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

// 1. GET: Fetch all plays for the admin management table
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const plays = await db.play.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ plays });
  } catch (error: any) {
    console.error('Fetch plays error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch plays' },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new play record
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
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
      bunnyVideoId,
    } = body;

    if (!title || !bunnyVideoId) {
      return NextResponse.json(
        { message: 'Play title and video recording file are required.' },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const play = await db.play.create({
      data: {
        title,
        slug,
        author: author || null,
        price: Number(price) || 0,
        description: description || null,
        castDetails: castDetails || null,
        posterUrl: posterUrl || null,
        published: Boolean(published),
        bunnyVideoId,
      },
    });

    return NextResponse.json({ success: true, play });
  } catch (error: any) {
    console.error('Create play error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create play record' },
      { status: 500 }
    );
  }
}