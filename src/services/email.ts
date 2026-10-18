import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Always log to terminal in development for quick testing
  console.log(`\n================ EMAIL OTP LOG ================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${html}`);
  console.log(`===============================================\n`);

  // If running locally or without proper SMTP setup, return early without throwing
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER || process.env.SMTP_USER.includes('dummy')) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@setbookstreaming.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('SMTP Email Delivery Warning (proceeding in dev fallback mode):', error);
  }
}