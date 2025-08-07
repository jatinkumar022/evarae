'use client';
import Container from '@/app/components/layouts/Container';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  User,
  Search,
  New,
  Store,
} from '@/app/assets/Navbar';
import {
  ringsCat,
  earringsCat,
  braceletsCat,
  pendantsCat,
} from '@/app/assets/CategoryGrid';
import { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Link from 'next/link';
import { BsInboxes } from 'react-icons/bs';
import MobileNavMenu from './MobileNavMenu';

const NavLink = ({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <Link
    href={href}
    className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100/80 hover:text-primary cursor-pointer"
  >
    <div className="flex items-center gap-2">
      {icon}
      {children}
    </div>
  </Link>
);

const IconButton = ({
  onClick,
  children,
  className = '',
  ariaLabel,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center rounded-full p-2  transition-colors hover:bg-gray-100/80  hover:text-primary cursor-pointer ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const popularCategories = [
  { name: 'Rings', href: '#', image: ringsCat },
  { name: 'Earrings', href: '#', image: earringsCat },
  { name: 'Bracelets', href: '#', image: braceletsCat },
  { name: 'Pendants', href: '#', image: pendantsCat },
];

export default function Navbar() {
  const placeholders = [
    'Search Gold Jewellery',
    'Search Diamond Jewellery',
    'Search Rings, Earrings & more...',
  ];
  const trendingSearches = [
    'Rings',
    'Diamond Necklace',
    'Gold Chains',
    '22k Gold',
    'Gifts for Her',
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  return (
    <>
      <header className="fixed top-0 z-30 w-full border-b border-gray-200/80 bg-white">
        <Container>
          <div className="flex h-20 items-center justify-between">
            {/* Left Group */}
            <div className="flex items-center gap-2 lg:flex-1">
              <div className="lg:hidden">
                <IconButton
                  onClick={() => setIsMobileMenuOpen(true)}
                  ariaLabel="Open menu"
                >
                  <div className="h-5 w-5 max-lg:text-primary flex flex-col gap-1">
                    <div className="w-5 h-0.5 bg-current"></div>
                    <div className="w-5 h-0.5 bg-current"></div>
                    <div className="w-5 h-0.5 bg-current"></div>
                  </div>
                </IconButton>
              </div>
              <div className="lg:hidden">
                <Link href="/">
                  <h1 className="text-2xl  font-heading text-primary">
                    Caelvi
                  </h1>
                </Link>
              </div>
              <nav className="hidden items-center gap-2 lg:flex ">
                <NavLink
                  href="/all-jewellery"
                  icon={<Store className="h-4 w-4" />}
                >
                  All Jewellery
                </NavLink>
                <NavLink href="#" icon={<New className="h-4 w-4" />}>
                  New Arrivals
                </NavLink>
                <NavLink href="#" icon={<BsInboxes size={13} />}>
                  Collections
                </NavLink>
              </nav>
            </div>

            {/* Centered Logo (Desktop-only) */}
            <div className="hidden lg:block">
              <h2 className="text-2xl  font-heading text-primary">Caelvi</h2>
            </div>

            {/* Right Group */}
            <div className="flex items-center justify-end gap-2 lg:flex-1 max-lg:text-primary">
              <IconButton
                onClick={() => setIsSearchOpen(true)}
                ariaLabel="Open search"
              >
                <Search className="h-5 w-5" />
              </IconButton>
              <IconButton
                onClick={() => {}}
                ariaLabel="My Account - Sign in or manage your account"
              >
                <User className="h-5 w-5" />
              </IconButton>
              <IconButton
                onClick={() => {}}
                ariaLabel="Wishlist - View your saved items"
              >
                <Heart className="h-5 w-5" />
              </IconButton>
              <IconButton
                onClick={() => {}}
                ariaLabel="Shopping Bag - View cart with 5 items"
              >
                <ShoppingBag className="h-5 w-5" />
                <span
                  className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white"
                  aria-label="5 items in cart"
                >
                  5
                </span>
              </IconButton>
            </div>
          </div>
        </Container>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="bg-white"
              onClick={e => e.stopPropagation()}
            >
              <Container>
                <div className="py-8">
                  {/* Search Input */}
                  <div className="relative border border-border px-4 flex items-center rounded-md py-1">
                    <Search className="h-5 w-5 flex-shrink-0 text-primary mr-4" />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      className="w-full bg-transparent text-lg placeholder-gray-400 focus:outline-none  relative z-10"
                      autoFocus
                    />
                    {inputValue === '' && (
                      <div className="absolute left-14 inset-y-0 flex items-center pointer-events-none">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={currentPlaceholder}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg text-gray-600"
                          >
                            {placeholders[currentPlaceholder]}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    )}
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2 text-gray-600 transition-colors hover:text-primary ml-4"
                      aria-label="Close search"
                    >
                      <RxCross2 size={18} />
                    </button>
                  </div>
                  {/* Content */}
                  <div className="pt-10 grid sm:grid-cols-2 gap-5 sm:gap-12">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Popular Categories
                      </h3>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {popularCategories.map(cat => (
                          <Link
                            href={cat.href}
                            key={cat.name}
                            className="group block"
                          >
                            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-primary">
                              {cat.name}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Trending Searches
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {trendingSearches.map(term => (
                          <button
                            key={term}
                            className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            aria-label={`Search for ${term}`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
