import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  ADMIN_ROUTE_PATH: z.string().min(3),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),
  DARAJA_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  DARAJA_CONSUMER_KEY: z.string(),
  DARAJA_CONSUMER_SECRET: z.string(),
  DARAJA_BUSINESS_SHORT_CODE: z.string(),
  DARAJA_PASSKEY: z.string(),
  DARAJA_CALLBACK_URL: z.string().url(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_ROUTE_PATH: process.env.ADMIN_ROUTE_PATH,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  DARAJA_ENV: process.env.DARAJA_ENV,
  DARAJA_CONSUMER_KEY: process.env.DARAJA_CONSUMER_KEY,
  DARAJA_CONSUMER_SECRET: process.env.DARAJA_CONSUMER_SECRET,
  DARAJA_BUSINESS_SHORT_CODE: process.env.DARAJA_BUSINESS_SHORT_CODE,
  DARAJA_PASSKEY: process.env.DARAJA_PASSKEY,
  DARAJA_CALLBACK_URL: process.env.DARAJA_CALLBACK_URL,
});