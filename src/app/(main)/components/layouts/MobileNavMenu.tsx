'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { RxCross2 } from 'react-icons/rx';
import { BsInboxes } from 'react-icons/bs';
import {
  Store,
  New,
  Search,
  Heart,
  ShoppingBag,
  User,
} from '@/app/(main)/assets/Navbar';
// import MegaMenuContent from './Submenus/MegaMenuContent';
// import KundanPolkiMenu from './Submenus/KundanPolkiMenu';
// import CollectionsMenu from './Submenus/CollectionsMenu';
// import RingsMenu from './Submenus/RingsMenu';
// import EarringsMenu from './Submenus/EarRingsMenu';
// import GiftingMenu from './Submenus/GiftingMenu';
// import MoreMenu from './Submenus/MoreMenu';
import { LogoCaelvi } from '@/app/(main)/assets';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';

// const menuItems = [
//   { name: 'All Jewellery', href: '#', submenu: MegaMenuContent },
//   { name: 'Kundan & Polki', href: '#', submenu: KundanPolkiMenu },
//   { name: 'Collections', href: '#', submenu: CollectionsMenu },
//   { name: 'Earrings', href: '#', submenu: EarringsMenu },
//   { name: 'Rings', href: '#', submenu: RingsMenu },
//   { name: 'Gifting', href: '#', submenu: GiftingMenu },
//   { name: 'More', href: '#', submenu: MoreMenu },
// ];

const quickLinks = [
  {
    name: 'All Jewellery',
    href: '/all-jewellery',
    icon: <Store className="h-4 w-4" />,
  },
  {
    name: 'New Arrivals',
    href: '/new-arrivals',
    icon: <New className="h-4 w-4" />,
  },
  {
    name: 'Collections',
    href: '/collections',
    icon: <BsInboxes size={13} />,
  },
];

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavMenu = ({ isOpen, onClose }: MobileNavMenuProps) => {
  // const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const { categories, status, fetchCategories } = usePublicCategoryStore();

  useEffect(() => {
    if (status === 'idle') fetchCategories();
  }, [status, fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // const handleSubmenuToggle = (itemName: string) => {
  //   setActiveSubmenu(activeSubmenu === itemName ? null : itemName);
  // };

  // // Mobile-friendly submenu content
  // const getMobileSubmenuContent = (itemName: string) => {
  //   switch (itemName) {
  //     case 'All Jewellery':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'Bangles',
  //               'Bracelets',
  //               'Earrings',
  //               'Gold Chains',
  //               'Pendants',
  //               'Rings',
  //               'Engagement Rings',
  //               'Necklaces',
  //               'Nose Pins',
  //               'Kadas',
  //               'Mangalsutras',
  //               'Jhumkas',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href={`/shop/${category.toLowerCase()}`}
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               View All Jewellery →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     case 'Kundan & Polki':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'Kundan Sets',
  //               'Polki Jewellery',
  //               'Bridal Collection',
  //               'Traditional Sets',
  //               'Modern Kundan',
  //               'Polki Rings',
  //               'Kundan Necklaces',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href="#"
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               Explore Kundan & Polki →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     case 'Collections':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'Wedding Collection',
  //               'Daily Wear',
  //               'Festival Special',
  //               'Bridal Sets',
  //               'Party Wear',
  //               'Traditional',
  //               'Contemporary',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href="#"
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               View All Collections →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     case 'Earrings':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'Studs',
  //               'Jhumkas',
  //               'Hoops',
  //               'Chandbalis',
  //               'Drops',
  //               'Clusters',
  //               'Traditional',
  //               'Modern',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href="#"
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               Shop All Earrings →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     case 'Rings':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'Engagement Rings',
  //               'Wedding Rings',
  //               'Diamond Rings',
  //               'Gold Rings',
  //               'Silver Rings',
  //               'Solitaire',
  //               'Three Stone',
  //               'Eternity',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href="#"
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               Shop All Rings →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     case 'Gifting':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'For Her',
  //               'For Him',
  //               'Wedding Gifts',
  //               'Birthday Gifts',
  //               'Anniversary',
  //               'Festival Gifts',
  //               'Corporate Gifts',
  //               'Personalized',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href="#"
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               Explore Gifting →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     case 'More':
  //       return (
  //         <div className="space-y-3">
  //           <div className="grid grid-cols-2 gap-3">
  //             {[
  //               'About Us',
  //               'Store Locator',
  //               'Customer Care',
  //               'Track Order',
  //               'Size Guide',
  //               'Jewellery Care',
  //               'Blog',
  //               'Contact',
  //             ].map(category => (
  //               <Link
  //                 key={category}
  //                 href="#"
  //                 className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary transition-colors"
  //                 onClick={onClose}
  //               >
  //                 {category}
  //               </Link>
  //             ))}
  //           </div>
  //           <div className="pt-3 border-t border-gray-200">
  //             <Link
  //               href="#"
  //               className="block px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
  //               onClick={onClose}
  //             >
  //               Help & Support →
  //             </Link>
  //           </div>
  //         </div>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="flex h-20 items-center justify-between border-b border-gray-200 px-6">
              <h2 className="text-xs  text-primary">
                <LogoCaelvi />
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
                aria-label="Close menu"
              >
                <RxCross2 size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100vh-80px)] flex-col overflow-y-auto">
              {/* Search */}
              <div className="border-b border-gray-200 p-6">
                <div className="relative flex items-center rounded-md border border-gray-300 px-4 py-3">
                  <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    placeholder="Search Gold Jewellery..."
                    className="ml-3 flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Links */}
              <div className="border-b border-gray-200 p-6">
                <h3 className="mb-4 text-sm font-medium text-gray-700">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  {quickLinks.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary"
                      onClick={onClose}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Main Navigation */}
              <div className="flex-1 p-6">
                <h3 className="mb-4 text-sm font-medium text-gray-700">
                  Categories
                </h3>
                <div className="space-y-1">
                  <div className="space-y-1">
                    {status === 'success' &&
                      categories.slice(0, 8).map(item => (
                        <Link
                          key={item.slug}
                          href={`/shop/${item.slug}`}
                          className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary"
                          onClick={onClose}
                        >
                          {item.name}
                        </Link>
                      ))}
                    <Link
                      href={'/categories'}
                      className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary"
                      onClick={onClose}
                    >
                      All Categories
                    </Link>
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="border-t border-gray-200 p-6">
                <h3 className="mb-4 text-sm font-medium text-gray-700">
                  Account
                </h3>
                <div className="space-y-2">
                  <Link href={'/account/profile?tab=profile'}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary"
                    aria-label="My Account - Sign in or manage your account"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href={'/wishlist'}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary"
                    aria-label="Wishlist - View your saved items"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavMenu;
