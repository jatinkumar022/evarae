"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  Md18KtJewMobile,
  MdDailywearMobile1,
  MdFestivalsOfDiamondOfferMobile,
  MdRirMobileNew,
  MdRivaahSouthGeoM1,
  MdSparklingAvenuesMobile,
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
  Md18KtJewMobile,
  MdDailywearMobile1,
  MdFestivalsOfDiamondOfferMobile,
  MdRirMobileNew,
  MdRivaahSouthGeoM1,
  MdSparklingAvenuesMobile,
];

export default function HeroCarousel() {
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1); // 1 for next, -1 for previous
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
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
    setDirection(1);
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetTimer(); // reset timer on manual navigation
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetTimer(); // reset timer on manual navigation
  };

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    resetTimer(); // reset timer on dot click
  };
  return (
    <div className="w-full mt-1.5 ">
      {/* Carousel Container */}
      <div className="relative overflow-hidden aspect-[2.5/1] hidden md:block">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <Image
              src={images[current]}
              alt={`Slide ${current}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full px-4 flex justify-between items-center z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="bg-white/60 hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="bg-white/60 hover:bg-white"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </Button>
        </div>
      </div>
      <Container>
        <div className="relative overflow-hidden aspect-square md:hidden m-auto max-w-[600px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <Image
                src={mobileImages[current]}
                alt={`Slide ${current}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
      {/* Dot Indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {images.map((_, i) => {
          const isActive = current === i;
          return (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="p-0 m-0 transition-all duration-300 ease-in-out  cursor-pointer"
              style={{
                width: isActive ? 28 : 10,
                height: 10,
                backgroundColor: isActive ? "#832729" : "#d9bdbe",
                clipPath: isActive
                  ? "polygon(5px 0%, 23px 0%, 28px 50%, 23px 100%, 5px 100%, 0 50%)"
                  : "polygon(0 50%, 50% 0%, 100% 50%, 50% 100%)",
                transform: isActive ? "rotate(0deg)" : "rotate(90deg)",
                transformOrigin: "center",
                transition: "all 300ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
