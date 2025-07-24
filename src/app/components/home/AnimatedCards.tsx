"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GoHeart } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion";
import {
  star,
  mangalsutra,
  dazzling,
  starWhite,
  mangalsutraWhite,
  dazzlingWhite,
} from "@/app/assets/Animatedgrid";
import { GiCrystalShine } from "react-icons/gi";

const savedItems = [
  {
    id: 1,
    title: "Dazzling Grace Drop Earrings",
    price: "59863",
    image: dazzling,
    hoverImage: dazzlingWhite,
    tag: null,
  },
  {
    id: 2,
    title: "Girlish Star Shaped Gold Stud Earrings",
    price: "23796",
    image: mangalsutra,
    hoverImage: mangalsutraWhite,
    tag: "BESTSELLERS",
  },
  {
    id: 3,
    title: "Sunbeam Bloom Gold Mangalsutra",
    price: "72049",
    image: star,
    hoverImage: starWhite,
    tag: null,
  },
];

export default function PickUpWhereYouLeft() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const calculatePagination = () => {
      const card = container.querySelector(".scroll-item") as HTMLElement;
      if (!card) return;

      const visibleWidth = container.clientWidth;
      const cardWidth = card.offsetWidth + 16; // include gap
      const cardsFit = Math.floor(visibleWidth / cardWidth) || 1;
      const pages = Math.ceil(savedItems.length / cardsFit);

      setCardsPerPage(cardsFit);
      setTotalPages(pages);
    };

    calculatePagination();
    window.addEventListener("resize", calculatePagination);
    return () => window.removeEventListener("resize", calculatePagination);
  }, []);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const handleScroll = () => {
      const card = container.querySelector(".scroll-item") as HTMLElement;
      if (!card) return;

      const cardWidth = card.offsetWidth + 16;
      const scrollLeft = container.scrollLeft;
      const page = Math.round(scrollLeft / (cardWidth * cardsPerPage));
      setActiveIndex(page);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [cardsPerPage]);

  const scrollToPage = (index: number) => {
    const container = sliderRef.current;
    const card = container?.querySelector(".scroll-item") as HTMLElement;
    if (!container || !card) return;

    const cardWidth = card.offsetWidth + 16;
    container.scrollTo({
      left: index * cardWidth * cardsPerPage,
      behavior: "smooth",
    });
  };

  const ImageCard = ({ item }: { item: (typeof savedItems)[0] }) => {
    const [isHovered, setIsHovered] = useState(false);
    const variants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };

    return (
      <div
        className="relative w-full rounded-xl overflow-hidden cursor-pointer "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div layout className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isHovered ? "hover" : "default"}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Image
                src={isHovered ? item.hoverImage : item.image}
                alt={item.title}
                className="w-full h-auto object-cover rounded-xl"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {item.tag && (
          <span className="absolute top-0 left-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
            <div className="flex items-center gap-1">
              <GiCrystalShine size={15} /> {item.tag}
            </div>
          </span>
        )}

        <button className="common-wishlist-btn">
          <GoHeart />
        </button>
      </div>
    );
  };

  return (
    <section>
      {/* Headings */}
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">
          Pick up where you left
        </h1>
        <h2 className="heading-component-main-subheading">
          Our products tend to sell out quickly, so don&rsquo;t delay in
          completing your purchase.
        </h2>
      </div>

      {/* Mobile Slider */}
      <div className="relative lg:hidden">
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {savedItems.map((item, index) => (
            <div
              key={item.id + index}
              className="flex-shrink-0 w-64 snap-start scroll-item"
            >
              <ImageCard item={item} />
              <div className="mt-3">
                <p className="text-[15px] font-medium text-black truncate">
                  {item.title}
                </p>
                <p className="text-[17px] font-normal mt-1">₹ {item.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => scrollToPage(i)}
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
        )}
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {savedItems.map((item) => (
          <div key={item.id + "-desktop"} className="flex flex-col">
            <ImageCard item={item} />
            <div className="mt-3">
              <p className="text-[15px] font-medium text-black truncate">
                {item.title}
              </p>
              <p className="text-[17px] font-normal mt-1">₹ {item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
