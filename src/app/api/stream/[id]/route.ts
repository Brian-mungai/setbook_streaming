import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const sceneId = resolvedParams.id;

    // Fetch scene details
    const scene = await db.scene.findUnique({
      where: { id: sceneId },
      include: { play: true },
    });

    if (!scene || !scene.videoUrl) {
      return new NextResponse('Video not found', { status: 404 });
    }

    // Verify user owns an entitlement or purchase for this play/scene
    const entitlement = await db.entitlement.findFirst({
      where: {
        userId: user.id,
        OR: [
          { playId: scene.playId },
          { sceneId: scene.id },
        ],
      },
    });

    const purchase = await db.purchase.findFirst({
      where: {
        userId: user.id,
        playId: scene.playId,
        status: 'COMPLETED',
      },
    });

    if (!entitlement && !purchase && user.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Active entitlement required to stream', { status: 403 });
    }

    // Resolve file path from upload URL (e.g. /uploads/filename.mp4)
    const relativePath = scene.videoUrl.startsWith('/') ? scene.videoUrl.slice(1) : scene.videoUrl;
    const filePath = path.join(process.cwd(), 'public', relativePath);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Video file missing on server storage', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    // Handle HTTP Range requests for smooth scrubbing and chunked streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      if (start >= fileSize) {
        return new NextResponse('Requested range not satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
      };

      return new NextResponse(fileStream as any, {
        status: 206,
        headers,
      });
    } else {
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
      };
      const fileStream = fs.createReadStream(filePath);
      return new NextResponse(fileStream as any, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error('Streaming route error:', error);
    return new NextResponse('Internal streaming error', { status: 500 });
  }
}