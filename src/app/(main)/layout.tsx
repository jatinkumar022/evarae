import dynamic from 'next/dynamic';
import Navbar from './components/layouts/Navbar';
import NavigationMenu from './components/layouts/NavigationMenu';

// Dynamically import Footer since it's below the fold and uses framer-motion
const Footer = dynamic(() => import('./components/layouts/Footer'), {
  ssr: true, // Keep SSR for SEO
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-[80px] lg:h-[137px]">
        <Navbar />
        <div className="max-lg:hidden">
          <NavigationMenu />
        </div>
      </div>
      <main className="">{children}</main>
      <div className="">
        <Footer />
      </div>
    </>
  );
}
