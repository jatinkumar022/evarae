"use client";

import React, { useState, MouseEvent } from "react";
import Container from "../layouts/Container";

const categories = [
  {
    title: "Daily Wear Earrings",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dweabf3ab3/images/hi-res/51M4D1DBMABA00_1.jpg?sw=120&sh=120",
    href: "#",
  },
  {
    title: "Latest Mangalsutras",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw1cb4f7b9/images/hi-res/511870YAYAA00_1.jpg?sw=120&sh=120",
    href: "#",
  },
  {
    title: "New Arrivals",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw52f65a28/images/hi-res/51D3B12OSABA00_1.jpg?sw=120&sh=120",
    href: "#",
  },
  {
    title: "Gifting Jewellery",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwa8e54872/images/hi-res/512814SQNABA18_1.jpg?sw=120&sh=120",
    href: "#",
  },
  {
    title: "Engagement Rings",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwd6d91376/images/hi-res/50D4C1FOXAA02_1.jpg?sw=120&sh=120",
    href: "#",
  },
];

const CircleCategories = () => {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, idx: number) => {
    e.preventDefault();
    setClickedIndex(idx);
    setTimeout(() => {
      window.location.href = e.currentTarget.href;
      setClickedIndex(null);
    }, 1500); // Delay for animation
  };

  return (
    <section className="py-5 sm:py-10 lg:hidden block ">
      <Container className="flex justify-center">
        <div
          className="flex gap-4 sm:gap-6 overflow-x-auto  md:gap-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((item, idx) => (
            <a
              href={item.href}
              key={idx}
              className="flex-shrink-0 flex flex-col items-center text-center w-24 md:w-28"
              onClick={(e) => handleClick(e, idx)}
            >
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full"
                  />
                </div>
                <div
                  className={`absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary z-0 group-hover:animate-spin-slow ${
                    clickedIndex === idx
                      ? "animate-spin-slow border-dashed"
                      : ""
                  }`}
                />
              </div>
              <div className="pt-2 text-xs md:text-sm text-foreground leading-tight">
                <h4 dangerouslySetInnerHTML={{ __html: item.title }} />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default CircleCategories;
