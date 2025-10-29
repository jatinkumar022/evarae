'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';

export default function CategoriesPage() {
  const { categories, status, error, fetchCategories } =
    usePublicCategoryStore();

  useEffect(() => {
    if (status === 'idle') fetchCategories();
  }, [status, fetchCategories]);

  return (
    <div className=" relative overflow-hidden">
      <div className="relative z-10">
        <section className="px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative inline-block">
              {/* Decorative line before */}
              <div className="absolute -left-20 top-2/5 w-16 h-px bg-gradient-to-r from-transparent to-primary/30 hidden md:block"></div>

              <h1 className="text-2xl lg:text-3xl font-heading text-primary tracking-wide">
                Categories
              </h1>

              {/* Decorative line after */}
              <div className="absolute -right-20 top-2/5 w-16 h-px bg-gradient-to-l from-transparent to-primary/30 hidden md:block"></div>

              {/* Subtle underline */}
              <div className="mt-4 w-24 h-px bg-primary/20 mx-auto"></div>
            </div>

            <p className="mt-6 text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Discover our carefully curated jewelry categories
            </p>
          </div>
        </section>

        {/* Loading State - Global loader will handle this */}

        {/* Error State */}
        {status === 'error' && (
          <div className="px-6 lg:px-12 pb-20">
            <div className="max-w-7xl mx-auto text-center text-red-600">
              {error || 'Failed to load categories'}
            </div>
          </div>
        )}

        {/* Empty State */}
        {status === 'success' && categories.length === 0 && (
          <div className="px-6 lg:px-12 pb-20">
            <div className="max-w-7xl mx-auto text-center text-gray-600">
              No categories found.
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {status === 'success' && categories.length > 0 && (
          <section className="px-6 lg:px-12 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {categories.map((category, index) => (
                  <Link
                    key={category.slug}
                    href={`/shop/${category.slug}`}
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
                            src={category.image || '/favicon.ico'}
                            alt={category.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-primary group-hover:!text-amber-600 text-sm tracking-wider uppercase font-medium text-nowrap">
                            {category.description || 'Explore Now'}
                          </span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-light text-slate-800 group-hover:text-amber-700 transition-colors duration-500">
                          {category.name}
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
                              Explore Category
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
        )}
      </div>
    </div>
  );
}
