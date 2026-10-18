import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { playId, phone } = body;

    if (!playId || !phone) {
      return NextResponse.json({ message: 'Play ID and phone number are required.' }, { status: 400 });
    }

    // Strict phone number sanitization & formatting for Safaricom (254XXXXXXXXX)
    let cleanedPhone = phone.trim().replace(/\D/g, '');
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '254' + cleanedPhone.slice(1);
    } else if (cleanedPhone.startsWith('+')) {
      cleanedPhone = cleanedPhone.slice(1);
    }

    if (!cleanedPhone.startsWith('254') || cleanedPhone.length !== 12) {
      return NextResponse.json(
        { message: 'Invalid phone format. Please use Safaricom format (e.g. 0712345678).' },
        { status: 400 }
      );
    }

    // Fetch play details and price
    const play = await db.play.findUnique({
      where: { id: playId },
    });

    if (!play) {
      return NextResponse.json({ message: 'Play not found.' }, { status: 404 });
    }

    // Load Daraja Environment Variables
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    const shortCode = process.env.DARAJA_BUSINESS_SHORT_CODE || '174379';
    const passkey = process.env.DARAJA_PASSKEY;
    const callbackUrl = process.env.DARAJA_CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !passkey || !callbackUrl) {
      console.error('Missing Daraja API environment variables in .env');
      return NextResponse.json({ message: 'Payment gateway configuration error.' }, { status: 500 });
    }

    // 1. Generate Daraja Access Token
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authString}`,
        },
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Daraja Auth Error:', tokenData);
      return NextResponse.json({ message: 'Failed to authenticate with M-Pesa.' }, { status: 500 });
    }

    const accessToken = tokenData.access_token;

    // 2. Generate Timestamp and Password
    const date = new Date();
    const timestamp =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');

    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // 3. Initiate STK Push Request to Safaricom
    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(play.price),
        PartyA: cleanedPhone,
        PartyB: shortCode,
        PhoneNumber: cleanedPhone,
        CallBackURL: callbackUrl,
        AccountReference: `Setbook ${play.title.slice(0, 10)}`,
        TransactionDesc: `Payment for play: ${play.title}`,
      }),
    });

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData.ResponseCode !== '0') {
      console.error('Safaricom STK Response Error:', stkData);
      return NextResponse.json(
        {
          message: stkData.errorMessage || stkData.ResponseDescription || 'M-Pesa STK push rejected.',
        },
        { status: 400 }
      );
    }

    // 4. Save Pending Transaction Record
    await db.transaction.create({
      data: {
        userId: user.id,
        playId: play.id,
        amount: play.price,
        phone: cleanedPhone,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'STK push initiated successfully. Check your phone.',
      checkoutRequestId: stkData.CheckoutRequestID,
    });
  } catch (error: any) {
    console.error('STK Push Route Fatal Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error during payment.' }, { status: 500 });
  }
}