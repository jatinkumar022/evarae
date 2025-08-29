import Image from 'next/image';
import Link from 'next/link';
import { Ring } from '@/app/(main)/assets/NavigationMenu';
import { ringsCat } from '@/app/(main)/assets/CategoryGrid'; // Replace with your real asset

const kundanCategories = [
  'Traditional Kundan',
  'Polki Sets',
  'Bridal Jewelry',
  'Statement Necklaces',
  'Earrings & Maang Tikka',
];

const topPicks = ['Bridal Necklace Set', 'Polki Earrings', 'Kundan Bangles'];

export default function KundanPolkiMenu() {
  return (
    <div
      className="bg-white rounded-b-xl"
      style={{
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 4px 12px',
        clipPath: 'inset(0px -30px -38px)',
      }}
    >
      <div className="grid grid-cols-12 px-8 py-10 gap-8">
        {/* Left: Category List */}
        <div className="col-span-3">
          <h4 className="text-sm font-semibold text-primary-dark mb-4 tracking-wide font-heading">
            Kundan & Polki Styles
          </h4>
          <ul className="space-y-3">
            {kundanCategories.map(name => (
              <li key={name}>
                <Link
                  href="#"
                  className="group flex items-center gap-3 text-sm px-3 py-2 bg-[#fdf4f5] rounded-lg hover:bg-primary/10 transition"
                >
                  <Ring className="h-5 w-5 text-primary-dark group-hover:text-primary transition" />
                  <span className="text-dark group-hover:text-primary">
                    {name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Center: Info + Top Picks */}
        <div className="col-span-5 flex flex-col justify-between">
          {/* Story Section */}
          <div className="bg-[#f6e6e9] rounded-lg p-5 mb-6 shadow-sm">
            <h4 className="text-sm font-heading text-heading mb-2">
              Heritage Craftsmanship
            </h4>
            <p className="text-xs text-dark">
              Experience the timeless grandeur of Kundan & Polki jewelry, where
              regal designs meet meticulous artistry.
            </p>
          </div>

          {/* Top Picks */}
          <div>
            <h4 className="text-sm font-semibold text-heading mb-3">
              Top Picks
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {topPicks.map(item => (
                <Link
                  href="#"
                  key={item}
                  className="group block bg-[#fdf4f5] rounded-md p-3 hover:bg-primary/10 transition"
                >
                  <p className="text-sm text-dark group-hover:text-primary transition font-medium">
                    {item}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Banner + Offer */}
        <div className="col-span-4 relative rounded-lg overflow-hidden shadow-md">
          <Image
            src={ringsCat}
            alt="Kundan & Polki Jewelry"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-lg font-bold text-white">
              Exquisite & Eternal
            </h3>
            <p className="mt-1 text-sm text-gray-200">
              Flat 25% Off on bridal selections
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex btn btn-filled text-xs px-4 py-2"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
