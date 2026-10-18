const MPESA_ENV = process.env.DARAJA_ENV || 'sandbox';
const BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

export async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials missing in environment variables');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: 'no-store',
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.errorMessage || 'Failed to obtain M-Pesa access token');
  }

  return data.access_token;
}

export async function initiateStkPush({
  phone,
  amount,
  accountReference,
  transactionDesc,
}: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const token = await getMpesaAccessToken();

  const shortCode = process.env.DARAJA_BUSINESS_SHORT_CODE || '174379';
  const passkey = process.env.DARAJA_PASSKEY;
  const callbackUrl = process.env.DARAJA_CALLBACK_URL;

  if (!passkey || !callbackUrl) {
    throw new Error('M-Pesa passkey or callback URL missing');
  }

  // Format timestamp (YYYYMMDDHHmmss)
  const date = new Date();
  const timestamp =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');

  // Generate Base64 Password
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  // Sanitize phone number (Must start with 254)
  let formattedPhone = phone.trim().replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = `254${formattedPhone.slice(1)}`;
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.slice(1);
  }

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference.slice(0, 12),
    TransactionDesc: transactionDesc.slice(0, 12),
  };

  const response = await fetch(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  return { response: data, formattedPhone };
}

export async function queryStkPushStatus(checkoutRequestId: string) {
  const token = await getMpesaAccessToken();
  const shortCode = process.env.DARAJA_BUSINESS_SHORT_CODE || '174379';
  const passkey = process.env.DARAJA_PASSKEY;

  if (!passkey) {
    throw new Error('M-Pesa passkey missing');
  }

  // Format timestamp (YYYYMMDDHHmmss)
  const date = new Date();
  const timestamp =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');

  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(
    `${BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  return await response.json();
}