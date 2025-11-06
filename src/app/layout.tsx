import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, Fraunces } from 'next/font/google';
import './styles/theme.css';
import './styles/globals.css';
import GlobalLoaderProvider from '@/app/(main)/components/layouts/GlobalLoaderProvider';
import ToastProvider from '@/app/(main)/components/layouts/ToastProvider';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['Georgia', 'serif'],
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
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        
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
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
          defer
        ></script>
      </head>
      <body
        className={`${ibmPlexSans.variable} ${fraunces.variable} font-body antialiased`}
      >
        <GlobalLoaderProvider>
          {children}
          <ToastProvider />
        </GlobalLoaderProvider>
      </body>
    </html>
  );
}
