import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { queryStkPushStatus } from '@/lib/mpesa';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json({ message: 'Missing checkoutRequestId' }, { status: 400 });
    }

    let transaction = await db.transaction.findFirst({
      where: { checkoutRequestId, userId: user.id },
    });

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    // If transaction is already completed, return status immediately
    if (transaction.status === 'COMPLETED') {
      return NextResponse.json({
        status: transaction.status,
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
      });
    }

    // If still pending, query Safaricom directly
    if (transaction.status === 'PENDING') {
      try {
        const queryRes = await queryStkPushStatus(checkoutRequestId);
        console.log('Daraja STK Query Response:', JSON.stringify(queryRes, null, 2));

        const resultCode = queryRes.ResultCode !== undefined ? String(queryRes.ResultCode) : null;

        // ResultCode "0" means successful payment
        if (resultCode === '0') {
          // 1. Update Transaction to COMPLETED
          transaction = await db.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              mpesaReceiptNumber: queryRes.MpesaReceiptNumber || `SBX_${Math.floor(Math.random() * 1000000)}`,
              adminNotes: queryRes.ResultDesc || 'Verified via STK Query API',
            },
          });

          // 2. Safely grant Entitlement (prevent duplicate key crashes if it already exists)
          const existingEntitlement = await db.entitlement.findFirst({
            where: {
              userId: transaction.userId,
              playId: transaction.playId,
              sceneId: transaction.sceneId,
            },
          });

          if (!existingEntitlement) {
            await db.entitlement.create({
              data: {
                userId: transaction.userId,
                playId: transaction.playId,
                sceneId: transaction.sceneId,
                transactionId: transaction.id,
              },
            });
          }

          // 3. Safely create purchase record for backwards compatibility
          if (transaction.playId) {
            const existingPurchase = await db.purchase.findFirst({
              where: {
                userId: transaction.userId,
                playId: transaction.playId,
                status: 'COMPLETED',
              },
            });

            if (!existingPurchase) {
              await db.purchase.create({
                data: {
                  userId: transaction.userId,
                  playId: transaction.playId,
                  sceneId: transaction.sceneId,
                  amount: transaction.amount,
                  status: 'COMPLETED',
                  checkoutId: checkoutRequestId,
                },
              });
            }
          }
        } else if (resultCode && resultCode !== '0') {
          transaction = await db.transaction.update({
            where: { id: transaction.id },
            data: {
              status: resultCode === '1032' ? 'CANCELLED' : 'FAILED',
              adminNotes: queryRes.ResultDesc || 'Payment failed',
            },
          });
        }
      } catch (queryErr) {
        console.error('STK Query API check error:', queryErr);
      }
    }

    return NextResponse.json({
      status: transaction.status,
      mpesaReceiptNumber: transaction.mpesaReceiptNumber,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}