"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useScrollDirection from "@/app/handlers/NavbarVisibilityHandler";
import Link from "next/link";
import Container from "./Container";
import MegaMenuContent from "./Submenus/MegaMenuContent";
import KundanPolkiMenu from "./Submenus/KundanPolkiMenu";
import CollectionsMenu from "./Submenus/CollectionsMenu";
import RingsMenu from "./Submenus/RingsMenu";
import EarringsMenu from "./Submenus/EarRingsMenu";
import GiftingMenu from "./Submenus/GiftingMenu";
import MoreMenu from "./Submenus/MoreMenu";

const menuItems = [
  { name: "All Jewellery", href: "#", submenu: MegaMenuContent },
  { name: "Kundan & Polki", href: "#", submenu: KundanPolkiMenu },
  { name: "Collections", href: "#", submenu: CollectionsMenu },
  { name: "Earrings", href: "#", submenu: EarringsMenu },
  { name: "Rings", href: "#", submenu: RingsMenu },
  { name: "Gifting", href: "#", submenu: GiftingMenu },
  { name: "More", href: "#", submenu: MoreMenu },
];

const MenuItem = ({
  item,
  active,
  setActive,
}: {
  item: { name: string; href: string; submenu?: React.ComponentType };
  active: string | null;
  setActive: (item: string | null) => void;
}) => {
  const isActive = active === item.name;
  const handleMouseEnter = () => {
    setActive(item.name);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className="relative flex h-full items-center"
    >
      <Link
        href={item.href}
        className={`relative text-[15px] transition-colors ${
          isActive ? "text-primary" : "text-gray-700 hover:text-primary"
        }`}
      >
        {item.name}
      </Link>
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute left-0 -bottom-px h-0.5 w-full bg-primary"
            layoutId="underline"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const NavigationMenu = () => {
  const [active, setActive] = useState<string | null>(null);
  const scrollDir = useScrollDirection();

  const ActiveSubMenu = active
    ? menuItems.find((item) => item.name === active)?.submenu
    : null;

  return (
    <motion.div
      className={`fixed z-20 w-full bg-white transition-transform duration-300 hidden lg:block ${
        scrollDir === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ top: 80 }}
    >
      <Container>
        <nav
          className="relative flex h-14 items-center justify-center gap-10"
          onMouseLeave={() => setActive(null)}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.name}
              item={item}
              active={active}
              setActive={setActive}
            />
          ))}
          <AnimatePresence>
            {ActiveSubMenu && (
              <motion.div
                onMouseLeave={() => setActive(null)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute left-0 top-full w-full"
              >
                <ActiveSubMenu />
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </Container>
    </motion.div>
  );
};

export default NavigationMenu;
