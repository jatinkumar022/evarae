"use client";
import { useEffect, useState, useRef } from "react";

export default function useScrollDirection(): "up" | "down" {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 0) return; // Safety

      if (Math.abs(currentScrollY - lastScrollYRef.current) < 10) return; // Threshold

      setDirection(currentScrollY > lastScrollYRef.current ? "down" : "up");
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Empty deps - only run once on mount

  return direction;
}
