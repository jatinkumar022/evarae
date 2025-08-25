'use client';

import Image from 'next/image';
import Container from '@/app/components/layouts/Container';
import { one, two } from '@/app/assets/Home/CAROUSEL';
import { banglesCat, chainsCat, ringsCat } from '@/app/assets/CategoryGrid';
import { mangalsutra } from '@/app/assets/Animatedgrid';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Craftsmanship',
    'Trends',
    'Heritage',
    'Sustainability',
    'Care Tips',
  ];

  const featuredPost = {
    id: 1,
    title: 'The Art of Handcrafted Excellence: Inside Our Atelier',
    excerpt:
      'Step into the world of master craftsmen where each piece of jewellery begins its journey from raw materials to works of art that tell your story.',
    category: 'Craftsmanship',
    readTime: '8 min read',
    date: 'December 15, 2024',
    author: 'Elena Caelvi',
    image: one,
    featured: true,
  };

  const blogPosts = [
    {
      id: 2,
      title: '2025 Jewellery Trends: Timeless Meets Contemporary',
      excerpt:
        'Discover the emerging trends that are shaping the future of luxury jewellery while honoring traditional craftsmanship.',
      category: 'Trends',
      readTime: '6 min read',
      date: 'December 12, 2024',
      author: 'Sofia Rodriguez',
      image: two,
      featured: false,
    },
    {
      id: 3,
      title: 'Sustainable Luxury: Our Commitment to Ethical Sourcing',
      excerpt:
        'Learn about our journey towards 100% sustainable practices and how we partner with ethical suppliers worldwide.',
      category: 'Sustainability',
      readTime: '7 min read',
      date: 'December 10, 2024',
      author: 'Marcus Chen',
      image: ringsCat,
      featured: false,
    },
    {
      id: 4,
      title: 'The Heritage Behind Filigree: Ancient Art in Modern Times',
      excerpt:
        'Exploring the centuries-old technique of filigree and how our artisans preserve this delicate craft for future generations.',
      category: 'Heritage',
      readTime: '5 min read',
      date: 'December 8, 2024',
      author: 'Elena Caelvi',
      image: chainsCat,
      featured: false,
    },
    {
      id: 5,
      title: 'How to Care for Your Precious Jewellery',
      excerpt:
        'Essential tips and techniques to maintain the beauty and longevity of your Caelvi pieces for generations to come.',
      category: 'Care Tips',
      readTime: '4 min read',
      date: 'December 6, 2024',
      author: 'Sofia Rodriguez',
      image: banglesCat,
      featured: false,
    },
    {
      id: 6,
      title: 'The Science Behind Perfect Diamond Setting',
      excerpt:
        'Understanding the precision and expertise required to create settings that showcase diamonds in their full brilliance.',
      category: 'Craftsmanship',
      readTime: '9 min read',
      date: 'December 4, 2024',
      author: 'Marcus Chen',
      image: mangalsutra,
      featured: false,
    },
    {
      id: 7,
      title: 'Celebrating Cultural Heritage Through Design',
      excerpt:
        'How traditional motifs and cultural symbols inspire contemporary jewellery designs that bridge past and present.',
      category: 'Heritage',
      readTime: '6 min read',
      date: 'December 2, 2024',
      author: 'Elena Caelvi',
      image: one,
      featured: false,
    },
  ];

  const filteredPosts =
    selectedCategory === 'All'
      ? blogPosts
      : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="bg-white text-text-primary">
      {/* Enhanced Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <Image
          src={two}
          alt="Caelvi Blog - Jewellery Stories"
          fill
          className="object-cover scale-105 transition-transform duration-700 ease-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-5xl lg:text-7xl font-fraunces text-white mb-6 drop-shadow-2xl tracking-wide">
              Blog
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed drop-shadow-lg">
              Discover the artistry, heritage, and passion behind every Caelvi
              creation
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <Container>
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="heading-component-main-heading mb-5">
              Featured Story
            </h2>
            <p className="lg:text-lg text-text-primary/80 max-w-3xl mx-auto">
              Dive deep into the world of luxury jewellery with our latest
              featured article
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-xl"></div>
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="flex items-center space-x-4 text-sm text-text-primary/60">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
                  {featuredPost.category}
                </span>
                <span>{featuredPost.date}</span>
                <span>{featuredPost.readTime}</span>
              </div>

              <h3 className="text-3xl lg:text-4xl font-fraunces font-semibold text-primary leading-tight">
                {featuredPost.title}
              </h3>

              <p className="text-lg text-text-primary/80 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {featuredPost.author
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <span className="text-text-primary/80 font-medium">
                    {featuredPost.author}
                  </span>
                </div>
              </div>

              <button className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-300">
                Read Full Story
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* Blog Categories & Filter */}
      <div className="bg-bg-menu">
        <Container>
          <div className="py-16">
            <div className="text-center mb-12">
              <h2 className="heading-component-main-heading mb-5">
                Explore Our Stories
              </h2>
              <p className="lg:text-lg text-text-primary/80 max-w-3xl mx-auto">
                From craftsmanship insights to care tips, discover stories that
                celebrate the art of jewellery
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-text-primary/80 hover:bg-primary/5 hover:text-primary border border-primary/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/10">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-accent/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs text-text-primary/60">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="text-xl font-fraunces font-semibold text-primary leading-tight group-hover:text-accent transition-colors duration-300">
                        {post.title}
                      </h3>

                      <p className="text-text-primary/80 text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {post.author
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </div>
                          <span className="text-text-primary/70 text-sm">
                            {post.author}
                          </span>
                        </div>

                        <button className="text-primary font-semibold text-sm hover:text-accent transition-colors duration-300">
                          Read More →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Newsletter Subscription */}
      <Container>
        <div className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-12 border border-primary/10">
                <h2 className="text-3xl lg:text-4xl font-fraunces font-semibold text-primary mb-6">
                  Stay Inspired
                </h2>
                <p className="lg:text-lg text-text-primary/80 mb-8 leading-relaxed">
                  Subscribe to our newsletter and be the first to discover new
                  stories, exclusive insights, and behind-the-scenes glimpses
                  into the world of Caelvi.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-3 rounded-full border border-primary/20 focus:outline-none focus:border-primary transition-colors duration-300"
                  />
                  <button className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-300">
                    Subscribe
                  </button>
                </div>

                <p className="text-text-primary/60 text-sm mt-4">
                  Join 10,000+ jewellery enthusiasts who trust us with their
                  inbox
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Decorative Section */}
      <div className="mt-24 text-center">
        <div className="inline-flex items-center space-x-4 mb-8">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-400"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-300 to-purple-400"></div>
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-300 to-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-300"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-purple-300"></div>
        </div>
        <p className="text-gray-500 font-light italic text-lg">
          &ldquo;Every story is a jewel waiting to be discovered&rdquo;
        </p>
      </div>
    </div>
  );
}
