import Image from 'next/image';
import Link from 'next/link';
import {
  earringsCat,
  mangalsutraCat,
  banglesCat,
  chainsCat,
  ringsCat,
  pendantsCat,
  braceletsCat,
} from '@/app/(main)/assets/CategoryGrid'; // Replace with your icons

const categories = [
  { name: 'earringsCat', icon: earringsCat },
  { name: 'mangalsutraCat', icon: mangalsutraCat },
  { name: 'banglesCat', icon: banglesCat },
  { name: 'chainsCat', icon: chainsCat },
  { name: 'ringsCat', icon: ringsCat },
  { name: 'pendantsCat', icon: pendantsCat },
  { name: 'braceletsCat', icon: braceletsCat },
];

const tags = [
  'Festive Wear',
  'Daily Chic',
  'Minimal Essentials',
  'Statement Looks',
  'Gifting Favorites',
];

export default function MoreJewelryMenu() {
  return (
    <div
      className="bg-white rounded-b-xl"
      style={{
        boxShadow: 'rgba(0, 0, 0, 0.20) 0px 4px 12px',
        clipPath: 'inset(0px -30px -38px)',
      }}
    >
      <div className="grid grid-cols-12 px-8 py-10 gap-8">
        {/* Category Grid */}
        <div className="col-span-6">
          <h4 className="text-sm font-semibold text-primary-dark mb-4 tracking-wide font-heading">
            All Things Sparkling
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {categories.map(item => (
              <Link
                href="#"
                key={item.name}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-primary/10 transition"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200/50 group-hover:bg-primary/10 transition-all">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-all"
                  />
                </div>
                <span className="text-sm group-hover:font-medium group-hover:text-primary transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Tags or Styles */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-heading mb-3">
              Explore by Style
            </h4>
            <div className="flex flex-wrap gap-3">
              {tags.map(tag => (
                <Link
                  key={tag}
                  href="#"
                  className="px-3 py-1 text-xs rounded-full bg-[#fdf4f5] text-dark hover:bg-primary/10 hover:text-primary transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Jewelry Visual */}
        <div className="col-span-6 relative rounded-lg overflow-hidden shadow-md">
          <Image
            src={earringsCat}
            alt="Featured Fine Jewelry"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-lg font-bold text-white">Unbox Every Spark</h3>
            <p className="mt-1 text-sm text-gray-200">
              Curated must-haves from every category
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex btn btn-filled text-xs px-4 py-2"
            >
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
