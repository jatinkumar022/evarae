'use client';

import React, { useState, MouseEvent, memo } from 'react';
import Link from 'next/link';
import Container from '../layouts/Container';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { useHomepageStore, type HomepageCollection } from '@/lib/data/mainStore/homepageStore';

const StoryCollections = memo(() => {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const { data: homepageData } = useHomepageStore();

  const storyCollections = homepageData?.storyCollections ?? [];

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, idx: number) => {
    if (!storyCollections[idx]?.slug) {
      e.preventDefault();
    }
    setClickedIndex(idx);
  };

  if (storyCollections.length === 0) {
    return null;
  }

  return (
    <section className="py-5 sm:py-10 lg:hidden block">
      <Container className="flex justify-center">
        <div
          className="flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {storyCollections.map((item: HomepageCollection, idx: number) => {
            const href = item.slug ? `/collections/${item.slug}` : '#';
            return (
              <Link
                href={href}
                key={item._id || idx}
                aria-label={`View ${item.name}`}
                className="flex-shrink-0 flex flex-col items-center text-center w-24 md:w-28"
                onClick={e => handleClick(e, idx)}
              >
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative z-10 overflow-hidden bg-gray-50">
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
                      clickedIndex === idx ? 'animate-spin-slow border-dashed' : ''
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

StoryCollections.displayName = 'StoryCollections';

export default StoryCollections;
