"use client";

import Image, { StaticImageData } from "next/image";
import React from "react";
import {
  banglesCat,
  chainsCat,
  earringsCat,
  mangalsutraCat,
  pendantsCat,
  ringsCat,
  braceletsCat,
} from "@/app/assets/CategoryGrid";

interface Category {
  title: string;
  image: StaticImageData;
}

const categories: Category[] = [
  {
    title: "Earrings",
    image: earringsCat,
  },
  {
    title: "Rings",
    image: ringsCat,
  },
  {
    title: "Pendants",
    image: pendantsCat,
  },
  {
    title: "Mangalsutra",
    image: mangalsutraCat,
  },
  {
    title: "Bracelets",
    image: braceletsCat,
  },
  {
    title: "Bangles",
    image: banglesCat,
  },
  {
    title: "Chains",
    image: chainsCat,
  },
];

const CategoryItem = ({
  image,
  title,
}: {
  image: StaticImageData;
  title: string;
}) => (
  <div className="text-center group">
    <a href="#" className="inline-block">
      <div className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 p-2 bg-background/70 shadow-sm">
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
      </div>
      <h3 className="mt-4 font-medium text-foreground tracking-wider uppercase text-sm">
        {title}
      </h3>
    </a>
  </div>
);

const ViewAllItem = () => (
  <div className="text-center group">
    <a
      href="#"
      className=" w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full border-2 border-border border-dashed group-hover:border-primary group-hover:border-solid transition-all duration-300 flex items-center justify-center text-center bg-background/70"
    >
      <div className="text-foreground/70 group-hover:text-primary transition-colors duration-300">
        <p className="font-heading text-xl font-bold">10+</p>
        <p className="text-xs uppercase tracking-wider">Categories</p>
      </div>
    </a>
    <h3 className="mt-4 font-medium text-foreground tracking-wider uppercase text-sm">
      View All
    </h3>
  </div>
);

export default function CategoriesGrid() {
  return (
    <section className="mt-20">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Explore by Category</h1>
        <h2 className="heading-component-main-subheading">
          Find the perfect piece to tell your story.
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6 justify-items-center">
        {categories.map((cat, idx) => (
          <CategoryItem key={idx} image={cat.image} title={cat.title} />
        ))}
        <ViewAllItem />
      </div>
    </section>
  );
}
