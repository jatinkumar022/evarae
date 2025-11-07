'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useScrollDirection from '@/app/(main)/handlers/NavbarVisibilityHandler';
import Link from 'next/link';
import Container from './Container';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';

const NavigationMenu = () => {
  const [active, setActive] = useState<string | null>(null);
  const scrollDir = useScrollDirection();

  const { categories, status, fetchCategories } = usePublicCategoryStore();

  // Only fetch if needed - store handles smart caching
  useEffect(() => {
    if (status === 'idle') {
      fetchCategories(); // Will skip if data is fresh
    }
  }, [status, fetchCategories]);

  const topCategories = categories.slice(0, 7);

  return (
    <motion.div
      className={`fixed z-20 w-full bg-white transition-transform duration-300 hidden lg:block ${
        scrollDir === 'down' ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ top: 80 }}
    >
      <Container>
        <nav
          className="relative flex h-14 items-center justify-center gap-10"
          onMouseLeave={() => setActive(null)}
        >
          {status === 'success' &&
            topCategories.map(item => (
              <div
                key={item.slug}
                className="relative flex h-full items-center"
              >
                <Link
                  href={`/shop/${item.slug}`}
                  prefetch={true}
                  onMouseEnter={() => setActive(item.name)}
                  className={`relative text-[15px] transition-colors ${
                    active === item.name
                      ? 'text-primary'
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
                {active === item.name && (
                  <motion.div
                    className="absolute left-0 -bottom-px h-0.5 w-full bg-primary"
                    layoutId="underline"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            ))}

          <div className="relative flex h-full items-center">
            <Link
              href="/categories"
              prefetch={true}
              onMouseEnter={() => setActive('All Categories')}
              className={`relative text-[15px] transition-colors ${
                active === 'All Categories'
                  ? 'text-primary'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              All Categories
            </Link>
            {active === 'All Categories' && (
              <motion.div
                className="absolute left-0 -bottom-px h-0.5 w-full bg-primary"
                layoutId="underline"
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </nav>
      </Container>
    </motion.div>
  );
};

export default NavigationMenu;
