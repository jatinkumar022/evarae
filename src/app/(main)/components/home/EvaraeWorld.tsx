'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';

const CategoryCard = ({
  href,
  src,
  alt,
  label,
  isLarge = false,
}: {
  href: string;
  src: string;
  alt: string;
  label: string;
  isLarge?: boolean;
}) => (
  <Link
    href={href || '#'}
    className="relative block overflow-hidden rounded-lg group cursor-pointer"
    aria-label={`Explore ${label} collection`}
  >
    {src ? (
      <img
        src={src as string}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
    ) : (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-400">No Image</span>
      </div>
    )}
    <div
      className="absolute bottom-0 left-0 w-full h-1/4"
      style={{
        background:
          'linear-gradient(to top, oklch(0.85 0.07 353.4 / 0.7) 0%, oklch(0.85 0.07 353.4 / 0) 100%)',
      }}
    />
    <div className="absolute bottom-0 left-0 p-6 w-full">
      <h3 className="text-xl lg:text-2xl font-heading text-white font-semibold">
        {label}
      </h3>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform group-hover:translate-y-0 translate-y-2">
        <p className="text-sm text-white/90 mt-1 hover:underline">Shop Now →</p>
      </div>
    </div>
  </Link>
);

export default function CaelviWorld() {
  const { data, fetchHomepage } = useHomepageStore();

  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  const collections = data?.worldOfCaelvi || [];

  // Don't show if no collections
  if (!collections || collections.length === 0) {
    return null;
  }

  // Use dynamic collections - filter out ones without images
  const displayItems = collections
    .filter((collection) => collection.image)
    .slice(0, 3)
    .map((collection, index) => ({
      href: `/collections/${collection.slug}`,
      src: collection.image!,
      alt: collection.name,
      label: collection.name,
      isLarge: index === 0,
    }));

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">The World of Caelvi</h1>
        <h2 className="heading-component-main-subheading">
          Journey through our curated collections.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Large Card */}
        {displayItems[0] && (
          <div className="md:col-span-2">
            <CategoryCard {...displayItems[0]} />
          </div>
        )}
        {/* Small Cards */}
        {displayItems[1] && <CategoryCard {...displayItems[1]} />}
        {displayItems[2] && <CategoryCard {...displayItems[2]} />}
      </div>
    </section>
  );
}
