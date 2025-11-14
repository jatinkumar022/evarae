'use client';
import React from 'react';
import Link from 'next/link';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';
import Container from '../layouts/Container';

const TrendingItem = ({
  image,
  title,
  alt,
  slug,
}: {
  image: string;
  title: string;
  alt: string;
  slug: string;
}) => (
  <div className="group">
    <Link
      href={`/collections/${slug}`}
      className="block"
      aria-label={`Explore ${title} collection`}
    >
      {/* Card Container with minimal styling */}
      <div className="relative overflow-hidden rounded-t-[69px]">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:brightness-110"
          />
          
          {/* Subtle bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        {/* Title - Simple and elegant */}
        <div className="mt-5 space-y-2">
          <h3 className="font-medium text-foreground tracking-wider uppercase text-sm sm:text-base text-center transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>
          <div className="w-12 h-px bg-foreground/20 mx-auto transition-all duration-500 group-hover:w-20 group-hover:bg-primary/40" />
        </div>
      </div>
    </Link>
  </div>
);

function Trending() {
  const { data } = useHomepageStore();

  const collections = data?.trendingCollections || [];
  const trendingConfig = data?.trendingConfig;

  // If trending is disabled or no collections, don't show section
  if (!trendingConfig?.enabled || collections.length === 0) {
    return null;
  }

  // Use dynamic collections - filter out ones without images
  const displayItems = collections
    .filter((collection) => collection.image)
    .slice(0, 3)
    .map((collection) => ({
      id: collection._id,
      title: collection.name,
      image: collection.image!,
      alt: collection.name,
      slug: collection.slug,
    }));

  // Don't show if no valid items
  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="relative mt-16 sm:mt-20 md:mt-24 lg:mt-28 py-8 sm:py-12 md:py-16">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none" />
      
      <Container>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16 lg:mb-20">
          <h1 className="heading-component-main-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4">
            Currently Trending
          </h1>
          <h2 className="heading-component-main-subheading text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Our most popular pieces, chosen for you.
          </h2>
        </div>

        {/* Grid - Clean and spacious */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto px-4">
          {displayItems.map((item) => (
            <TrendingItem
              key={item.id}
              image={item.image}
              title={item.title}
              alt={item.alt}
              slug={item.slug}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Trending;