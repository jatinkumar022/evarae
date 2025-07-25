"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import {
  Navigation,
  EffectCoverflow,
  Autoplay,
  Pagination,
} from "swiper/modules";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  VolumeX,
  Volume2,
  Expand,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  ad1,
  ad2,
  ad3,
  ad4,
  ad5,
  ad6,
  ad7,
} from "@/app/assets/Videos/Homepage";
import {
  dazzling,
  mangalsutra,
  star,
  starWhite,
  mangalsutraWhite,
} from "@/app/assets/Animatedgrid";

const slidesData = [
  {
    src: ad1,
    title: "Eternal Ember Diamond Ring",
    products: [
      {
        name: "Eternal Ember Diamond Ring",
        image: dazzling,
        href: "/products/eternal-ember",
      },
      {
        name: "Lustre Royale Diamond Necklace Set",
        image: star,
        href: "/products/lustre-royale",
      },
      {
        name: "Eternal Ember Diamond Ring",
        image: dazzling,
        href: "/products/eternal-ember",
      },
      {
        name: "Lustre Royale Diamond Necklace Set",
        image: star,
        href: "/products/lustre-royale",
      },
      {
        name: "Eternal Ember Diamond Ring",
        image: dazzling,
        href: "/products/eternal-ember",
      },
      {
        name: "Lustre Royale Diamond Necklace Set",
        image: star,
        href: "/products/lustre-royale",
      },
    ],
  },
  {
    src: ad3,
    title: "Radiant Symphony Collection",
    products: [
      { name: "Opulent Petal Diamond Earrings", image: mangalsutra, href: "/" },
      {
        name: "Celestial Cascade Diamond Necklace",
        image: dazzling,
        href: "/",
      },
    ],
  },
  {
    src: ad2,
    isMain: true,
    title: "Tanishq Radiance in Rhythm x Rahul Mishra...",
    products: [
      { name: "Mirage Flame Diamond Necklace Set", image: starWhite, href: "" },
      {
        name: "Regal Crown Diamond Necklace Set",
        image: mangalsutraWhite,
        href: "/",
      },
    ],
  },
  {
    src: ad4,
    title: "Ethereal Blooms Collection",
    products: [
      {
        name: "Glimmering Blossom Diamond Studs",
        image: dazzling,
        href: "/products/glimmering-blossom",
      },
      {
        name: "Enchanted Vine Diamond Bracelet",
        image: star,
        href: "/products/enchanted-vine",
      },
    ],
  },
  {
    src: ad5,
    title: "Stellar Dreams Collection",
    products: [
      {
        name: "Cosmic Swirl Diamond Pendant",
        image: mangalsutra,
        href: "/products/cosmic-swirl",
      },
      {
        name: "Stardust Solitaire Diamond Ring",
        image: dazzling,
        href: "/products/stardust-solitaire",
      },
    ],
  },
  {
    src: ad6,
    title: "Royal Heritage Collection",
    products: [
      {
        name: "Maharani's Choice Diamond Choker",
        image: star,
        href: "/products/maharanis-choice",
      },
      {
        name: "Princely Cut Diamond Cufflinks",
        image: mangalsutra,
        href: "/products/princely-cut",
      },
    ],
  },
  {
    src: ad7,
    title: "Whispering Willow Collection",
    products: [
      {
        name: "Willow Grace Diamond Hoops",
        image: dazzling,
        href: "/products/willow-grace",
      },
      {
        name: "Whispering Leaf Diamond Lariat",
        image: star,
        href: "/products/whispering-leaf",
      },
    ],
  },
];

const setSlideStyles = (swiper: SwiperClass) => {
  for (let i = 0; i < swiper.slides.length; i++) {
    const slide = swiper.slides[i] as HTMLElement;
    const progress = (slide as any).progress;
    const absProgress = Math.abs(progress);
    const blur = absProgress * 2;
    const opacity = Math.max(1 - absProgress, 0.5);

    slide.style.filter = `blur(${blur}px)`;
    slide.style.opacity = `${opacity}`;
  }
};

const SlideCard = ({
  slide,
  isActive,
}: {
  slide: (typeof slidesData)[number] & { isMain?: boolean };
  isActive: boolean;
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ease-in-out relative group aspect-[9/16] h-[480px] sm:h-[600px]"
      )}
    >
      <video
        ref={videoRef}
        src={slide.src}
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-3 text-white">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <MoreHorizontal size={20} />
            <span>{slide.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute}>
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={toggleFullscreen}>
              <Expand size={16} />
            </button>
          </div>
        </div>

        <div className="w-full stop-propagation">
          <Swiper
            modules={[Pagination]}
            spaceBetween={8}
            slidesPerView={2}
            pagination={{ clickable: true }}
            className="product-slider !pb-6"
          >
            {slide.products?.map((product, productIndex) => (
              <SwiperSlide key={`${product.name}-${productIndex}`}>
                <Link href={product.href}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-black text-[10px] w-full h-14">
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <span className="flex-1 line-clamp-2">{product.name}</span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default function Styling101Carousel() {
  return (
    <section className="">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">
          Lookalike Gold, Real Glam
        </h1>
        <h2 className="heading-component-main-subheading">
          Shop the newest imitation pieces that blend tradition & trend
        </h2>
      </div>

      <div className="relative w-full max-w-6xl ">
        <Swiper
          modules={[Navigation, EffectCoverflow, Autoplay]}
          onInit={setSlideStyles}
          onProgress={setSlideStyles}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          initialSlide={2}
          noSwipingClass="stop-propagation"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 80,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          className="!py-6"
        >
          {slidesData.map((slide, index) => (
            <SwiperSlide
              key={index}
              className="!w-auto transition-all duration-300"
            >
              {({ isActive }) => (
                <SlideCard slide={slide} isActive={isActive} />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-4 z-10 cursor-pointer">
          <div className="bg-white/80 rounded-full shadow-md p-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </div>
        </div>
        <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-4 z-10 cursor-pointer">
          <div className="bg-white/80 rounded-full shadow-md p-2">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
