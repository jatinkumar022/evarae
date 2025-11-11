'use client';
import React, { useEffect } from 'react';
import { FaRegGem } from 'react-icons/fa6';
import Container from '../layouts/Container';
import Link from 'next/link';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';

function NewArrival() {
  const { data, fetchHomepage } = useHomepageStore();

  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  const freshlyMinted = data?.freshlyMinted;
  
  // Don't show section if no content
  if (!freshlyMinted || (!freshlyMinted.backgroundImage && !freshlyMinted.topImage1 && !freshlyMinted.topImage2)) {
    return null;
  }

  const backgroundImage = freshlyMinted.backgroundImage;
  const topImage1 = freshlyMinted.topImage1;
  const topImage2 = freshlyMinted.topImage2;
  const topImage1Title = freshlyMinted.topImage1Title || '';
  const topImage2Title = freshlyMinted.topImage2Title || '';
  const topImage1Link = freshlyMinted.topImage1Link || '#';
  const topImage2Link = freshlyMinted.topImage2Link || '#';

  return (
    <section className="relative mt-20">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="New Arrivals Background"
            className="absolute inset-0 w-full h-full object-cover blur-xs lg:blur-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        </div>
      )}
      <Container>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          {/* Content */}
          <div className="text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 mb-4">
              <FaRegGem className="h-4 w-4" />
              <span className="text-sm font-medium">500+ New Items</span>
            </div>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold">
              Freshly Minted
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-lg mx-auto lg:mx-0">
              Discover the latest treasures to join the Caelvi family. New
              arrivals dropping every week.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {topImage1 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2">
                <Link
                  href={topImage1Link}
                  className="relative block overflow-hidden rounded-lg group cursor-pointer"
                  aria-label={`Explore ${topImage1Title} collection`}
                >
                  <img
                    src={topImage1}
                    alt={topImage1Title}
                    className="w-full h-full object-cover aspect-square"
                  />
                  {topImage1Title && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="font-heading text-lg text-white font-semibold">
                        {topImage1Title}
                      </h3>
                    </div>
                  )}
                </Link>
              </div>
            )}
            {topImage2 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2">
                <Link
                  href={topImage2Link}
                  className="relative block overflow-hidden rounded-lg group cursor-pointer"
                  aria-label={`Explore ${topImage2Title} collection`}
                >
                  <img
                    src={topImage2}
                    alt={topImage2Title}
                    className="w-full h-full object-cover aspect-square"
                  />
                  {topImage2Title && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="font-heading text-lg text-white font-semibold">
                        {topImage2Title}
                      </h3>
                    </div>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default NewArrival;
