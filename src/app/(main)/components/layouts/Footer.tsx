'use client';

import { Visa, Mastercard, Paypal, Maestro } from '@/app/(main)/assets/Footer';
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
} from 'react-icons/fa6';
import { motion } from 'framer-motion';
// import { LogoCaelvi } from '@/app/(main)/assets';
import { Philosopher } from 'next/font/google';

const philosopher = Philosopher({
  subsets: ['latin'],
  weight: ['400', '700'],
});
const FooterLinkGroup = ({
  title,
  links,
}: {
  title: string;
  links: { name: string; to: string }[];
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
      {links.map((link: { name: string; to: string }) => (
        <li key={link.to}>
          <Link
            href={link.to}
            className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
          >
            {link.name}
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

export default function Footer() {
  const shopLinks = [
    { name: 'All Jewellery', to: '/all-jewellery' },
    { name: 'New Arrivals', to: '/new-arrivals' },
    { name: 'Collections', to: '/collections' },
    { name: 'Categories', to: '/categories' },
  ];
  const aboutLinks = [
    { name: 'Our Story', to: '/our-story' },
    { name: 'Sustainability', to: '/sustainability' },
    { name: 'Terms & Conditions', to: '/terms-conditions' },
    { name: 'Privacy Policy', to: '/privacy' },
  ];
  const serviceLinks = [
    { name: 'Contact Us', to: '/contact-us' },
    { name: 'Help & FAQs', to: '/faqs' },
    { name: 'Shipping & Returns', to: '/returns' },

  ];

  return (
    <footer className="relative mt-32 xl:mt-56">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-4 md:mb-5">
            {/* Brand Section */}
            <motion.div
              className="sm:col-span-2 lg:col-span-1 text-center sm:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {/* <h3 className="text-2xl  mb-3 md:mb-4  text-accent flex ">
                <LogoCaelvi className="h-5" />
              </h3>
               */}

              <h1
                className={`${philosopher.className} text-2xl md:text-3xl  mb-5 text-primary `}
              >
                {/* <LogoCaelvi className="h-4" /> */}
                CAELVI
              </h1>
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
                <ContactInfo icon={FaLocationDot} text="Ahmedabad" />
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
          <div className="relative overflow-hidden py-6 bg-muted/30">
            <div className="animate-marquee flex space-x-16 text-sm font-heading text-accent tracking-wide">
              {[
                'Ethically Sourced Diamonds',
                'Exquisite Craftsmanship',
                'Certified Authenticity',
                'Lifetime Warranty',
                'Free Insured Delivery',
              ].map((text, i) => (
                <span key={`first-${i}`} className="whitespace-nowrap">
                  ✦ {text}
                </span>
              ))}

              {/* Duplicate list for smooth infinite effect */}
              {[
                'Ethically Sourced Diamonds',
                'Exquisite Craftsmanship',
                'Certified Authenticity',
                'Lifetime Warranty',
                'Free Insured Delivery',
              ].map((text, i) => (
                <span key={`second-${i}`} className="whitespace-nowrap">
                  ✦ {text}
                </span>
              ))}
            </div>
          </div>

          <style jsx>{`
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 25s linear infinite;
            }
            @keyframes marquee {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
          `}</style>

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
