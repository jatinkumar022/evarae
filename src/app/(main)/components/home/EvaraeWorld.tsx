'use client';
import Link from 'next/link';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';
import Container from '../layouts/Container';

const CollectionCard = ({
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
    className="group block relative h-full"
    aria-label={`Explore ${label} collection`}
  >
    <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl h-full overflow-hidden shadow-sm border border-white/30 transition-all duration-700 hover:shadow-[0_10px_15px_0_rgba(0,0,0,0.08)] hover:bg-white/90 flex flex-col">
      {/* Image Container */}
      <div className={`relative overflow-hidden ${isLarge ? 'aspect-[16/9]' : 'aspect-[4/3]'} group-hover:scale-105 transition-all duration-500`}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            priority={isLarge}
            className="object-cover transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}

        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-gray-900/10 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
      </div>

      {/* Content Section */}
      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        {/* Collection Title */}
        <h3 className={`font-heading text-gray-800 mb-3 tracking-wide group-hover:text-primary transition-colors duration-300 line-clamp-2 ${isLarge ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}`}>
          {label}
        </h3>

        {/* Decorative Divider */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 group-hover:w-24 transition-all duration-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 ml-3"></div>
        </div>

        {/* Call to Action */}
        <div className="flex items-center text-gray-700 font-light tracking-widest group-hover:text-primary transition-colors duration-300 mt-auto">
          <span className="text-sm uppercase">Explore Collection</span>
          <svg
            className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>

      {/* Luxury Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    </div>
  </Link>
);

export default function CaelviWorld() {
  const { data } = useHomepageStore();

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
    <section className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 py-8 sm:py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16 lg:mb-20">
          <h1 className="heading-component-main-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4">
            The World of Caelvi
          </h1>
          <h2 className="heading-component-main-subheading text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Journey through our curated collections.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* Large Card */}
          {displayItems[0] && (
            <div className="md:col-span-2">
              <CollectionCard {...displayItems[0]} />
            </div>
          )}
          {/* Small Cards */}
          {displayItems[1] && <CollectionCard {...displayItems[1]} />}
          {displayItems[2] && <CollectionCard {...displayItems[2]} />}
        </div>
      </Container>
    </section>
  );
}
