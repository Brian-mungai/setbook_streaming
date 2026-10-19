import NavigationSidebar from '@/components/NavigationSidebar';
import Footer from '@/components/Footer';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <NavigationSidebar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}