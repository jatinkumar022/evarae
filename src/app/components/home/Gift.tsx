"use client";

import React from "react";
import Link from "next/link";
import { Flower, Tanishq, BGDesktop, BGMobile } from "../../assets/Common";
import { ChevronRight } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 items-stretch gap-8 ">
      <div className="relative w-full bg-cart rounded-2xl border border-cart overflow-hidden ">
        {/* Ribbon and Bow */}
        <div className="absolute inset-0">
          <div className="absolute top-0 h-full sm:w-[35px] w-[20px] sm:left-[65px] left-[35px] ribbon-vertical"></div>
          <div className="absolute left-0 w-full sm:h-[35px] h-[20px] sm:bottom-[65px] bottom-[35px] ribbon-vertical"></div>
          <Flower className="absolute sm:w-24 w-16 sm:h-24 h-16 sm:left-[35px] left-[15px] sm:bottom-[35px] bottom-[15px] z-20" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 h-full sm:p-0 sm:pl-[150px] pl-[90px] sm:pt-[50px] pt-[30px] sm:pb-[120px] pb-[70px] xl:pt-[150px] xl:pb-[50px] sm:pr-[70px] pr-4">
          <h3 className="font-heading text-lg sm:text-[32px] md:text-[52px] text-primary mb-2">
            #GiftOfChoice
          </h3>
          <p className=" leading-7 text-gray text-[10px] sm:text-lg text-xs">
            Breathtaking gifts for your loved one’s
            <br />
            <span className="font-medium text-primary uppercase">
              STARTING AT ₹10,000
            </span>
          </p>
          <Link
            href="#"
            className="gift-btn mt-3 sm:mt-11 px-3 py-1.5 sm:p-[13px]"
          >
            Know more
            <ChevronRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      <div className="relative w-full ">
        <BGDesktop className="w-full h-full hidden xl:block" />
        <BGMobile className="w-full h-full xl:hidden" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-8">
          <div className="w-9 h-9  sm:w-20 sm:h-20">
            <Tanishq className="w-full h-full" />
          </div>
          <h3 className="mt-2 sm:mt-8 text-[13px] sm:text-2xl md:text-3xl xl:text-4xl font-serif text-[#300708]">
            Exchange your Old Gold <br /> for 100% Value!
          </h3>
          <p className="mt-4 text-xs xl:text-lg text-[#5A5A5A] hidden md:block">
            Unlock full value for your old gold today with our{" "}
            <span className="font-bold text-[#300708]">Exchange Program !</span>
          </p>
          <p className="mt-2 sm:mt-4 text-[9px] xl:text-lg text-[#5A5A5A] md:hidden">
            Unlock full value for old gold today
          </p>

          <Link
            href="#"
            className="gift-btn mt-3 sm:mt-11 px-3 py-1.5 sm:p-[13px]"
          >
            Know more
            <ChevronRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
