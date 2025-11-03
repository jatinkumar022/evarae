"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        updateDropdownPosition();
      };
      const handleResize = () => {
        updateDropdownPosition();
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  return (
    <>
      <div className={`relative ${className}`} ref={selectRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              if (!isOpen) {
                updateDropdownPosition();
              }
              setIsOpen(!isOpen);
            }
          }}
          className={`
            w-full px-3 py-2 text-left 
            bg-white dark:bg-[#242424] 
            border border-gray-300 dark:border-[#525252] 
            rounded-md 
            text-sm 
            text-gray-900 dark:text-white 
            placeholder-gray-400 dark:placeholder-[#696969]
            focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-between
            transition-colors
            ${isOpen ? "ring-2 ring-primary-500 dark:ring-primary-400 border-primary-500 dark:border-primary-400" : ""}
          `}
        >
          <span className={selectedOption ? "" : "text-gray-400 dark:text-[#696969]"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && dropdownPosition && (
        <>
          <div
            className="fixed inset-0 z-[40]"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className="fixed z-[50] bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#525252] rounded-md shadow-lg max-h-60 overflow-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2 text-left text-sm
                    flex items-center justify-between
                    transition-colors
                    ${
                      option.value === value
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};


