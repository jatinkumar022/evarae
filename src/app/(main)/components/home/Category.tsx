'use client';

import React, { useState, MouseEvent, useEffect, memo } from 'react';
import Container from '../layouts/Container';
import Link from 'next/link';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';

const CircleCategories = memo(() => {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const { categories, fetchCategories } = usePublicCategoryStore();

  useEffect(() => {
    // Fetch categories once on mount, using cache
    fetchCategories();
  }, [fetchCategories]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, idx: number) => {
    e.preventDefault();
    setClickedIndex(idx);
    setTimeout(() => {
      window.location.href = e.currentTarget.href;
      setClickedIndex(null);
    }, 1500); // Delay for animation
  };

  return (
    <section className="py-5 sm:py-10 lg:hidden block ">
      <Container className="flex justify-center">
        <div
          className="flex gap-4 sm:gap-6 overflow-x-auto  md:gap-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((item, idx) => {
            return (
              <Link
                href={`/shop/${item.slug}`}
                key={idx}
                className="flex-shrink-0 flex flex-col items-center text-center w-24 md:w-28"
                onClick={e => handleClick(e, idx)}
              >
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
                    <Image
                      src={item.image || ''}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full"
                    />
                  </div>
                  <div
                    className={`absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary z-0 group-hover:animate-spin-slow ${
                      clickedIndex === idx
                        ? 'animate-spin-slow border-dashed'
                        : ''
                    }`}
                  />
                </div>
                <div className="pt-2 text-xs md:text-sm text-foreground leading-tight">
                  <h4 dangerouslySetInnerHTML={{ __html: item.name }} />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
});

CircleCategories.displayName = 'CircleCategories';

export default CircleCategories;
