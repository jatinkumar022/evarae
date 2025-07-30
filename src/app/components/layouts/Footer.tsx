"use client";

import { Visa, Mastercard, Paypal, Maestro } from "@/app/assets/Footer";
import Container from "./Container";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

const FooterLinkGroup = ({
  title,
  links,
}: {
  title: string;
  links: string[];
}) => (
  <div className="text-center md:text-left">
    <h3 className="font-bold mb-4 font-heading text-accent">{title}</h3>
    <ul className="space-y-3 text-muted-foreground text-sm">
      {links.map((link: string) => (
        <li key={link}>
          <a href="#" className="hover:text-primary transition-colors">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  const shopLinks = [
    "All Jewellery",
    "New Arrivals",
    "Best Sellers",
    "Collections",
  ];
  const aboutLinks = ["Our Story", "Blog", "Store Locator", "Careers"];
  const serviceLinks = [
    "Contact Us",
    "Help & FAQs",
    "Shipping & Returns",
    "Track your Order",
  ];

  return (
    <footer className="relative mt-32">
      {/* Arch SVG */}
      <div className="absolute bottom-full left-0 w-full text-muted">
        <svg
          className="w-full h-auto"
          viewBox="0 0 1440 120"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M1440,120H0V0C480,100,960,100,1440,0V120Z"></path>
        </svg>
      </div>

      <div className="bg-muted text-foreground pt-12 pb-8">
        <Container>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-2 font-heading text-accent">
              Caelvi
            </h3>
            <p className="text-muted-foreground text-sm">
              Exquisite Jewellery for Every Occasion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <FooterLinkGroup title="Shop" links={shopLinks} />
            <FooterLinkGroup title="About Caelvi" links={aboutLinks} />
            <FooterLinkGroup title="Customer Service" links={serviceLinks} />
          </div>

          <div className="max-w-xl mx-auto mb-12 text-center">
            <h4 className="font-heading font-semibold text-accent mb-2">
              Join Our Newsletter
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Get exclusive updates, new arrivals, and insider-only discounts.
            </p>
            <form className="flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-background/50 border border-border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-foreground w-full text-sm"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 rounded-r-md px-4 py-2 font-semibold text-primary-foreground text-sm transition-colors whitespace-nowrap"
              >
                Sign Up
              </button>
            </form>
          </div>

          <div className=" mt-12 pt-8">
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-8">
              <div className="flex gap-6 items-center text-accent text-xl">
                <a href="#" className="hover:text-primary transition-colors">
                  <FaInstagram />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <FaXTwitter />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <FaFacebookF />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <FaYoutube />
                </a>
              </div>
              <div className="flex items-center gap-4 text-accent">
                <Visa />
                <Mastercard />
                <Paypal />
                <Maestro />
              </div>
            </div>
          </div>
        </Container>
        <div className="mt-8 pt-6 border-t  text-center">
          <p className="text-xs text-muted-foreground/80">
            © {new Date().getFullYear()} Caelvi. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
