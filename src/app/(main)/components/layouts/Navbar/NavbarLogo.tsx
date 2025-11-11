'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Philosopher } from 'next/font/google';

const philosopher = Philosopher({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const NavbarLogo = memo(function NavbarLogo() {
  return (
    <Link
      href="/"
      className={`${philosopher.className} text-2xl sm:text-3xl font-bold text-primary-dark hover:text-primary transition-colors`}
    >
      Caelvi
    </Link>
  );
});

