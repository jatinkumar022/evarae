import React from "react";
import Image from "next/image";
import { FaRegGem } from "react-icons/fa6";
import { mangalsutra, pendants, newArrival } from "@/app/assets/NewArrival";

function NewArrival() {
  return (
    <section className="mt-8">
      {/* Hero Section */}
      <div className="relative h-[204px] lg:h-[412px]">
        <Image
          src={newArrival}
          alt="New Arrivals Background"
          fill
          className="object-cover"
          quality={100}
        />
        {/* Overlay */}
        <div className="absolute inset-0 " />
        {/* Content */}
        <div className="absolute inset-x-0 top-[24px] z-10 lg:top-[60px]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl text-white">
              <h2 className="font-heading text-2xl lg:text-4xl flex gap-2 items-center">
                New Arrivals
                <div className="my-2 inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-3">
                  <FaRegGem className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                  <span className="text-xs font-heading font-normal lg:text-sm lg:font-semibold">
                    500+ New Items
                  </span>
                </div>
              </h2>
              <p className="w-[80%] max-w-[510px] text-xs leading-normal text-white/90 lg:w-auto lg:text-xl lg:leading-loose  font-heading">
                New Arrivals Dropping Daily, Monday through Friday.
                <br />
                Explore the Latest Launches Now!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="relative z-20  -top-[40px] sm:-top-[50px] lg:-top-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex  gap-6 md:flex-row md:justify-between">
            <div className="w-full rounded-xl bg-white p-2 sm:p-3  md:w-[49%]">
              <a
                href="#"
                className="relative block h-[150px] sm:h-[215px] overflow-hidden rounded-lg lg:h-[336px]"
              >
                <Image
                  src={mangalsutra}
                  alt="Mangalsutra"
                  fill
                  className="object-cover"
                  quality={100}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-2 lg:p-4">
                  <h3 className="font-heading text-sm md:text-xl  text-white">
                    Mangalsutra
                  </h3>
                </div>
              </a>
            </div>
            <div className="w-full rounded-xl bg-white p-3 md:w-[49%]">
              <a
                href="#"
                className="relative block h-[150px] sm:h-[215px] overflow-hidden rounded-lg lg:h-[336px]"
              >
                <Image
                  src={pendants}
                  alt="Pendants"
                  fill
                  className="object-cover"
                  quality={100}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-2 lg:p-4">
                  <h3 className="font-heading text-sm md:text-xl  text-white">
                    Pendants
                  </h3>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewArrival;
