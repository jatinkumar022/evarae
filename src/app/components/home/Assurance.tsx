'use client';
import React from 'react';
import { Heart, Gem, Shield, Sparkles, Award, Leaf } from 'lucide-react';

const PromiseCard = ({
  children,
  title,
  description,
  index,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) => (
  <div
    className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100/90 to-white/70 backdrop-blur-xl border border-white/30 p-8 text-center transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-100/50 ${
      index % 2 === 0
        ? 'hover:from-rose-50/90 hover:to-pink-50/70'
        : 'hover:from-purple-50/90 hover:to-indigo-50/70'
    }`}
    style={{
      animationDelay: `${index * 150}ms`,
      animation: 'fadeInUp 0.6s ease-out forwards',
    }}
  >
    {/* Decorative gradient orb */}
    <div
      className={`absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${
        index % 2 === 0
          ? 'bg-gradient-to-br from-rose-400 to-pink-500'
          : 'bg-gradient-to-br from-purple-400 to-indigo-500'
      }`}
    />

    <div
      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${
        index % 2 === 0
          ? 'from-rose-100 to-pink-100 group-hover:from-rose-200 group-hover:to-pink-200'
          : 'from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200'
      } flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
    >
      <div
        className={`${
          index % 2 === 0 ? 'text-rose-600' : 'text-purple-600'
        } transition-colors duration-300`}
      >
        {children}
      </div>
    </div>

    <h3 className="font-medium text-foreground tracking-wider uppercase text-sm mb-3">
      {title}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
      {description}
    </p>
  </div>
);

type AssuranceItem = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const assurances: AssuranceItem[] = [
  {
    icon: Heart,
    title: 'Skin-Loving Materials',
    description:
      'Hypoallergenic imitation alloys carefully selected for sensitive skin, ensuring comfort throughout your day.',
  },
  {
    icon: Gem,
    title: 'Lustrous Beauty',
    description:
      'Premium finishes that capture light beautifully, giving you the glamorous look of fine jewelry.',
  },
  {
    icon: Shield,
    title: 'Tarnish Resistant',
    description:
      'Advanced coating technology helps maintain the brilliant appearance with minimal maintenance required.',
  },
  {
    icon: Sparkles,
    title: 'Artisan Crafted',
    description:
      'Each piece is meticulously designed and crafted to mirror the elegance of precious jewelry.',
  },
  {
    icon: Award,
    title: 'Quality Assured',
    description:
      'Rigorous quality control ensures every piece meets our high standards before reaching you.',
  },
  {
    icon: Leaf,
    title: 'Mindfully Made',
    description:
      'Sustainable practices and eco-friendly packaging reflect our commitment to responsible fashion.',
  },
];

export default function ElegantJewelryAssurance() {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        {/* Header with same typography system */}
        <div className="heading-component-main-container">
          <h1 className="heading-component-main-heading">Our Promise to You</h1>
          <h2 className="heading-component-main-subheading max-w-3xl mx-auto">
            Exquisite fashion jewelry that delivers luxury aesthetics without
            the premium price. Beautiful, accessible, and crafted with care.
          </h2>
        </div>

        {/* Assurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {assurances.map((item, index) => {
            const Icon = item.icon;
            return (
              <PromiseCard
                key={index}
                title={item.title}
                description={item.description}
                index={index}
              >
                <Icon size={32} strokeWidth={1.5} />
              </PromiseCard>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <div className="inline-block p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              <strong className="text-gray-700">Transparency Promise:</strong>{' '}
              We proudly create beautiful imitation jewelry. Our pieces are not
              made from real gold or gold-plated materials, but are designed to
              give you the same elegant look and feel at an accessible price
              point.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
