import { NextResponse } from 'next/server';
import https from 'https';

function sendEmailViaHttps(apiKey: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      family: 4, // <-- Forces IPv4 to bypass Parrot OS IPv6 routing blocks
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = responseBody ? JSON.parse(responseBody) : {};
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode || 500, message: parsed.message || responseBody || 'Resend API error' });
          }
        } catch (e) {
          reject({ status: res.statusCode || 500, message: responseBody || 'Invalid JSON response from Resend' });
        }
      });
    });

    req.on('error', (error: any) => {
      reject({ status: 500, message: `Network failed [${error.code || 'UNKNOWN'}]` });
    });

    req.write(data);
    req.end();
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: RESEND_API_KEY is missing in your .env file.' },
        { status: 500 }
      );
    }

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const recipientEmail = 'brianmungai299@gmail.com';

    const payload = {
      from: 'Setbook Streaming <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `New Contact Message from ${name} - Setbook Platform`,
      reply_to: email,
      text: `You have received a new message from your contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #09090b; color: #f4f4f5; border-radius: 12px;">
          <div style="max-width: 600px; margin: auto; background: #18181b; padding: 30px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">New Message from Contact Form</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #f59e0b;">${email}</a></p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 20px 0;" />
            <p style="white-space: pre-wrap; line-height: 1.6; color: #d4d4d8;">${message}</p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 20px 0;" />
            <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">You can click <strong>Reply</strong> in your inbox to respond directly to ${name}.</p>
          </div>
        </div>
      `,
    };

    const result = await sendEmailViaHttps(apiKey, payload);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[Contact API Exception]:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while dispatching email.' },
      { status: err?.status || 500 }
    );
  }
}