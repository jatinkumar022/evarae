'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper/types';
import { Navigation, EffectCoverflow, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

interface LookCard {
  id: string;
  name: string;
  image: string | StaticImageData;
}

interface Props {
  products: LookCard[];
  className?: string;
}

const ChooseYourLookCarousel: React.FC<Props> = ({
  products,
  className = '',
}) => {
  const swiperRef = useRef<SwiperClass | null>(null);

  // Memoized slide styles function for better performance
  const setSlideStyles = useCallback((swiper: SwiperClass) => {
    requestAnimationFrame(() => {
      for (let i = 0; i < swiper.slides.length; i++) {
        const slide = swiper.slides[i] as HTMLElement;
        const progress = (slide as unknown as { progress: number }).progress;
        const absProgress = Math.abs(progress);

        // Optimized blur and opacity calculations
        const blur = Math.min(absProgress * 1.2, 3);
        const opacity = Math.max(1 - absProgress * 0.4, 0.7);

        slide.style.filter = `blur(${blur}px)`;
        slide.style.opacity = `${opacity}`;
        slide.style.transform = `scale(${1 - absProgress * 0.1})`;
      }
    });
  }, []);

  // Memoized slide card component to prevent unnecessary re-renders
  const SlideCard = useMemo(() => {
    return React.memo(({ product }: { product: LookCard }) => (
      <div className="rounded-xl overflow-hidden shadow-lg bg-white border border-white/20 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 ease-out">
        <div className="aspect-[3/4] relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 180px, (max-width: 1024px) 220px, 280px"
            priority={false}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm sm:text-base font-medium text-[#5b1314] tracking-wide">
            {product.name}
          </p>
        </div>
      </div>
    ));
  }, []);

  SlideCard.displayName = 'SlideCard';

  // Memoized swiper configuration for better performance
  const swiperConfig = useMemo(
    () => ({
      modules: [Navigation, EffectCoverflow, Autoplay],
      effect: 'coverflow' as const,
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      slidesPerView: 'auto' as const,
      initialSlide: Math.floor(products.length / 2),
      speed: 600, // Faster transitions
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      coverflowEffect: {
        rotate: 0,
        stretch: 30, // Reduced for smoother effect
        depth: 80, // Reduced for smoother effect
        modifier: 1,
        slideShadows: false,
      },
      navigation: {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      },
      on: {
        init: setSlideStyles,
        slideChange: setSlideStyles,
        transitionEnd: setSlideStyles,
      },
    }),
    [products.length, setSlideStyles]
  );

  return (
    <div className={`relative ${className}`}>
      <Swiper
        {...swiperConfig}
        onSwiper={swiper => {
          swiperRef.current = swiper;
        }}
      >
        {products.map(product => (
          <SwiperSlide key={product.id} className="w-auto">
            <SlideCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button
        className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <ChevronLeft className="w-4 h-4 text-gray-800" />
      </button>

      <button
        className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <ChevronRight className="w-4 h-4 text-gray-800" />
      </button>
    </div>
  );
};

ChooseYourLookCarousel.displayName = 'ChooseYourLookCarousel';

export default ChooseYourLookCarousel;
