import type { Metadata } from "next";
import { IBM_Plex_Sans, Fraunces } from "next/font/google";
import "./styles/theme.css";
import "./styles/globals.css";
import Navbar from "./components/layouts/Navbar";
import NavigationMenu from "./components/layouts/NavigationMenu";
import Footer from "./components/layouts/Footer";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Caelvi - Premium Jewellery Collection",
  description:
    "Discover exquisite jewellery collections at Caelvi. Shop for rings, earrings, necklaces, and more. Premium quality with timeless designs.",
  keywords:
    "jewellery, rings, earrings, necklaces, gold, diamond, premium jewellery, Caelvi",
  authors: [{ name: "Caelvi" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Caelvi - Premium Jewellery Collection",
    description:
      "Discover exquisite jewellery collections at Caelvi. Shop for rings, earrings, necklaces, and more.",
    type: "website",
    locale: "en_US",
    url: "https://caelvi.com",
    siteName: "Caelvi",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Caelvi - Premium Jewellery Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Caelvi - Premium Jewellery Collection",
    description: "Discover exquisite jewellery collections at Caelvi.",
    creator: "@caelvi",
  },
  alternates: {
    canonical: "https://caelvi.com",
  },
  other: {
    "theme-color": "#B8860B",
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
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link
          rel="preload"
          href="/favicon.ico"
          as="image"
          type="image/x-icon"
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
        <div className="h-[80px] lg:h-[116px]">
          <Navbar />
          <div className="max-lg:hidden">
            <NavigationMenu />
          </div>
        </div>
        <main>
          {children}
          <div>
            <Footer />
          </div>
        </main>
      </body>
    </html>
  );
}
