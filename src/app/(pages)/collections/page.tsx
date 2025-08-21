'use client';
import Container from '@/app/components/layouts/Container';
import Image from 'next/image';
import { wedding, dailywear } from '@/app/assets/EvaraeWorld';
import { trendingOne, trendingTwo } from '@/app/assets/Home/Trending';
import { one, two } from '@/app/assets/Home/CAROUSEL';
// Sample collection data with placeholder images
const collections = [
  {
    name: 'Wedding Collection',
    description: 'Opulent designs for your most cherished moments.',
    href: '/shop/wedding',
    image: wedding,
  },
  {
    name: 'Party Wear',
    description: 'Sparkle and shine at every celebration.',
    href: '/shop/party-wear',
    image: trendingOne,
  },
  {
    name: 'Casual Wear',
    description: 'Effortless elegance for every day.',
    href: '/shop/casual',
    image: dailywear,
  },
  {
    name: 'Office Wear',
    description: 'Sophisticated pieces for your workday.',
    href: '/shop/office',
    image: trendingTwo,
  },
  {
    name: 'Traditional',
    description: 'Timeless classics with a cultural touch.',
    href: '/shop/traditional',
    image: one,
  },
  {
    name: 'Modern',
    description: 'Contemporary styles for the trendsetter.',
    href: '/shop/modern',
    image: two,
  },
];
export default function CollectionsPage() {
  return (
    <>
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-50/80 via-rose-50/60 to-purple-50/40 backdrop-blur-sm">
        {/* Luxurious Floating Elements */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Main decorative orbs */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-rose-300/30 rounded-full blur-3xl animate-pulse opacity-60" />
          <div
            className="absolute bottom-32 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/40 rounded-full blur-3xl animate-pulse opacity-40"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-1/2 left-1/6 w-24 h-24 bg-gradient-to-br from-rose-200/50 to-pink-300/30 rounded-full blur-2xl animate-pulse opacity-50"
            style={{ animationDelay: '1s' }}
          />

          {/* Subtle sparkle effects */}
          <div
            className="absolute top-1/3 right-1/3 w-3 h-3 bg-white rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-pink-200 rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <div
            className="absolute top-2/3 right-1/5 w-4 h-4 bg-gradient-to-br from-purple-200 to-transparent rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: '2.5s' }}
          />
        </div>

        <Container>
          <div className="text-center pt-16 sm:pt-24 pb-16 sm:pb-24 relative z-10">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center mb-8">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                <div className="mx-4 w-3 h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-300"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-800 mb-6 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  Curated
                </span>
                <br className="hidden sm:block" />
                <span className="text-gray-700 font-extralight">
                  {' '}
                  Collections
                </span>
              </h1>

              <div className="w-32 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-8"></div>

              <p className="text-gray-600 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed mb-8">
                Discover our handpicked selection of luxury pieces, each telling
                its own story of elegance and refinement
              </p>
            </div>

            {/* Luxury Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400"></div>
                <span className="font-light text-gray-700 tracking-wide">
                  Refined Artistry
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <span className="font-light text-gray-700 tracking-wide">
                  Signature Excellence
                </span>
              </div>
            </div>
          </div>
        </Container>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Enhanced Gallery Grid */}
      <Container className="py-20 relative z-10">
        {/* Section Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4 tracking-wide">
            Our <span className="text-pink-500 font-normal">Exclusive</span>{' '}
            Collections
          </h2>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Each collection represents a unique journey through style, crafted
            with meticulous attention to detail
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
          {collections.map((col, index) => (
            <a
              key={col.name}
              href={col.href}
              className="group block relative"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {/* Main Card */}
              <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl h-full overflow-hidden shadow-sm border border-white/30 transition-all duration-700 hover:shadow-[0_10px_15px_0_rgba(0,0,0,0.08)]  hover:bg-white/90 group">
                {/* Image Container */}
                <div className="relative h-64 lg:h-80 overflow-hidden group-hover:scale-105  transition-all duration-500  ">
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover transition-all duration-700 "
                    sizes="(max-width: 768px) 100vw, 33vw "
                  />

                  {/* Elegant Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-purple-900/10 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />

                  {/* Floating Heart Element */}
                  <div className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-10 ">
                  {/* Collection Title */}
                  <h3 className="text-2xl lg:text-3xl font-light text-gray-800 mb-4 tracking-wide group-hover:text-pink-600 transition-colors duration-300">
                    {col.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-base lg:text-lg font-light leading-relaxed mb-6 opacity-90">
                    {col.description}
                  </p>

                  {/* Decorative Divider */}
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-px bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 group-hover:w-28 transition-all duration-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 ml-3"></div>
                  </div>

                  {/* Call to Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700 font-light tracking-widest group-hover:text-pink-600 transition-colors duration-300">
                      <span className="text-sm uppercase">
                        Explore Collection
                      </span>
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
                </div>

                {/* Luxury Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </div>

              {/* Floating Decorative Elements */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-pink-200/60 to-rose-300/60 opacity-0 group-hover:opacity-80 transition-all duration-500 blur-sm animate-pulse"></div>
              <div
                className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-gradient-to-br from-purple-200/50 to-pink-200/50 opacity-0 group-hover:opacity-60 transition-all duration-700 blur-sm animate-pulse"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </a>
          ))}
        </div>

        {/* Bottom Decorative Section */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center space-x-4 mb-8">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-400"></div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-300 to-purple-400"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-300 to-pink-400"></div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-300"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-purple-300"></div>
          </div>
          <p className="text-gray-500 font-light italic text-lg">
            &ldquo;Where elegance meets artistry&ldquo;
          </p>
        </div>
      </Container>
    </>
  );
}
