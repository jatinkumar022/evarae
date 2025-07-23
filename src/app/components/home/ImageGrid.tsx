"use client";
import Image from "next/image";
import {
  SparklingAvenues,
  StunningEveryEar,
  Dailywear,
} from "@/app/assets/GridImages";

const ImageGrid = () => {
  return (
    <>
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Tanishq Collections</h1>
        <h2 className="heading-component-main-subheading">
          Explore our newly launched collection
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <Image
            src={SparklingAvenues}
            alt="Sparkling Avenues"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="grid grid-rows-2 gap-4">
          <Image
            src={StunningEveryEar}
            alt="Stunning Every Ear"
            className="w-full h-full object-cover rounded-lg"
          />
          <Image
            src={Dailywear}
            alt="Dailywear"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default ImageGrid;
