import React from "react";
import Image from "next/image";
import { FaRegGem } from "react-icons/fa6";
import { mangalsutra, pendants, newArrival } from "@/app/assets/NewArrival";
import Container from "../layouts/Container";
import Link from "next/link";

function NewArrival() {
  return (
    <section className="relative mt-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={newArrival}
          alt="New Arrivals Background"
          fill
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
      </div>

      <Container>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          {/* Content */}
          <div className="text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 mb-4">
              <FaRegGem className="h-4 w-4" />
              <span className="text-sm font-medium">500+ New Items</span>
            </div>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold">
              Freshly Minted
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-lg mx-auto lg:mx-0">
              Discover the latest treasures to join the Caelvi family. New
              arrivals dropping every week.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2">
              <Link
                href="#"
                className="relative block overflow-hidden rounded-lg group cursor-pointer"
                aria-label="Explore The Eternal Vow mangalsutra collection"
              >
                <Image
                  src={mangalsutra}
                  alt="Mangalsutra"
                  width={400}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="font-heading text-lg text-white font-semibold">
                    The Eternal Vow
                  </h3>
                </div>
              </Link>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2">
              <Link
                href="#"
                className="relative block overflow-hidden rounded-lg group cursor-pointer"
                aria-label="Explore Delicate Statements pendant collection"
              >
                <Image
                  src={pendants}
                  alt="Pendants"
                  width={400}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="font-heading text-lg text-white font-semibold">
                    Delicate Statements
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default NewArrival;
