import React from "react";
import { gifting, rathYatra } from "@/app/assets/Trending"; // Assuming these are React components or image imports
import Image, { StaticImageData } from "next/image";

const trendingItems = [
  {
    id: 1,
    title: "Auspicious Occasions",
    image: rathYatra,
    alt: "Auspicious Occasion",
  },
  {
    id: 2,
    title: "Jewellery for Gifting",
    image: gifting,
    alt: "Gifting Jewellery",
  },
  {
    id: 3,
    title: "18Kt Jewellery",
    image: rathYatra,
    alt: "18Kt Jewellery",
  },
];

const TrendingItem = ({
  image,
  title,
  alt,
}: {
  image: StaticImageData;
  title: string;
  alt: string;
}) => (
  <div className="group text-center">
    <a href="#">
      <div className="bg-muted rounded-t-full overflow-hidden">
        <Image
          src={image}
          alt={alt}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>
      <div className="py-4">
        <h3 className="font-medium text-foreground tracking-wider uppercase text-sm group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </a>
  </div>
);

function Trending() {
  return (
    <section className="mt-20">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Currently Trending</h1>
        <h2 className="heading-component-main-subheading">
          Our most popular pieces, chosen for you.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-6">
        {trendingItems.map((item) => (
          <TrendingItem
            key={item.id}
            image={item.image}
            title={item.title}
            alt={item.alt}
          />
        ))}
      </div>
    </section>
  );
}

export default Trending;
