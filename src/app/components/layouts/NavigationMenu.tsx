"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useScrollDirection from "@/app/handlers/NavbarVisibilityHandler";
import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import {
  AllJewellery,
  Collections,
  DailyWear,
  Diamond,
  Earrings,
  Gifting,
  Gold,
  Ring,
  Wedding,
} from "@/app/assets/NavigationMenu";

const menuItems = [
  { name: "All Jewellery", href: "#", icon: AllJewellery },
  { name: "Gold", href: "#", isMain: true, icon: Gold },
  { name: "Diamond", href: "#", icon: Diamond },
  { name: "Earrings", href: "#", icon: Earrings },
  { name: "Rings", href: "#", icon: Ring },
  { name: "Daily Wear", href: "#", icon: DailyWear },
  { name: "Collections", href: "#", icon: Collections },
  { name: "Wedding", href: "#", icon: Wedding },
  { name: "Gifting", href: "#", icon: Gifting },
  { name: "More", href: "#" },
];

const goldCategories = [
  { name: "Bangles", icon: Ring },
  { name: "Gold Chains", icon: Ring },
  { name: "Engagement Rings", icon: Ring },
  { name: "Kadas", icon: Ring },
  { name: "Bracelets", icon: Ring },
  { name: "Pendants", icon: Ring },
  { name: "Necklaces", icon: Ring },
  { name: "Mangalsutras", icon: Ring },
  { name: "Earrings", icon: Earrings },
  { name: "Rings", icon: Ring },
  { name: "Nose Pins", icon: Ring },
  { name: "Jhumkas", icon: Earrings },
];

const MenuItem = ({
  item,
  active,
  setActive,
}: {
  item: {
    name: string;
    href: string;
    isMain?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  };
  active: string | null;
  setActive: (item: string | null) => void;
}) => {
  const isActive = active === item.name;

  return (
    <div
      onMouseEnter={() => setActive(item.name)}
      onMouseLeave={() => setActive(null)}
      className="relative py-1 flex items-center gap-2 cursor-pointer bg-white"
    >
      {item.icon && <item.icon className="w-4 h-4" />}
      <Link
        href={item.href}
        className={`relative inline-block  ${
          isActive ? "text-primary font-medium" : "text-dark "
        }`}
      >
        <span className="relative z-10 text-[15px] ">{item.name}</span>
      </Link>
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute left-1/2 bottom-0  h-[2px] bg-primary"
            initial={{ width: 0, x: "-50%" }}
            animate={{ width: "100%", x: "-50%" }}
            exit={{ width: 0, x: "-50%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isActive && item.name === "Gold" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed top-[38px] left-0 w-full bg-white border-t border-neutral-200 shadow-lg z-40"
          >
            <Container>
              <div className="flex gap-8 py-8">
                {/* Sidebar */}
                <div className="w-1/5 bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 text-red-600">
                    Category
                  </h3>
                  <ul className="space-y-2">
                    {["Price", "Occasion", "Gold Coin", "Men", "Metal"].map(
                      (cat) => (
                        <li key={cat}>
                          <Link
                            href="#"
                            className="text-neutral-700 hover:text-red-600"
                          >
                            {cat}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-4">
                  {goldCategories.map((category) => (
                    <Link
                      href="#"
                      key={category.name}
                      className="flex items-center gap-4"
                    >
                      <div className="bg-gray-100 p-3 rounded-full">
                        <category.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="w-1/4">
                  <Image
                    src="/logo.svg"
                    alt="promo"
                    width={300}
                    height={400}
                    className="rounded-lg object-cover"
                  />
                  <div className="mt-4">
                    <p className="font-semibold">
                      Intricately handcrafted Kundan masterpieces for the women
                      who inspire new narratives.
                    </p>
                    <Link href="#" className="text-red-600 hover:underline">
                      Explore Now
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <Image
                      src="/logo.svg"
                      alt="promo 1"
                      width={60}
                      height={60}
                      className="rounded-md border-2 border-white"
                    />
                    <Image
                      src="/logo.svg"
                      alt="promo 2"
                      width={60}
                      height={60}
                      className="rounded-md border-2 border-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">
                      From Classic to Contemporary.
                    </p>
                    <p className="text-sm text-gray-600">
                      Explore 6000+ Stunning Designs.
                    </p>
                  </div>
                </div>
                <Link
                  href="#"
                  className="bg-primary text-white px-6 py-2 rounded-md"
                >
                  View All
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavigationMenu = () => {
  const [active, setActive] = useState<string | null>(null);
  const scrollDir = useScrollDirection();

  return (
    <motion.div
      className={`fixed top-[56px]  z-20 w-full transition-transform duration-300 ${
        scrollDir === "down" ? "-translate-y-full" : "translate-y-3"
      }`}
    >
      <div className="bg-white pb-1">
        <Container>
          <nav className="flex items-center justify-between gap-2 relative z-20">
            {menuItems.map((item) => (
              <MenuItem
                key={item.name}
                item={item}
                active={active}
                setActive={setActive}
              />
            ))}
          </nav>
        </Container>
      </div>
    </motion.div>
  );
};

export default NavigationMenu;
