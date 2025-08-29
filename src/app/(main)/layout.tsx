import Navbar from './components/layouts/Navbar';
import NavigationMenu from './components/layouts/NavigationMenu';
import Footer from './components/layouts/Footer';

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
