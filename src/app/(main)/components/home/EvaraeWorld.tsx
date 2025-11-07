import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { worldOne, worldThree, worldTwo } from '@/app/(main)/assets/Home/World';
const categories = [
  {
    href: '',
    src: worldOne,
    alt: 'Wedding',
    label: 'Wedding Collection',
    isLarge: true,
  },
  {
    href: '',
    src: worldThree,
    alt: 'Gold',
    label: 'Gold Jewellery',
  },
  {
    href: '',
    src: worldTwo,
    alt: 'Diamond',
    label: 'Diamond Pieces',
  },
];

const CategoryCard = memo(({
  href,
  src,
  alt,
  label,
  isLarge = false,
}: {
  href: string;
  src: StaticImageData;
  alt: string;
  label: string;
  isLarge?: boolean;
}) => (
  <Link
    href={href}
    prefetch={true}
    className="relative block overflow-hidden rounded-lg group cursor-pointer"
    aria-label={`Explore ${label} collection`}
  >
    <Image
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      quality={90}
      sizes={isLarge ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
      loading="lazy"
    />
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
));
CategoryCard.displayName = 'CategoryCard';

const CaelviWorld = memo(function CaelviWorld() {
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
        <div className="md:col-span-2">
          <CategoryCard {...categories[0]} isLarge />
        </div>
        {/* Small Cards */}
        <CategoryCard {...categories[1]} />
        <CategoryCard {...categories[2]} />
      </div>
    </section>
  );
});

CaelviWorld.displayName = 'CaelviWorld';

export default CaelviWorld;
