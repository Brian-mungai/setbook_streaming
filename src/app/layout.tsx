import type { Metadata } from 'next';
import './globals.css'; // Global styles loaded here

export const metadata: Metadata = {
  title: 'Setbook Streaming Platform',
  description: 'Stream theatrical setbook productions securely with M-Pesa',
  icons: {
    icon: [
      { url: '/logo.png' }, // Points to your public/logo.png file
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-zinc-950 text-white min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}