"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FestivalsOfDiamond,
  EighteenKtJew,
  Dailywear,
  SparklingAvenues,
  RivaahSouth,
  Rir,
} from "@/app/assets/Carousel";
import {
  MdFestivalsOfDiamondOfferMobile,
  Md18KtJewMobile,
  MdDailywearMobile1,
  MdSparklingAvenuesMobile,
  MdRivaahSouthGeoM1,
  MdRirMobileNew,
} from "@/app/assets/Carousel/mobile";
import Container from "../layouts/Container";

const images = [
  FestivalsOfDiamond,
  EighteenKtJew,
  Dailywear,
  SparklingAvenues,
  RivaahSouth,
  Rir,
];

const mobileImages = [
  MdFestivalsOfDiamondOfferMobile,
  Md18KtJewMobile,
  MdDailywearMobile1,
  MdSparklingAvenuesMobile,
  MdRivaahSouthGeoM1,
  MdRirMobileNew,
];

export default function HeroCarousel() {
  const [current, setCurrent] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
  };

  React.useEffect(() => {
    resetTimer(); // initialize
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetTimer();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetTimer();
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    resetTimer();
  };

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="w-full mt-1.5">
      {/* Desktop Carousel */}
      <div className="relative overflow-hidden aspect-[2.5/1] hidden md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <Image
              src={images[current]}
              alt={`Caelvi jewellery collection slide ${current + 1} of ${
                images.length
              }`}
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full px-4 flex justify-between items-center z-10">
          <button
            onClick={prevSlide}
            aria-label="Previous"
            className="bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next"
            className="bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Carousel */}
      <Container>
        <div className="relative overflow-hidden aspect-square md:hidden m-auto max-w-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <Image
                src={mobileImages[current]}
                alt={`Caelvi jewellery collection slide ${current + 1} of ${
                  mobileImages.length
                }`}
                fill
                className="object-cover"
                priority
                quality={90}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>

      {/* Dot Indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              current === i ? "bg-primary  px-3" : "bg-primary/30"
            }`}
            aria-label={`Go to slide ${i + 1} of ${images.length}`}
            aria-current={current === i ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}
