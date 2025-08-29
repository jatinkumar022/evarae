'use client';
import React from 'react';
import { Heart, Gem, Shield } from 'lucide-react';
import Container from '../layouts/Container';

const PromiseSection = ({
  children,
  title,
  description,
  index,
  isCenter = false,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  index: number;
  isCenter?: boolean;
}) => (
  <div
    className={`relative group transition-all duration-700 ${
      isCenter ? 'transform scale-110' : ''
    }`}
    style={{
      animationDelay: `${index * 200}ms`,
      animation: 'slideInFromSide 0.8s ease-out forwards',
    }}
  >
    {/* Connecting line (only for first two items) */}
    {index < 2 && (
      <div className="hidden lg:block absolute top-1/2 -right-8 xl:-right-12 w-16 xl:w-24 h-px bg-gradient-to-r from-rose-200 via-purple-200 to-transparent transform -translate-y-1/2 group-hover:from-rose-300 group-hover:via-purple-300 transition-all duration-500" />
    )}

    <div className="text-center space-y-6">
      {/* Icon Container */}
      <div className="relative inline-flex items-center justify-center">
        {/* Outer Ring */}
        <div
          className={`w-32 h-32 rounded-full border-2 transition-all duration-500 group-hover:scale-105 ${
            isCenter
              ? 'border-purple-300 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 group-hover:border-purple-400'
              : 'border-rose-300 bg-gradient-to-br from-rose-50/80 to-pink-50/80 group-hover:border-rose-400'
          }`}
        />

        {/* Inner Circle */}
        <div
          className={`absolute w-20 h-20 rounded-full transition-all duration-500 group-hover:scale-110 ${
            isCenter
              ? 'bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200'
              : 'bg-gradient-to-br from-rose-100 to-pink-100 group-hover:from-rose-200 group-hover:to-pink-200'
          }`}
        />

        {/* Icon */}
        <div
          className={`absolute transition-all duration-500 group-hover:scale-110 ${
            isCenter ? 'text-purple-600' : 'text-primary'
          }`}
        >
          {children}
        </div>

        {/* Floating dots decoration */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3
          className={`font-semibold text-lg tracking-wide transition-colors duration-300 ${
            isCenter
              ? 'text-purple-800 group-hover:text-purple-900'
              : 'text-primary group-hover:text-primary-dark'
          }`}
        >
          {title}
        </h3>

        <div
          className={`w-16 h-px mx-auto transition-all duration-500 group-hover:w-24 ${
            isCenter
              ? 'bg-gradient-to-r from-transparent via-purple-300 to-transparent'
              : 'bg-gradient-to-r from-transparent via-rose-300 to-transparent'
          }`}
        />

        <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const assurances = [
  {
    icon: Heart,
    title: 'Skin-Loving Materials',
    description:
      'Hypoallergenic materials carefully selected for sensitive skin, ensuring day-long comfort.',
  },
  {
    icon: Gem,
    title: 'Lustrous Beauty',
    description:
      'Premium finishes that capture light beautifully, delivering the glamorous look you desire.',
  },
  {
    icon: Shield,
    title: 'Lasting Elegance',
    description:
      'Advanced coating technology maintains brilliant appearance with minimal care required.',
  },
];

export default function ElegantJewelryAssurance() {
  return (
    <section className="relative py-24  overflow-hidden">
      <Container className="relative">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="flex items-center space-x-2 text-xs lg:text-sm font-medium text-primary tracking-widest uppercase">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary" />
              <span>Our Promise</span>
              <div className="w-8 h-px bg-gradient-to-r from-primary to-transparent" />
            </div>
          </div>

          <h1 className="text-[20px] lg:text-[40px] font-heading text-gray-900 mb-6 ">
            Crafted with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-accent to-primary font-normal">
              Elegance & Care
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Exquisite fashion jewelry that delivers luxury aesthetics without
            the premium price. Beautiful, accessible, and thoughtfully crafted.
          </p>
        </div>

        {/* Three Promise Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-16 lg:space-y-0 lg:space-x-16 xl:space-x-24 mb-20">
          {assurances.map((item, index) => {
            const Icon = item.icon;
            return (
              <PromiseSection
                key={index}
                title={item.title}
                description={item.description}
                index={index}
                isCenter={index === 1}
              >
                <Icon size={36} strokeWidth={1.5} />
              </PromiseSection>
            );
          })}
        </div>

        {/* Transparency Statement */}
        <div className="text-center">
          <div className="relative inline-block max-w-3xl">
            {/* Background blur effect */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40" />

            {/* Content */}
            <div className="relative p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="mx-4 w-2 h-2 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              <h4 className="font-medium text-gray-800 mb-3 tracking-wide">
                Transparency Promise
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                We proudly create beautiful imitation jewelry. Our pieces are
                designed to give you the same elegant look and feel as fine
                jewelry, at an accessible price point that doesn&apos;t
                compromise on style or quality.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        @keyframes slideInFromSide {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
