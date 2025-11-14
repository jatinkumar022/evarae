'use client';
import React from 'react';
import { Heart, Gem, Shield } from 'lucide-react';
import Container from '../layouts/Container';

const PromiseCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="text-center space-y-4 group">
    {/* Icon */}
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
      <Icon size={32} strokeWidth={1.5} className="text-primary" />
    </div>

    {/* Content */}
    <div className="space-y-2">
      <h3 className="font-semibold text-lg text-gray-800">
        {title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  </div>
);

const assurances = [
  {
    icon: Heart,
    title: 'Hypoallergenic Materials',
    description:
      'Safe and comfortable materials perfect for sensitive skin, ensuring you can wear our imitation jewelry all day without irritation.',
  },
  {
    icon: Gem,
    title: 'Premium Finish',
    description:
      'Beautifully crafted imitation jewelry with premium finishes that look just like real jewelry at a fraction of the cost.',
  },
  {
    icon: Shield,
    title: 'Durable & Long-Lasting',
    description:
      'Quality construction ensures your imitation jewelry maintains its beautiful appearance with proper care.',
  },
];

export default function ElegantJewelryAssurance() {
  return (
    <section className="py-16 sm:py-20 md:py-24">
      <Container>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="heading-component-main-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4">
            Our Promise
          </h1>
          <h2 className="heading-component-main-subheading text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Beautiful imitation jewelry that gives you the elegant look you desire without the premium price tag.
          </h2>
        </div>

        {/* Three Promise Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-12">
          {assurances.map((item, index) => (
            <PromiseCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        {/* Transparency Statement */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 sm:p-8">
            <h4 className="font-medium text-gray-800 mb-3 text-lg">
              Our Commitment
            </h4>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We proudly create beautiful imitation jewelry. Our pieces are designed to give you the same elegant look and feel as fine jewelry, at an accessible price point that doesn&apos;t compromise on style or quality.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
