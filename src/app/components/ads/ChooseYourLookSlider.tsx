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

  // Memoized swiper configuration for better performance
  const swiperConfig = useMemo(
    () => ({
      modules: [Navigation, EffectCoverflow, Autoplay],
      effect: 'coverflow' as const,
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      slidesPerView: 'auto' as const,
      slidesPerGroup: 1, // Add this to fix the warning
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
      onInit: setSlideStyles,
      onProgress: setSlideStyles,
      onSlideChange: setSlideStyles,
      onTouchStart: () => {
        // Pause autoplay on touch
        if (swiperRef.current) {
          swiperRef.current.autoplay.stop();
        }
      },
      onTouchEnd: () => {
        // Resume autoplay after touch
        if (swiperRef.current) {
          swiperRef.current.autoplay.start();
        }
      },
    }),
    [products.length, setSlideStyles]
  );

  return (
    <div
      className={`dw-espot relative bg-gradient-to-br from-[#ffe0f7] via-[#e0e7ff] to-[#fff7e0] rounded-2xl p-9 shadow-2xl overflow-hidden h-full border border-[#e9d6f7]/60 ${className}`}
    >
      {/* Decorative blurred gradient blobs */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#e9d6f7] to-[#ffc9ee] opacity-40 rounded-full blur-2xl z-0" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-[#ffc9ee] to-[#ffe0f7] opacity-30 rounded-full blur-2xl z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#ffe0f7]/60 via-[#e0e7ff]/40 to-[#fff7e0]/60 rounded-full blur-3xl z-0" />
      <div className="text-center my-4 sm:my-8 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-primary font-heading">
          Choose Your Look
        </h2>
        <p className="text-sm sm:text-base text-primary mt-1 font-medium ">
          Discover your next favorite style
        </p>
      </div>
      {/* Carousel Container */}
      <div className="dw-swiper-container relative flex-1 z-10">
        <Swiper
          {...swiperConfig}
          onSwiper={swiper => {
            swiperRef.current = swiper;
          }}
          className="!py-6"
          style={{
            perspective: '1200px',
            touchAction: 'pan-y',
            willChange: 'transform',
          }}
        >
          {products.map(product => (
            <SwiperSlide
              key={product.id}
              className="!w-[200px] sm:!w-[240px] lg:!w-[140px] transition-all duration-300 ease-out group"
              style={{
                willChange: 'transform, opacity, filter',
              }}
            >
              <div className="relative">
                {/* Glow border for active card */}
                <div className="absolute inset-0 rounded-xl pointer-events-none group-[.swiper-slide-active]:shadow-[0_0_0_4px_#ffc9ee80] group-[.swiper-slide-active]:ring-2 group-[.swiper-slide-active]:ring-[#ffc9ee] transition-all duration-300" />
                <div className="rounded-xl overflow-hidden shadow-lg border border-white/30 backdrop-blur-md bg-white/60 group-[.swiper-slide-active]:bg-white/80 group-[.swiper-slide-active]:shadow-2xl transition-all duration-300">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 568px) 140px, (max-width: 1024px) 180px, 220px"
                      priority={false}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs sm:text-xs font-semibold text-[#5b1314] tracking-wide">
                      {product.name}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Navigation Arrows - Elegant Style */}
        <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-2 z-20 w-11 h-11 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-[#ffc9ee]/40 flex items-center justify-center cursor-pointer hover:bg-[#ffc9ee] hover:text-white hover:scale-110 transition-all duration-200">
          <ChevronLeft className="w-6 h-6 text-[#5b1314] group-hover:text-white" />
        </div>
        <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-2 z-20 w-11 h-11 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-[#ffc9ee]/40 flex items-center justify-center cursor-pointer hover:bg-[#ffc9ee] hover:text-white hover:scale-110 transition-all duration-200">
          <ChevronRight className="w-6 h-6 text-[#5b1314] group-hover:text-white" />
        </div>
      </div>
    </div>
  );
};

ChooseYourLookCarousel.displayName = 'ChooseYourLookSlider';

export default ChooseYourLookCarousel;
