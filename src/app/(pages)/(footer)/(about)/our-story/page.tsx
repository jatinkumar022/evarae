'use client';

import Image from 'next/image';
import Container from '@/app/components/layouts/Container';
import { one, two } from '@/app/assets/Home/CAROUSEL';
import { banglesCat, chainsCat, ringsCat } from '@/app/assets/CategoryGrid';
import { mangalsutra } from '@/app/assets/Animatedgrid';
import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

export default function OurStoryPage() {
  const ref = useRef<HTMLDivElement>(null);

  // Track scroll progress relative to this timeline section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 100px', 'end end'], // tweak for when animation should start/end
  });

  // Scale vertical line height according to scroll progress
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const milestones = [
    {
      year: '2018',
      title: 'The Beginning',
      description:
        'Founded with a vision to create accessible luxury jewellery that tells personal stories.',
    },
    {
      year: '2020',
      title: 'Sustainable Commitment',
      description:
        'Introduced ethically sourced materials and eco-friendly packaging across all collections.',
    },
    {
      year: '2022',
      title: 'Global Recognition',
      description:
        'Featured in international fashion magazines and worn by celebrities worldwide.',
    },
    {
      year: '2024',
      title: 'Artisan Partnership',
      description:
        'Collaborated with master craftsmen to preserve traditional jewellery-making techniques.',
    },
  ];

  const values = [
    {
      icon: '✨',
      title: 'Timeless Elegance',
      description:
        'Every piece is designed to transcend trends and become a cherished heirloom.',
    },
    {
      icon: '🌿',
      title: 'Ethical Sourcing',
      description:
        'We partner with certified suppliers who share our commitment to responsible practices.',
    },
    {
      icon: '🎨',
      title: 'Artistic Excellence',
      description:
        'Our designers blend contemporary vision with traditional craftsmanship techniques.',
    },
    {
      icon: '💎',
      title: 'Quality Promise',
      description:
        'Each piece undergoes rigorous quality checks to ensure lasting beauty and durability.',
    },
  ];

  const team = [
    {
      name: 'Elena Caelvi',
      role: 'Founder & Creative Director',
      image: ringsCat,
      bio: 'With over 15 years in luxury fashion, Elena brings her passion for storytelling through jewellery to every Caelvi creation.',
    },
    {
      name: 'Marcus Chen',
      role: 'Master Craftsman',
      image: chainsCat,
      bio: 'A third-generation jeweller, Marcus ensures each piece meets the highest standards of traditional craftsmanship.',
    },
    {
      name: 'Sofia Rodriguez',
      role: 'Head of Design',
      image: banglesCat,
      bio: "Sofia's contemporary vision and attention to detail bring modern elegance to our timeless collections.",
    },
  ];

  return (
    <div className="bg-white text-text-primary">
      {/* Enhanced Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[80vh] w-full overflow-hidden">
        <Image
          src={one}
          alt="Caelvi Jewellery Atelier"
          fill
          className="object-cover scale-105 transition-transform duration-700 ease-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-fraunces text-white mb-4 sm:mb-6 drop-shadow-2xl tracking-wide">
              Our Story
            </h1>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed drop-shadow-lg px-2">
              Where heritage meets innovation, and every piece tells a story
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-4 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-0.5 h-2 sm:w-1 sm:h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <Container>
        <div className="py-10 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
            <h2 className="heading-component-main-heading mb-6 sm:mb-10">
              The Essence of Caelvi
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-primary/80 mb-4 sm:mb-6 px-2">
              At <span className="font-medium text-primary">Caelvi</span>, we
              believe that jewellery is the most intimate form of art. It lives
              on your skin, moves with your body, and becomes part of your
              story. Each piece we create is a testament to the belief that
              luxury should be personal, meaningful, and timeless.
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-primary/80 px-2">
              Our name, derived from the Latin &quot;caelum&quot; meaning
              heaven, reflects our aspiration to create pieces that elevate the
              everyday into something extraordinary – jewellery that
              doesn&apos;t just accessorize, but inspires.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
              <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                <Image
                  src={two}
                  alt="Caelvi Craftsmanship Detail"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
              <div className="p-4 sm:p-6 rounded-xl bg-bg-menu/50 border border-primary/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-medium mb-3 sm:mb-4 text-primary">
                  Our Vision
                </h3>
                <p className="text-sm sm:text-base text-text-primary/80 leading-relaxed">
                  To redefine luxury jewellery by making it accessible,
                  sustainable, and deeply personal. We envision a world where
                  every piece of jewellery carries meaning and connects the
                  wearer to their authentic self.
                </p>
              </div>
              <div className="p-4 sm:p-6 rounded-xl bg-primary/5 border border-primary/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-medium mb-3 sm:mb-4 text-primary">
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base text-text-primary/80 leading-relaxed">
                  To craft exceptional jewellery that celebrates individuality,
                  preserves traditional artistry, and creates lasting
                  connections between our pieces and the stories they help tell.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Values Section */}
      <div className="bg-bg-menu">
        <Container>
          <div className="py-10 sm:py-16 md:py-20">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="heading-component-main-heading mb-4 sm:mb-5">
                Our Values
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-primary/80 max-w-3xl mx-auto px-2">
                These principles guide every decision we make, from design
                conception to the moment our jewellery finds its home with you.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-primary/10">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-heading font-medium mb-2 sm:mb-3 text-primary">
                      {value.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-primary/80 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Journey Timeline */}
      <Container>
        <div ref={ref} className="py-10 sm:py-16 md:py-20 relative">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="heading-component-main-heading mb-4 sm:mb-5">
              Our Journey
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-primary/80 max-w-3xl mx-auto px-2">
              From a small atelier with big dreams to an internationally
              recognized brand, our story is one of passion, perseverance, and
              unwavering commitment to excellence.
            </p>
          </div>

          <div className="relative">
            {/* Static grey line - Desktop: center, Mobile: left */}
            <div className="absolute left-4 sm:left-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 h-full w-0.5 bg-primary/20"></div>

            {/* Animated line that fills as you scroll - Desktop: center, Mobile: left */}
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-4 sm:left-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 w-0.5 bg-gradient-to-b from-primary to-pink-700 origin-top"
            />

            {/* Timeline items */}
            <div className="space-y-8 sm:space-y-12 relative z-10">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    // Desktop: alternating layout, Mobile: always left-to-right
                    index % 2 === 0
                      ? 'flex-row'
                      : 'flex-row lg:flex-row-reverse'
                  }`}
                >
                  {/* Content container */}
                  <div
                    className={`w-full lg:w-1/2 ${
                      // Desktop: alternating alignment, Mobile: always left-aligned with padding
                      index % 2 === 0
                        ? 'pl-12 sm:pl-20 lg:pl-0 lg:pr-8 text-left lg:text-right'
                        : 'pl-12 sm:pl-20 lg:pl-8 lg:pr-0 text-left'
                    }`}
                  >
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-primary/10">
                      <span className="inline-block bg-primary text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium mb-2 sm:mb-3">
                        {milestone.year}
                      </span>
                      <h3 className="text-base sm:text-lg md:text-xl font-fraunces font-medium mb-2 text-primary">
                        {milestone.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-primary/80 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline dot - Desktop: center, Mobile: left */}
                  <div className="absolute left-[11px] sm:left-[25px] lg:relative lg:left-auto w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full border-2 sm:border-4 border-white shadow-lg z-10 flex-shrink-0"></div>

                  {/* Spacer for desktop alternating layout */}
                  <div className="hidden lg:block lg:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Team Section */}
      <div className="bg-gradient-to-b from-bg-menu to-white">
        <Container>
          <div className="py-10 sm:py-16 md:py-20">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="heading-component-main-heading mb-4 sm:mb-5">
                Meet Our Artisans
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-text-primary/80 max-w-3xl mx-auto px-2">
                The passionate individuals behind every Caelvi creation,
                bringing decades of expertise and artistic vision to each piece.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {team.map((member, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary/10">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-fraunces font-medium mb-1 text-primary">
                        {member.name}
                      </h3>
                      <p className="text-accent font-medium mb-2 sm:mb-3 text-xs sm:text-sm">
                        {member.role}
                      </p>
                      <p className="text-xs sm:text-sm text-text-primary/80 leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Craftsmanship Section */}
      <Container>
        <div className="py-10 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
              <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                <Image
                  src={mangalsutra}
                  alt="Master Craftsman at Work"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-fraunces font-medium text-primary text-center">
                Mastering the Art
              </h2>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-primary/80">
                Each Caelvi piece begins its journey in our atelier, where
                master craftsmen with decades of experience transform raw
                materials into works of art. Our process combines time-honored
                techniques passed down through generations with cutting-edge
                technology to ensure precision and perfection.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-xl sm:text-2xl md:text-3xl font-medium text-primary mb-1 sm:mb-2">
                    15+
                  </div>
                  <div className="text-xs sm:text-sm text-text-primary/80">
                    Years of Excellence
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-xl sm:text-2xl md:text-3xl font-medium text-primary mb-1 sm:mb-2">
                    100%
                  </div>
                  <div className="text-xs sm:text-sm text-text-primary/80">
                    Handcrafted Pieces
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-xl sm:text-2xl md:text-3xl font-medium text-primary mb-1 sm:mb-2">
                    50+
                  </div>
                  <div className="text-xs sm:text-sm text-text-primary/80">
                    Master Artisans
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-xl sm:text-2xl md:text-3xl font-medium text-primary mb-1 sm:mb-2">
                    25
                  </div>
                  <div className="text-xs sm:text-sm text-text-primary/80">
                    Countries Served
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Decorative Section */}
      <div className="mt-12 sm:mt-16 md:mt-24 text-center">
        <div className="inline-flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-400"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-rose-300 to-purple-400"></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-purple-300 to-pink-400"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-300"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-rose-400 to-purple-300"></div>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 font-light italic px-2">
          &ldquo;Where elegance meets artistry&ldquo;
        </p>
      </div>
    </div>
  );
}
