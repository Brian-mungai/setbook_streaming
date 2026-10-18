import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Locate matching pending transaction
    const transaction = await db.transaction.findFirst({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!transaction) {
      console.warn(`Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Payment Successful
    if (ResultCode === 0) {
      let mpesaReceiptNumber = '';

      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          }
        }
      }

      // Update Transaction status
      const updatedTx = await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber: mpesaReceiptNumber || null,
          adminNotes: ResultDesc,
        },
      });

      // Safely check if entitlement already exists before creating (prevents duplicate webhook errors)
      if (transaction.playId) {
        const existingEntitlement = await db.entitlement.findFirst({
          where: {
            userId: transaction.userId,
            playId: transaction.playId,
          },
        });

        if (!existingEntitlement) {
          await db.entitlement.create({
            data: {
              userId: transaction.userId,
              playId: transaction.playId,
              sceneId: transaction.sceneId,
              transactionId: updatedTx.id,
            },
          });
        }
      }

      // Safely check if purchase record already exists for backwards compatibility
      if (transaction.playId) {
        const existingPurchase = await db.purchase.findFirst({
          where: {
            userId: transaction.userId,
            playId: transaction.playId,
            checkoutId: CheckoutRequestID,
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
              checkoutId: CheckoutRequestID,
            },
          });
        }
      }
    } else {
      // Payment Failed or Cancelled by User
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: ResultCode === 1032 ? 'CANCELLED' : 'FAILED',
          adminNotes: ResultDesc,
        },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    // Always return 200 OK with ResultCode 0 so Safaricom stops retrying on unexpected errors
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}