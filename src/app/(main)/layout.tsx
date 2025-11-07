'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load heavy layout components - only load when needed
const Navbar = dynamic(() => import('./components/layouts/Navbar'), {
  ssr: true, // Navbar should be SSR for SEO and initial render
});

const NavigationMenu = dynamic(() => import('./components/layouts/NavigationMenu'), {
  ssr: true, // NavigationMenu should be SSR for initial render
});

const Footer = dynamic(() => import('./components/layouts/Footer'), {
  ssr: true, // Footer should be SSR for SEO
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
