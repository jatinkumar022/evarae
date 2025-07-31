import React from "react";
import Image from "next/image";
import { pendantsCat, earringsCat } from "@/app/assets/CategoryGrid";
import { Earrings, Ring } from "@/app/assets/NavigationMenu";

const filterLinks = ["Price", "Occasion", "Gold Coin", "Men", "Metal"];

const categoryLinks = [
  { name: "Bangles", icon: Ring },
  { name: "Bracelets", icon: Ring },
  { name: "Earrings", icon: Earrings },
  { name: "Gold Chains", icon: Ring },
  { name: "Pendants", icon: Ring },
  { name: "Rings", icon: Ring },
  { name: "Engagement Rings", icon: Ring },
  { name: "Necklaces", icon: Ring },
  { name: "Nose Pins", icon: Ring },
  { name: "Kadas", icon: Ring },
  { name: "Mangalsutras", icon: Ring },
  { name: "Jhumkas", icon: Earrings },
];

const MegaMenuContent = () => (
  <div
    className="bg-white rounded-b-xl "
    style={{
      boxShadow: "rgba(0, 0, 0, 0.20) 0px 4px 12px",
      clipPath: "inset(0px -30px -38px)",
    }}
  >
    <div className="grid grid-cols-12 px-8 py-10 gap-8">
      {/* Filters */}
      <div className="col-span-2">
        <h4 className="text-sm font-semibold text-primary mb-3 tracking-wide font-heading">
          Filter By
        </h4>
        <ul className="space-y-2">
          {filterLinks.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="block px-4 py-2.5 rounded-md text-sm text-gray-700 hover:bg-primary/10 transition-colors"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      <div className="col-span-7 border-x border-gray-200 px-8">
        <div className="grid grid-cols-3 gap-5">
          {categoryLinks.map((item) => (
            <a
              href="#"
              key={item.name}
              className="group flex items-center gap-4 px-2 py-1.5 rounded-lg bg-gray-50 "
            >
              <div className="h-11 w-11 flex items-center justify-center rounded-full bg-gray-200/50 group-hover:bg-primary/10 transition-all">
                <item.icon className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-gray-800 group-hoverfont-medium group-hover:text-primary transition-colors">
                {item.name}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <Image
                  src={pendantsCat}
                  alt="promo 1"
                  width={52}
                  height={52}
                  className="rounded-md border border-white shadow-sm"
                />
                <Image
                  src={earringsCat}
                  alt="promo 2"
                  width={52}
                  height={52}
                  className="rounded-md border border-white shadow-sm"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">
                  From Classic to Contemporary
                </h4>
                <p className="text-xs text-gray-600">
                  6000+ Stunning Designs to Explore.
                </p>
              </div>
            </div>
            <a
              href="#"
              className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
            >
              View All
            </a>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="col-span-3">
        <a
          href="#"
          className="group relative block w-full h-full rounded-lg overflow-hidden shadow-md"
        >
          <Image
            src={earringsCat}
            alt="Featured"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-lg font-bold text-white">
              Handcrafted Masterpieces
            </h3>
            <p className="mt-1 text-sm text-gray-200">
              For women who inspire new narratives.
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
              Explore Now
              <span className="transform transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </p>
          </div>
        </a>
      </div>
    </div>
  </div>
);

export default MegaMenuContent;
