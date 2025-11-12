'use client';

import Image from '@/app/(main)/components/ui/FallbackImage';
import React, { useEffect } from 'react';
import Link from 'next/link';

import {
  PublicCategory,
  usePublicCategoryStore,
} from '@/lib/data/mainStore/categoryStore';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';

const CategoryItem = ({
  image,
  slug,
  title,
}: {
  image: string;
  slug: string;
  title: string;
}) => (
  <div className="text-center group">
    <Link
      href={`/shop/${slug}`}
      className="inline-block"
      aria-label={`Explore ${slug} collection`}
    >
      <div className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 p-2 bg-background/70 shadow-sm">
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <Image
            src={image}
            alt={slug}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
      </div>
      <h3 className="mt-4 font-medium text-foreground tracking-wider uppercase text-sm">
        {title}
      </h3>
    </Link>
  </div>
);

const ViewAllItem = ({ categories }: { categories: PublicCategory[] }) => (
  <div className="text-center group">
    <Link
      href="/categories"
      className=" w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full border-2 border-border border-dashed group-hover:border-primary group-hover:border-solid transition-all duration-300 flex items-center justify-center text-center bg-background/70"
      aria-label="View all jewellery categories"
    >
      <div className="text-foreground/70 group-hover:text-primary transition-colors duration-300">
        <p className="font-heading text-xl font-bold">
          {categories.length > 9 ? '10+' : 'All'}
        </p>
        <p className="text-xs uppercase tracking-wider">Categories</p>
      </div>
    </Link>
    <h3 className="mt-4 font-medium text-foreground tracking-wider uppercase text-sm">
      View All
    </h3>
  </div>
);

export default function CategoriesGrid() {
  const { categories: storeCategories } = usePublicCategoryStore();
  const { data } = useHomepageStore();

  // Categories are already loaded in Navbar on initial load, using store cache
  // Homepage data is loaded centrally in Home page

  // Use categories from homepage if available, otherwise use store
  const categories = data?.categories && data.categories.length > 0 
    ? data.categories 
    : storeCategories;
  
  const topCategories = categories.slice(0, 9);
  return (
    <section className="">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Explore by Category</h1>
        <h2 className="heading-component-main-subheading">
          Find the perfect piece to tell your story.
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6 justify-items-center">
        {topCategories.map((cat, idx) => (
          <CategoryItem
            key={idx}
            image={cat.image || ''}
            slug={cat.slug}
            title={cat.name}
          />
        ))}
        {topCategories.length > 0 && <ViewAllItem categories={categories} />}
      </div>
    </section>
  );
}
