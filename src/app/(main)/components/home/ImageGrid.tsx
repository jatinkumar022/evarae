'use client';
import Image from '@/app/(main)/components/ui/FallbackImage';
import Link from 'next/link';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';
import Container from '../layouts/Container';

const SignatureCard = ({
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
    className="group block relative h-full"
    aria-label={`Explore ${name} collection`}
  >
    <div className="relative bg-white rounded-3xl h-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image Container - Takes up ~60-70% of card */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      {/* Content Section - Clean white background */}
      <div className="p-6 lg:p-8 flex-1 flex flex-col bg-white">
        {/* Signature Collection Badge */}
        <span className="text-primary text-xs tracking-wider uppercase font-medium mb-3 block">
          SIGNATURE COLLECTION
        </span>

        {/* Collection Title */}
        <h3 className="text-2xl md:text-3xl font-light text-slate-800 mb-4 line-clamp-2">
          {name}
        </h3>

        {/* Divider Line */}
        <div className="w-full h-px bg-slate-200 mb-4"></div>

        {/* Explore Collection Link */}
        <div className="text-slate-700 text-sm font-medium mt-auto">
          Explore Collection
        </div>
      </div>
    </div>
  </Link>
);

const ImageGrid = () => {
  const { data } = useHomepageStore();

  const collections = data?.signatureCollections || [];

  if (collections.length === 0) {
    return null;
  }

  // Display up to 3 collections in a grid layout
  const displayCollections = collections.slice(0, 3);

  return (
    <section className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 py-8 sm:py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16 lg:mb-20">
          <h1 className="heading-component-main-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4">
            Signature Collections
          </h1>
          <h2 className="heading-component-main-subheading text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Crafted with passion, designed to be adored.
          </h2>
        </div>

        {/* Grid - All cards equal size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {displayCollections.map((collection) => (
            <SignatureCard
              key={collection._id}
              image={collection.image}
              slug={collection.slug}
              name={collection.name}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default ImageGrid;
