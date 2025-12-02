'use client';

import * as React from 'react';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { type StaticImageData } from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

import Container from '../layouts/Container';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';

export default function HeroCarousel() {
  const { data } = useHomepageStore();
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Homepage data is loaded centrally in Home page, no need to fetch here

  const images = React.useMemo<(string | StaticImageData)[]>(() => {
    return data?.hero?.images || [];
  }, [data?.hero?.images]);

  const hasImages = images.length > 0;

  // Preload all hero images once, then mark as loaded
  React.useEffect(() => {
    if (!hasImages) {
      setAllImagesLoaded(false);
      return;
    }

    let cancelled = false;
    let loadedCount = 0;

    const sources = images.map((img) =>
      typeof img === 'string' ? img : img.src
    );

    sources.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = img.onerror = () => {
        if (cancelled) return;
        loadedCount += 1;
        if (loadedCount >= sources.length) {
          setAllImagesLoaded(true);
        }
      };
    });

    return () => {
      cancelled = true;
    };
  }, [hasImages, images]);

  // Autoplay timer – only starts once all images are loaded
  React.useEffect(() => {
    if (!hasImages || !allImagesLoaded) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasImages, allImagesLoaded, images.length]);

  if (!hasImages) {
    return null;
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent(prev => (prev + newDirection + images.length) % images.length);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 300) {
      paginate(-1);
    } else if (offset < -100 || velocity < -300) {
      paginate(1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const renderSlideImage = (index: number) => (
    <Image
      src={images[index]}
      alt={`Caelvi jewellery collection slide ${index + 1} of ${images.length}`}
      fill
      className="object-cover pointer-events-none rounded-lg"
      priority
      quality={90}
      sizes="100vw"
      draggable={false}
    />
  );

  return (
    <div className="w-full mt-1.5">
      <Container>
        {/* Single Carousel for all screen sizes (consistent aspect ratio) */}
        <div className="relative overflow-hidden aspect-[2/1] m-auto max-w-[1200px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
              style={{
                touchAction: 'pan-y',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            >
              {renderSlideImage(current)}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full px-2 sm:px-4 flex justify-between items-center z-10">
            <motion.button
              onClick={() => paginate(-1)}
              aria-label="Previous"
              className="bg-background/70 hover:bg-background/90 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-colors duration-200 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </motion.button>
            <motion.button
              onClick={() => paginate(1)}
              aria-label="Next"
              className="bg-background/70 hover:bg-background/90 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-colors duration-200 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
      </Container>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {images.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${current === i ? 'bg-primary px-3' : 'bg-primary/30'
                }`}
              aria-label={`Go to slide ${i + 1} of ${images.length}`}
              aria-current={current === i ? 'true' : 'false'}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
