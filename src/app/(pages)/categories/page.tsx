'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import {
  banglesCat,
  chainsCat,
  earringsCat,
  mangalsutraCat,
  pendantsCat,
  ringsCat,
  braceletsCat,
} from '@/app/assets/CategoryGrid';

const categories = [
  {
    title: 'Earrings',
    image: earringsCat,
    href: '/earrings',
    subtitle: 'Artisanal Beauty',
    count: '120+ Designs',
  },
  {
    title: 'Rings',
    image: ringsCat,
    href: '/rings',
    subtitle: 'Eternal Symbols',
    count: '95+ Designs',
  },
  {
    title: 'Pendants',
    image: pendantsCat,
    href: '/pendants',
    subtitle: 'Graceful Expressions',
    count: '80+ Designs',
  },
  {
    title: 'Mangalsutra',
    image: mangalsutraCat,
    href: '/mangalsutra',
    subtitle: 'Sacred Traditions',
    count: '45+ Designs',
  },
  {
    title: 'Bracelets',
    image: braceletsCat,
    href: '/bracelets',
    subtitle: 'Delicate Charm',
    count: '60+ Designs',
  },
  {
    title: 'Bangles',
    image: banglesCat,
    href: '/bangles',
    subtitle: 'Traditional Elegance',
    count: '75+ Designs',
  },
  {
    title: 'Chains',
    image: chainsCat,
    href: '/chains',
    subtitle: 'Foundation Style',
    count: '55+ Designs',
  },
];

export default function CategoriesPage() {
  return (
    <div className=" relative overflow-hidden">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-20 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="font-heading my-6 sm:my-8 md:flex justify-center items-center gap-2 flex-col text-accent">
              <h1 className="text-2xl text-amber-600 lg:text-5xl">
                Categories
              </h1>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {categories.map((category, index) => (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group block"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative bg-white/80 rounded-3xl p-8 border border-slate-200/50 hover:border-amber-300/70 transition-all duration-700 hover:shadow-2xl  shadow-sm ">
                    {/* Image Container */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl">
                      <div className="aspect-[4/3] relative">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <Image
                          src={category.image}
                          alt={category.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-600 text-sm tracking-wider uppercase font-medium">
                          {category.subtitle}
                        </span>
                        <span className="text-slate-500 text-xs font-medium">
                          {category.count}
                        </span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-light text-slate-800 group-hover:text-amber-700 transition-colors duration-500">
                        {category.title}
                      </h3>

                      {/* Animated underline */}
                      <div className="relative">
                        <div className="w-full h-px bg-slate-200"></div>
                        <div className="absolute top-0 left-0 h-px bg-gradient-to-r from-amber-400 to-rose-400 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                      </div>

                      {/* Explore button */}
                      <div className="pt-4">
                        <div className="inline-flex items-center space-x-2 text-slate-600 group-hover:text-amber-600 transition-colors duration-500">
                          <span className="text-sm font-medium tracking-wide">
                            Explore Collection
                          </span>
                          <div className="w-0 group-hover:w-6 transition-all duration-500 overflow-hidden">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-amber-300/30 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-rose-300/30 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
