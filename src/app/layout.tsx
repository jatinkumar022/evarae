import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, Fraunces } from 'next/font/google';
import './styles/theme.css';
import './styles/globals.css';
import Navbar from './components/layouts/Navbar';
import NavigationMenu from './components/layouts/NavigationMenu';
import Footer from './components/layouts/Footer';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Caelvi - Premium Jewellery Collection',
  description:
    'Discover exquisite jewellery collections at Caelvi. Shop for rings, earrings, necklaces, and more. Premium quality with timeless designs.',
  keywords:
    'jewellery, rings, earrings, necklaces, gold, diamond, premium jewellery, Caelvi',
  authors: [{ name: 'Caelvi' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Caelvi - Premium Jewellery Collection',
    description:
      'Discover exquisite jewellery collections at Caelvi. Shop for rings, earrings, necklaces, and more.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caelvi - Premium Jewellery Collection',
    description: 'Discover exquisite jewellery collections at Caelvi.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="https://static.tanishq.com" />
        <link rel="dns-prefetch" href="https://www.tanishq.co.in" />
        <link rel="dns-prefetch" href="https://tanishq.co.in" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://static.tanishq.com" />
        <link rel="preconnect" href="https://www.tanishq.co.in" />
        <link rel="preconnect" href="https://tanishq.co.in" />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${fraunces.variable} font-body antialiased`}
      >
        <div className=" h-[80px] lg:h-[137px]">
          <Navbar />
          <div className="max-lg:hidden">
            <NavigationMenu />
          </div>
        </div>
        <main className="">
          {children}
          <div className="">
            <Footer />
          </div>
        </main>
      </body>
    </html>
  );
}
