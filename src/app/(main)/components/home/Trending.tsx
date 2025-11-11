'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';

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
}) => {
  const content = (
    <>
      <div className="bg-muted rounded-t-full overflow-hidden">
        <Image
          src={image}
          alt={alt}
          width={640}
          height={640}
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out h-full sm:h-[485px] h-[395px]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="py-4">
        <h3 className="font-medium text-foreground tracking-wider uppercase text-sm group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </>
  );

  return (
    <div className="group text-center">
      <Link
        href={`/collections/${slug}`}
        aria-label={`Explore ${title} collection`}
      >
        {content}
      </Link>
    </div>
  );
};

function Trending() {
  const { data, fetchHomepage } = useHomepageStore();

  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

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
    <section className="mt-20">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Currently Trending</h1>
        <h2 className="heading-component-main-subheading">
          Our most popular pieces, chosen for you.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-6">
        {displayItems.map(item => (
          <TrendingItem
            key={item.id}
            image={item.image}
            title={item.title}
            alt={item.alt}
            slug={item.slug}
          />
        ))}
      </div>
    </section>
  );
}

export default Trending;
