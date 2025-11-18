'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, ArrowLeft, Sparkles } from 'lucide-react';
import Container from './components/layouts/Container';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 sm:py-20 relative overflow-hidden">

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6"
          >
            <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-heading font-bold bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] via-[oklch(0.58_0.16_8)] to-[oklch(0.66_0.14_358.91)] bg-clip-text text-transparent leading-none">
              404
            </h1>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-component-main-heading mb-4"
          >
            Page Not Found
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-text-primary/80 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-4"
          >
            The page you&apos;re looking for seems to have wandered away like a lost piece of jewelry.
            Let&apos;s help you find your way back to our exquisite collection.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
          >
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white text-sm sm:text-base font-medium rounded-xl hover:shadow-lg hover:shadow-[oklch(0.66_0.14_358.91)]/25 transition-all duration-300 transform hover:scale-105 font-heading"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-sm sm:text-base font-medium rounded-xl transition-all duration-300 transform hover:scale-105 font-heading"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 px-4"
          >
            {[
              { name: 'All Jewellery', href: '/all-jewellery' },
              { name: 'New Arrivals', href: '/new-arrivals' },
              { name: 'Collections', href: '/collections' },
              { name: 'Categories', href: '/categories' },
            ].map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                className="p-3 sm:p-4 bg-white/60 backdrop-blur-sm border border-primary/10 rounded-xl hover:border-primary/30 hover:bg-white/80 transition-all duration-300 group"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <p className="text-xs sm:text-sm font-medium text-primary-dark group-hover:text-primary transition-colors">
                  {link.name}
                </p>
              </Link>
            ))}
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-md mx-auto px-4"
          >
            <div className="bg-white/60 backdrop-blur-sm border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-primary-dark">
                  Or search for something else
                </p>
              </div>
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 bg-white rounded-xl border border-primary/20 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
              >
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search jewellery..."
                  className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-sm text-text-primary placeholder:text-text-primary/50"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-primary text-white hover:bg-primary-dark transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 sm:mt-16 flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[oklch(0.58_0.16_8)] to-[oklch(0.66_0.14_358.91)]"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[oklch(0.58_0.16_8)] to-[oklch(0.66_0.14_358.91)]"></div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)]"></div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
