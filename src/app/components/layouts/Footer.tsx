'use client';

import { Visa, Mastercard, Paypal, Maestro } from '@/app/assets/Footer';
import Container from './Container';
import Link from 'next/link';
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaShieldHalved,
  FaTruck,
  FaHeadset,
  FaGift,
} from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { LogoCaelvi } from '@/app/assets';

const FooterLinkGroup = ({
  title,
  links,
}: {
  title: string;
  links: string[];
}) => (
  <motion.div
    className="text-center md:text-left"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <h3 className="font-bold mb-4 md:mb-6 font-heading text-accent text-base md:text-lg">
      {title}
    </h3>
    <ul className="space-y-2 md:space-y-4 text-muted-foreground text-xs md:text-sm">
      {links.map((link: string) => (
        <li key={link}>
          <Link
            href="#"
            className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
          >
            {link}
          </Link>
        </li>
      ))}
    </ul>
  </motion.div>
);

const ContactInfo = ({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  href?: string;
}) => (
  <div className="flex items-center gap-2 md:gap-3 text-muted-foreground text-xs md:text-sm">
    <Icon className="text-primary text-sm md:text-lg flex-shrink-0" />
    {href ? (
      <Link
        href={href}
        className="hover:text-primary transition-colors truncate"
      >
        {text}
      </Link>
    ) : (
      <span className="truncate">{text}</span>
    )}
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <motion.div
    className="text-center p-4 md:p-6 bg-background/30 backdrop-blur-sm rounded-xl border border-muted-foreground/10"
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="text-primary text-xl md:text-2xl" />
    </div>
    <h4 className="font-semibold text-sm md:text-base mb-2 text-accent">
      {title}
    </h4>
    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export default function Footer() {
  const shopLinks = [
    'All Jewellery',
    'New Arrivals',
    'Best Sellers',
    'Collections',
    'Wedding Collection',
    'Daily Wear',
  ];
  const aboutLinks = [
    'Our Story',
    'Blog',
    'Store Locator',
    'Careers',
    'Press',
    'Sustainability',
  ];
  const serviceLinks = [
    'Contact Us',
    'Help & FAQs',
    'Shipping & Returns',
    'Track your Order',
    'Size Guide',
    'Care Instructions',
  ];

  const features = [
    {
      icon: FaShieldHalved,
      title: 'Secure Shopping',
      description: '100% secure payment processing with SSL encryption',
    },
    {
      icon: FaTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹250 with tracking',
    },
    {
      icon: FaHeadset,
      title: '24/7 Support',
      description: 'Round the clock customer support via chat & phone',
    },
    {
      icon: FaGift,
      title: 'Gift Wrapping',
      description: 'Beautiful gift wrapping available for all orders',
    },
  ];

  return (
    <footer className="relative mt-32">
      {/* Enhanced Arch SVG */}
      <div className="absolute bottom-full left-0 w-full text-muted">
        <svg
          viewBox="0 0 1440 120"
          fill="currentColor"
          preserveAspectRatio="none"
          className="w-full h-auto"
        >
          <path
            className="wave1"
            d="M0,120L48,110C96,100,192,80,288,75C384,70,480,80,576,85C672,90,768,90,864,80C960,70,1056,50,1152,45C1248,40,1344,50,1392,55L1440,60V120H1392C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V120Z"
          />
          <path
            className="wave1"
            d="M0,120L48,100C96,80,192,40,288,35C384,30,480,60,576,70C672,80,768,70,864,65C960,60,1056,60,1152,70C1248,80,1344,100,1392,110L1440,120V120H0V120Z"
            opacity="0.4"
          />
        </svg>
      </div>

      <div className="bg-gradient-to-b from-muted to-muted/95 text-foreground pt-12 md:pt-16 pb-6 md:pb-8">
        <Container>
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
            {/* Brand Section */}
            <motion.div
              className="sm:col-span-2 lg:col-span-1 text-center sm:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl  mb-3 md:mb-4  text-accent flex justify-center p-2">
                <LogoCaelvi className="text-sm" />
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6 leading-relaxed">
                Exquisite Jewellery for Every Occasion. Crafted with passion,
                designed for elegance.
              </p>

              {/* Contact Info */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 mx-auto flex flex-col max-sm:items-center">
                <ContactInfo
                  icon={FaPhone}
                  text="+91 9328901475"
                  href="tel:+91 9328901475"
                />
                <ContactInfo
                  icon={FaEnvelope}
                  text="support@caelvi.com"
                  href="mailto:support@caelvi.com"
                />
                <ContactInfo
                  icon={FaLocationDot}
                  text="B22 247 - CAELVI, Ahmedabad 380063"
                />
              </div>

              {/* Social Links */}
              <div className="flex justify-center sm:justify-start gap-3 md:gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href="#"
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 md:p-3 rounded-full transition-all duration-200 inline-flex items-center justify-center"
                    aria-label="Follow us on Instagram"
                  >
                    <FaInstagram className="text-sm md:text-lg" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href="#"
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 md:p-3 rounded-full transition-all duration-200 inline-flex items-center justify-center"
                    aria-label="Follow us on Twitter"
                  >
                    <FaXTwitter className="text-sm md:text-lg" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href="#"
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 md:p-3 rounded-full transition-all duration-200 inline-flex items-center justify-center"
                    aria-label="Follow us on Facebook"
                  >
                    <FaFacebookF className="text-sm md:text-lg" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href="#"
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 md:p-3 rounded-full transition-all duration-200 inline-flex items-center justify-center"
                    aria-label="Follow us on YouTube"
                  >
                    <FaYoutube className="text-sm md:text-lg" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Link Groups */}
            <FooterLinkGroup title="Shop" links={shopLinks} />
            <FooterLinkGroup title="About Caelvi" links={aboutLinks} />
            <FooterLinkGroup title="Customer Service" links={serviceLinks} />
          </div>

          {/* Features Section */}
          <motion.div
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h4 className="text-xl md:text-2xl font-bold mb-2 font-heading text-accent">
                Why Choose Caelvi?
              </h4>
              <p className="text-muted-foreground text-sm md:text-base">
                We&apos;re committed to providing the best shopping experience
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </motion.div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 pt-6 md:pt-8 border-t border-muted-foreground/20">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-accent">
              <span className="text-xs md:text-sm text-muted-foreground">
                We Accept:
              </span>
              <div className="flex items-center gap-2 md:gap-3">
                <Visa className="h-3 md:h-4" />
                <Mastercard className="h-3 md:h-4" />
                <Paypal className="h-3 md:h-4" />
                <Maestro className="h-3 md:h-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/80 text-center sm:text-right">
              © {new Date().getFullYear()} Caelvi. All Rights Reserved.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
