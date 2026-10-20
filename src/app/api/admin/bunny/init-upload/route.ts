import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { title } = await req.json();
    const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
    const API_KEY = process.env.BUNNY_STREAM_API_KEY!;

    // 1. Tell Bunny Stream to create a new video placeholder container
    const createRes = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
      method: 'POST',
      headers: {
        AccessKey: API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createRes.ok) {
      throw new Error('Failed to create video slot on Bunny.net');
    }

    const videoData = await createRes.json();
    const videoId = videoData.guid; // This is the unique Bunny Video GUID

    // 2. Generate TUS Upload Authentication Signature for secure direct browser upload
    // Formula required by Bunny: SHA256(library_id + api_key + expiration_time + video_id)
    const expirationTime = Math.floor(Date.now() / 1000) + 86400; // valid for 24 hours
    const signatureString = `${LIBRARY_ID}${API_KEY}${expirationTime}${videoId}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    return NextResponse.json({
      success: true,
      videoId,
      libraryId: LIBRARY_ID,
      expirationTime,
      signature,
    });
  } catch (error: any) {
    console.error('Init upload error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}