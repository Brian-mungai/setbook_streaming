import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const transactions = await db.transaction.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        play: { select: { title: true } },
        scene: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { transactionId, status, adminNotes } = await req.json();
    const updated = await db.transaction.update({
      where: { id: transactionId },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });
    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}