import React from "react";
import { Keret, gifting, rathYatra } from "@/app/assets/Trending"; // Assuming these are React components or image imports
import Image from "next/image";

const trendingItems = [
  {
    id: 1,
    title: "Auspicious Occasion",
    image: rathYatra,
    alt: "Auspicious Occasion",
  },
  {
    id: 2,
    title: "Gifting Jewellery",
    image: gifting,
    alt: "Gifting Jewellery",
  },
  {
    id: 3,
    title: "18Kt Jewellery",
    image: Keret,
    alt: "18Kt Jewellery",
  },
];

function Trending() {
  return (
    <section>
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Trending Now</h1>
        <h2 className="heading-component-main-subheading">
          Explore our trending collection
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {trendingItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center text-center">
            <div className="w-full overflow-hidden rounded-xl">
              <Image
                src={item.image}
                alt={item.alt}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="text-center py-3">
              <h6 className="text-[12px] sm:text-sm font-medium  uppercase tracking-wider">
                {item.title}
              </h6>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Trending;
