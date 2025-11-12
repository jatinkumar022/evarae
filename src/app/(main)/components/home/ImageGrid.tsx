'use client';
import Image from '@/app/(main)/components/ui/FallbackImage';
import Link from 'next/link';
import { useEffect } from 'react';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';

const GridItem = ({
  image,
  slug,
  name,
}: {
  image?: string;
  slug: string;
  name: string;
}) => (
  <Link
    href={`/collections/${slug}`}
    className="relative overflow-hidden rounded-lg group cursor-pointer h-full block min-h-[280px]"
  >
    {image ? (
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
    ) : (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-400">No Image</span>
      </div>
    )}
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform group-hover:translate-y-0 translate-y-4">
        <h3 className="text-2xl lg:text-3xl font-heading text-white font-semibold">
          {name}
        </h3>
        <button
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2 rounded-full text-sm font-semibold"
          aria-label={`Shop ${name} collection`}
        >
          Shop Now
        </button>
      </div>
    </div>
  </Link>
);

const ImageGrid = () => {
  const { data } = useHomepageStore();

  useEffect(() => {
    // Homepage data is loaded centrally in Home page, no need to fetch here
    // Zustand actions are stable, but we only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collections = data?.signatureCollections || [];

  if (collections.length === 0) {
    return null;
  }

  // Display up to 3 collections in a grid layout
  const displayCollections = collections.slice(0, 3);

  return (
    <section className="mt-20">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">
          Signature Collections
        </h1>
        <h2 className="heading-component-main-subheading">
          Crafted with passion, designed to be adored.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
        {displayCollections.map((collection, index) => (
          <div
            key={collection._id}
            className={
              index === 1
                ? 'md:col-span-1 md:row-span-2'
                : 'md:col-span-1 md:row-span-1'
            }
          >
            <GridItem
              image={collection.image}
              slug={collection.slug}
              name={collection.name}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageGrid;
