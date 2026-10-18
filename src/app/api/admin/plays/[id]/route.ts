import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const params = await context.params;
    const playId = params.id;

    // Verify play exists
    const play = await db.play.findUnique({ where: { id: playId } });
    if (!play) {
      return NextResponse.json({ error: 'Play not found.' }, { status: 404 });
    }

    // Delete play from database
    await db.play.delete({ where: { id: playId } });

    return NextResponse.json({ success: true, message: 'Play deleted successfully.' });
  } catch (err: any) {
    console.error('Delete play error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete play.' }, { status: 500 });
  }
}