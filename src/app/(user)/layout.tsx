import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import NavigationSidebar from '@/components/NavigationSidebar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Setbook Streaming Platform',
  description: 'Watch acted setbooks streamed securely via M-Pesa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased`}>
        <NavigationSidebar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}