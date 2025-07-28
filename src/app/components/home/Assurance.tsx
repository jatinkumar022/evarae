// AssuranceSection.tsx
"use client";

import Image from "next/image";
import { Heart, Hammer, Diamond } from "@/app/assets/Common";
export default function AssuranceSection() {
  return (
    <section className="font-heading border-t mt-10 px-5">
      <div className=" flex flex-col md:flex-row justify-between max-md:gap-12 max-md:py-16">
        {/* Left Text Section */}
        <div className="md:py-[120px] text-center md:max-w-1/2 w-full md:border-r flex flex-col justify-center">
          <h2 className="text-3xl md:text-6xl text-black font-medium ">
            Tanishq <span className="text-primary">Assurance</span>
          </h2>
          <p className=" mt-2 text-lg text-gray">
            Crafted by experts, cherished by you
          </p>
        </div>
        {/* Right Icons Section */}
        <div className="md:py-[120px] text-center md:max-w-1/2 w-full pl-5 flex flex-col justify-center">
          <div className="flex justify-between">
            <div className="w-[267px]">
              <div className="flex flex-col items-center">
                <Hammer className="w-12 h-12 sm:w-16 sm:h-16" />
                <p className="text-center text-heading  font-medium text-xs sm:text-base mt-1">
                  Quality
                  <br />
                  Craftsmanship
                </p>
              </div>
            </div>
            <div className="w-[267px]">
              <div className="flex flex-col items-center">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16" />
                <p className="text-center text-heading  font-medium text-xs sm:text-base  mt-1">
                  Ethically
                  <br />
                  Sourced
                </p>
              </div>
            </div>
            <div className="w-[267px]">
              <div className="flex flex-col items-center">
                <Diamond className="w-12 h-12 sm:w-16 sm:h-16" />
                <p className="text-center text-heading  font-medium text-xs sm:text-base  mt-1">
                  100%
                  <br />
                  Transparency
                </p>
              </div>
            </div>
          </div>
        </div>{" "}
      </div>
    </section>
  );
}
