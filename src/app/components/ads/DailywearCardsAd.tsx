import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SparklingAvenues, RivaahSouth, Rir } from '@/app/assets/Carousel';
import { adsBg } from '@/app/assets/Common';

export interface DailywearProduct {
  id: string;
  name: string;
  image: string | StaticImageData;
  href?: string;
}

interface DailywearCarouselProps {
  products?: DailywearProduct[];
  className?: string;
}

const DailywearCarousel: React.FC<DailywearCarouselProps> = ({
  products: propProducts,
  className = '',
}) => {
  const defaultProducts: DailywearProduct[] = [
    {
      id: 'dw-earrings-1',
      name: 'Dailywear Earrings',
      image: SparklingAvenues,
    },
    {
      id: 'dw-mangalsutra-1',
      name: 'Dailywear Mangalsutra',
      image: RivaahSouth,
    },
    {
      id: 'dw-pendants-1',
      name: 'Dailywear Pendants',
      image: Rir,
    },
    {
      id: 'dw-earrings-2',
      name: 'Dailywear Earrings',
      image: SparklingAvenues,
    },
    {
      id: 'dw-mangalsutra-2',
      name: 'Dailywear Mangalsutra',
      image: RivaahSouth,
    },
    {
      id: 'dw-pendants-2',
      name: 'Dailywear Pendants',
      image: Rir,
    },
  ];

  const products = propProducts || defaultProducts;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 480) {
        setCardsPerView(1);
      } else if (window.innerWidth < 768) {
        setCardsPerView(2);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - cardsPerView);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!trackRef.current) return;

      const track = trackRef.current;
      const cardWidth = track.scrollWidth / products.length;
      const scrollPosition = index * cardWidth;

      track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    },
    [products.length]
  );

  const handlePrev = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  }, [currentIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollToIndex(newIndex);
  }, [currentIndex, maxIndex, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const scrollLeft = track.scrollLeft;
      const cardWidth = track.scrollWidth / products.length;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(0, newIndex), maxIndex));
    };

    track.addEventListener('scroll', handleScroll);
    return () => track.removeEventListener('scroll', handleScroll);
  }, [products.length, maxIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden text-gray-800 ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={adsBg}
          alt="Background"
          fill
          className="object-cover blur-sm opacity-40"
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-9 sm:p-10 md:p-12">
        <div className="text-center my-4 sm:my-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary-dark font-heading">
            Dailywear Jewellery
          </h2>
          <p className="text-xs sm:text-sm text-primary-dark mt-1 opacity-80">
            Graceful picks for your everyday moments
          </p>
        </div>

        <div className="relative flex-1">
          <div
            ref={trackRef}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 sm:px-4 py-2 sm:py-4 scrollbar-hide"
            style={{ scrollPaddingLeft: '0.5rem' }}
          >
            {products.map(product => (
              <div
                key={product.id}
                className="flex-shrink-0 snap-start w-[160px] xs:w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] group transition-all"
              >
                <div className="rounded-lg sm:rounded-xl overflow-hidden bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition duration-300 h-full">
                  <div className="relative h-24 sm:h-32 md:h-36 lg:h-40 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 480px) 160px, (max-width: 640px) 180px, (max-width: 768px) 200px, (max-width: 1024px) 220px, 240px"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 text-center">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold text-primary-dark leading-tight">
                      {product.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length > cardsPerView && (
            <>
              <div className="absolute inset-y-0 left-0 flex items-center">
                <button
                  aria-label="Previous"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white/90 border border-gray-200 transition disabled:opacity-30 shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  aria-label="Next"
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white/90 border border-gray-200 transition disabled:opacity-30 shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailywearCarousel;
