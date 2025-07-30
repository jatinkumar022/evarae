"use client";

import React from "react";
import Image from "next/image";
import { Gift1, Gift1Mobile, Gift2, GiftMobile } from "../../assets/Common";

export default function Gift() {
  return (
    <section className="flex flex-col md:flex-row items-stretch gap-8 mt-10">
      <div className="flex-1">
        <Image
          src={Gift1}
          alt="Evarae Gift"
          className="w-full h-full object-cover rounded-lg block md:hidden"
        />
        <Image
          src={Gift1Mobile}
          alt="Evarae Gift"
          className="w-full h-full object-cover rounded-lg hidden md:block"
        />
      </div>
      <div className="flex-1">
        <Image
          src={Gift2}
          alt="Evarae Gift"
          className="w-full h-full object-cover rounded-lg hidden md:block"
        />
        <Image
          src={GiftMobile}
          alt="Evarae Gift"
          className="w-full h-full object-cover rounded-lg block md:hidden"
        />
      </div>
    </section>
  );
}
