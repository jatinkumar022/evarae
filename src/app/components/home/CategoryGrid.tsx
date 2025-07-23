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
    title: "EARRINGS",
    image: earringsCat,
  },
  {
    title: "FINGER RINGS",
    image: ringsCat,
  },
  {
    title: "PENDANTS",
    image: pendantsCat,
  },
  {
    title: "MANGALSUTRA",
    image: mangalsutraCat,
  },
  {
    title: "BRACELETS",
    image: braceletsCat,
  },
  {
    title: "BANGLES",
    image: banglesCat,
  },
  {
    title: "CHAINS",
    image: chainsCat,
  },
];

export default function CategoriesGrid() {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">
          Find Your Perfect Match
        </h1>
        <h2 className="heading-component-main-subheading">
          Shop by Categories
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-6 justify-items-center mt-12">
        {categories.map((cat, idx) => (
          <div key={idx} className="w-full p-1">
            <a href="#" className="group">
              <div className="w-full aspect-[6/7] rounded-xl overflow-hidden relative shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="text-center py-3">
                <h6 className="text-sm font-medium text-black uppercase tracking-wider">
                  {cat.title}
                </h6>
              </div>
            </a>
          </div>
        ))}

        {/* View All Card */}
        <div className="w-full p-1">
          <a
            href="#"
            className="group flex flex-col justify-between items-center w-full aspect-[6/7] rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex-grow flex flex-col justify-center items-center text-center">
              <p className="text-2xl font-heading text-primary">10+</p>
              <span className="text-sm text-gray-600 mt-1">
                Categories to chose from
              </span>
            </div>
            <h6 className="text-sm font-medium text-black uppercase tracking-wider">
              VIEW ALL
            </h6>
          </a>
        </div>
      </div>
    </section>
  );
}
