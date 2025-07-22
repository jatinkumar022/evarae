"use client";

import Container from "@/app/components/layouts/Container";

import {
  Heart,
  ShoppingBag,
  Diamond,
  Store,
  User,
  Camera,
  Microphone,
  Search,
} from "@/app/assets/Navbar";

export default function Navbar() {
  return (
    <header className="bg-white fixed top-auto w-full z-30">
      <Container>
        <div className="flex items-center justify-between py-3">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img src="/logo.svg" alt="Logo" className="h-[45px]" />
          </div>

          {/* Center: Search */}
          <div className=" max-w-xl ml-[10vw] ">
            <div className="flex items-center rounded-full border border-gray-200 w-[540px] h-[45px] px-4">
              <Search className="text-primary  mr-2 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for Gold Jewellery, Diamond Jewellery and more..."
                className="w-full  text-sm focus:outline-none bg-transparent"
              />
              <div className="flex items-center ml-auto gap-3 text-primary">
                <Camera className="w-5 h-5" />
                <Microphone className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-6 text-primary text-lg">
            <Diamond className="w-5 h-5" />
            <Store className="w-5 h-5" />
            <Heart className="w-5 h-5" />
            <User className="w-5 h-5" />
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 min-w-4 text-center ">
                5
              </span>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
