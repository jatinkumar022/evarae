'use client';

import { Sort } from '@/app/assets/Shop-list';
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const list = ref.current?.querySelectorAll('[role="option"]');
      list?.[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const option = options[focusedIndex];
      onChange(option.value);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-44" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          setFocusedIndex(
            value ? options.findIndex(o => o.value === value) : 0
          );
        }}
        className="md:w-full px-5 py-2 text-sm font-medium text-primary-dark bg-white/80 backdrop-blur-md border border-primary/20 rounded-full shadow-sm hover:bg-white/90 hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
      >
        <Sort className="w-4 h-4 md:hidden" />
        <div className=" items-center justify-between hidden md:flex">
          <span className={selected ? 'text-primary-dark' : 'text-primary/60'}>
            {selected?.label || placeholder}
          </span>

          <svg
            className={`w-4 h-4 text-primary transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-white/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto ring-1 ring-primary/5">
            <ul className="py-2" role="listbox">
              {options.map((opt, index) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={value === opt.value}
                  onMouseDown={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`relative px-5 py-2 cursor-pointer text-sm hover:bg-primary/5 hover:text-primary-dark transition-all duration-150 ease-out ${
                    opt.value === value
                      ? 'bg-primary/10 text-primary-dark font-semibold'
                      : 'text-primary-dark/80'
                  } ${
                    index === focusedIndex
                      ? 'bg-primary/15 ring-1 ring-primary/30'
                      : ''
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${
                    index === options.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{opt.label}</span>
                    {opt.value === value && (
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  {opt.value === value && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
