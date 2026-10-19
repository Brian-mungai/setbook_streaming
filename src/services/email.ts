import nodemailer from 'nodemailer';

console.log("CHECKING SMTP CONFIG:", {
  user: process.env.SMTP_USER,
  hasPass: !!process.env.SMTP_PASSWORD,
});

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Detailed SMTP Error:', error);
    throw error;
  }
}