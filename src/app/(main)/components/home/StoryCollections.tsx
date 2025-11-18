'use client';

import React, { useState, MouseEvent, memo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '../layouts/Container';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { useHomepageStore, type HomepageCollection } from '@/lib/data/mainStore/homepageStore';

const StoryCollections = memo(() => {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const { data: homepageData } = useHomepageStore();
  const router = useRouter();
  const timeoutRefs = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const storyCollections = homepageData?.storyCollections ?? [];

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const handleClick = (e: MouseEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();

    const item = storyCollections[idx];
    if (!item?.slug) {
      return;
    }

    // Clear any existing timeout for this index
    if (timeoutRefs.current[idx]) {
      clearTimeout(timeoutRefs.current[idx]);
    }

    // Set clicked state to show animation
    setClickedIndex(idx);

    // Navigate after a delay (800ms)
    timeoutRefs.current[idx] = setTimeout(() => {
      router.push(`/collections/${item.slug}`);
      setClickedIndex(null);
    }, 800);
  };

  if (storyCollections.length === 0) {
    return null;
  }

  return (
    <section className="py-5 sm:py-10 lg:hidden block mt-4 sm:mt-6">
      <Container className="flex justify-center">
        <div
          className="flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto overflow-y-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {storyCollections.map((item: HomepageCollection, idx: number) => {
            return (
              <div
                key={item._id || idx}
                className="flex-shrink-0 flex flex-col items-center text-center w-24 md:w-28 cursor-pointer py-2"
                onClick={e => handleClick(e, idx)}
              >
                <div className="relative group w-20 h-20 md:w-24 md:h-24 overflow-visible">
                  {/* Border - Always visible, spins on hover and click */}
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-primary z-10 transition-all duration-300 ${clickedIndex === idx
                      ? 'animate-spin-slow border-dashed scale-110'
                      : 'group-hover:animate-spin-slow'
                      }`}
                  />
                  {/* Image Container - Slightly smaller to create gap between border and image */}
                  <div className="absolute inset-1.5 sm:inset-2 rounded-full overflow-hidden z-0">
                    <Image
                      src={item.image || ''}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="pt-2 text-xs md:text-sm text-foreground leading-tight">
                  <h4 dangerouslySetInnerHTML={{ __html: item.name }} />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
});

StoryCollections.displayName = 'StoryCollections';

export default StoryCollections;
