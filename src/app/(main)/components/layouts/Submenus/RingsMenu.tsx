import Image from 'next/image';
import Link from 'next/link';
import { ringsCat } from '@/app/(main)/assets/CategoryGrid'; // replace with your ring image

const ringCategories = [
  'Statement Rings',
  'Adjustable Rings',
  'Stackable Rings',
  'Everyday Elegance',
  'Bridal Rings',
  'Birthstone Rings',
];

const favoriteRings = [
  'Emerald Studded Ring',
  'Gold Filigree Stack',
  'Rose Quartz Adjustable',
];

export default function RingsMenu() {
  return (
    <div
      className="bg-white rounded-b-xl"
      style={{
        boxShadow: 'rgba(0, 0, 0, 0.20) 0px 4px 12px',
        clipPath: 'inset(0px -30px -38px)',
      }}
    >
      <div className="grid grid-cols-12 px-8 py-10 gap-8">
        {/* Left: Ring Types Grid */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          {ringCategories.map(name => (
            <Link
              href="#"
              key={name}
              className="group flex items-center justify-center text-center bg-[#fdf4f5] text-dark rounded-lg h-20 text-sm px-3 py-2 hover:bg-primary/10 transition font-medium"
            >
              <span className="group-hover:text-primary transition">
                {name}
              </span>
            </Link>
          ))}
        </div>

        {/* Center: Banner or Story Block */}
        <div className="col-span-5 relative rounded-lg overflow-hidden shadow-md group">
          <Image
            src={ringsCat}
            alt="Rings Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <h3 className="text-lg font-bold text-white">
              Elegance in Every Circle
            </h3>
            <p className="mt-1 text-sm text-gray-200">
              Discover handcrafted rings that speak your style.
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
              Explore Rings
              <span className="transform transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </p>
          </div>
        </div>

        {/* Right: Offers + Favorites */}
        <div className="col-span-3 flex flex-col justify-between">
          {/* Seasonal Offer */}
          <div className="bg-[#f6e6e9] rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-heading mb-2">
              Festive Sparkle
            </h4>
            <p className="text-xs text-dark mb-4">
              Save <span className="font-bold text-primary">25%</span> on
              best-selling rings this season.
            </p>
            <Link
              href="#"
              className="btn btn-filled text-xs px-4 py-2"
              aria-label="Shop rings with 25% discount"
            >
              Shop Now
            </Link>
          </div>

          {/* Favorites */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-heading mb-3">
              Most Loved Rings
            </h4>
            <ul className="space-y-2">
              {favoriteRings.map(ring => (
                <li key={ring}>
                  <Link
                    href="#"
                    className="text-sm text-dark hover:text-primary transition"
                  >
                    {ring}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
