"use client";
import Image, { StaticImageData } from "next/image";
import {
  SparklingAvenues,
  StunningEveryEar,
  Dailywear,
} from "@/app/assets/GridImages";

const GridItem = ({
  src,
  alt,
  title,
}: {
  src: StaticImageData;
  alt: string;
  title: string;
}) => (
  <div className="relative overflow-hidden rounded-lg group cursor-pointer h-full">
    <Image
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform group-hover:translate-y-0 translate-y-4">
        <h3 className="text-2xl lg:text-3xl font-heading text-white font-semibold">
          {title}
        </h3>
        <button
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2 rounded-full text-sm font-semibold"
          aria-label={`Shop ${title} collection`}
        >
          Shop Now
        </button>
      </div>
    </div>
  </div>
);

const ImageGrid = () => {
  return (
    <section className="mt-20">
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">
          Signature Collections
        </h1>
        <h2 className="heading-component-main-subheading">
          Crafted with passion, designed to be adored.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
        <div className="md:col-span-1 md:row-span-1">
          <GridItem
            src={StunningEveryEar}
            alt="Stunning Every Ear"
            title="Stunning Earrings"
          />
        </div>
        <div className="md:col-span-1 md:row-span-2">
          <GridItem
            src={SparklingAvenues}
            alt="Sparkling Avenues"
            title="Sparkling Avenues"
          />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <GridItem src={Dailywear} alt="Dailywear" title="Everyday Luxury" />
        </div>
      </div>
    </section>
  );
};

export default ImageGrid;
