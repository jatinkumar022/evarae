"use client";
import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-gray-50 rounded-full hover:text-gray-700 hover:bg-gray-100 dark:bg-[#151515] dark:text-gray-400 dark:hover:bg-[#1f1f1f] dark:hover:text-white"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};
