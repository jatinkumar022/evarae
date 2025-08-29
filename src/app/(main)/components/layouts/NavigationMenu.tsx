'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useScrollDirection from '@/app/(main)/handlers/NavbarVisibilityHandler';
import Link from 'next/link';
import Container from './Container';
// import MegaMenuContent from "./Submenus/MegaMenuContent";
// import KundanPolkiMenu from "./Submenus/KundanPolkiMenu";
// import CollectionsMenu from "./Submenus/CollectionsMenu";
// import RingsMenu from "./Submenus/RingsMenu";
// import EarringsMenu from "./Submenus/EarRingsMenu";
// import GiftingMenu from "./Submenus/GiftingMenu";
// import MoreMenu from "./Submenus/MoreMenu";

// ✅ Just simple links for now
const menuItems = [
  { name: 'Earrings', href: '/shop/earrings' },
  { name: 'Rings', href: '/shop/rings' },
  { name: 'Pendants', href: '/shop/pendants' },
  { name: 'Mangalsutra', href: '/shop/mangalsutra' },
  { name: 'Bracelets', href: '/shop/bracelets' },
  { name: 'Bangles', href: '/shop/bangles' },
  { name: 'Chains', href: '/shop/chains' },
  { name: 'All Categories', href: '/categories' },
];

const MenuItem = ({
  item,
  active,
  setActive,
}: {
  item: { name: string; href: string };
  active: string | null;
  setActive: (item: string | null) => void;
}) => {
  const isActive = active === item.name;

  return (
    <div className="relative flex h-full items-center">
      <Link
        href={item.href}
        onMouseEnter={() => setActive(item.name)}
        className={`relative text-[15px] transition-colors ${
          isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
        }`}
      >
        {item.name}
      </Link>
      {isActive && (
        <motion.div
          className="absolute left-0 -bottom-px h-0.5 w-full bg-primary"
          layoutId="underline"
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
  );
};

const NavigationMenu = () => {
  const [active, setActive] = useState<string | null>(null);
  const scrollDir = useScrollDirection();

  return (
    <motion.div
      className={`fixed z-20 w-full bg-white transition-transform duration-300 hidden lg:block ${
        scrollDir === 'down' ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ top: 80 }}
    >
      <Container>
        <nav
          className="relative flex h-14 items-center justify-center gap-10"
          onMouseLeave={() => setActive(null)}
        >
          {menuItems.map(item => (
            <MenuItem
              key={item.name}
              item={item}
              active={active}
              setActive={setActive}
            />
          ))}

          {/* 
          🔽 Future dropdown submenu (commented for now)
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
          */}
        </nav>
      </Container>
    </motion.div>
  );
};

export default NavigationMenu;
