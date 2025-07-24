"use client";

import Container from "@/app/components/layouts/Container";
import { AnimatePresence, motion } from "framer-motion"; // Add this import

import {
  Heart,
  ShoppingBag,
  Diamond,
  Store,
  User,
  Camera,
  Microphone,
  Search,
  NavLogoMobile,
} from "@/app/assets/Navbar";
import { SlMenu } from "react-icons/sl";
import { useEffect, useState } from "react";

export default function Navbar() {
  const placeholders = [
    "Search for Gold Jewellery",
    "Search for Diamond Jewellery",
    "Search for Rings, Earrings and more...",
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [inputValue, setInputValue] = useState("");
  // Rotate placeholder every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="bg-white fixed top-auto w-full z-30">
      <Container>
        <div className="flex items-center justify-between py-3">
          {/* Left: Logo */}
          <div className="flex-shrink-0 hidden lg:block">
            <img src="/logo.svg" alt="Logo" className="h-[45px]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden block text-primary rounded-full p-2">
              <SlMenu />
            </div>
            <div className="lg:hidden block flex-shrink-0">
              <NavLogoMobile className="h-[22px]" />
            </div>
          </div>

          {/* Center: Search */}
          <div className=" max-w-xl ml-[10vw] ">
            <div className="hidden lg:flex items-center rounded-full border border-gray-200 w-[540px] h-[45px] px-4">
              <Search className="text-primary  mr-2 w-5 h-5" />
              <div className="relative w-full">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full text-sm focus:outline-none bg-transparent relative z-10"
                />
                {/* Animated Placeholder */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-1 pointer-events-none w-full">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentPlaceholder}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-gray-400 truncate"
                    >
                      {placeholders[currentPlaceholder]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
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
        <div className="flex items-center rounded-sm border border-gray-200 mb-2  h-[42px] w-full lg:hidden px-4">
          <Search className="text-primary  mr-2 w-5 h-5" />
          <div className="relative w-full">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-sm focus:outline-none bg-transparent relative z-10"
            />
            {/* Animated Placeholder */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-1 pointer-events-none w-full">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPlaceholder}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-400 truncate"
                >
                  {placeholders[currentPlaceholder]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center ml-auto gap-3 text-primary">
            <Camera className="w-5 h-5" />
            <Microphone className="w-5 h-5" />
          </div>
        </div>
      </Container>
    </header>
  );
}
