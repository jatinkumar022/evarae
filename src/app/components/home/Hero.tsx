// components/Carousel.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  FestivalsOfDiamond,
  EighteenKtJew,
  Dailywear,
  SparklingAvenues,
  RivaahSouth,
  Rir,
} from "@/app/assets/Carousel";

const images = [
  FestivalsOfDiamond,
  EighteenKtJew,
  Dailywear,
  SparklingAvenues,
  RivaahSouth,
  Rir,
];

export default function HeroCarousel() {
  const [current, setCurrent] = React.useState(0);

  const goToSlide = (index: number) => setCurrent(index);

  const nextSlide = () =>
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-full">
      {/* Image Carousel */}
      <div className="relative overflow-hidden aspect-[2.5/1]">
        <Image
          src={images[current]}
          alt={`Slide ${current}`}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation Buttons */}
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

      {/* Dot Indicators Below Carousel */}
      <div className="mt-4 flex justify-center gap-2">
        {images.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full p-0 bg-black/20 hover:bg-black transition-all",
              current === index && "bg-black"
            )}
          />
        ))}
      </div>
    </div>
  );
}
