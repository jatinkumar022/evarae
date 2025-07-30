"use client";
import React from "react";

const PromiseIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-accent mb-4">
    {children}
  </div>
);

const CustomGemIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
    <path d="M12 22V9" />
    <path d="M2 9h20" />
  </svg>
);

const CustomLeafIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22c-3-3-4-4-4-9a4 4 0 014-4h0a4 4 0 014 4c0 5-1 6-4 9z" />
    <path d="M12 22V13" />
    <path d="M8 9a4 4 0 00-4 4" />
    <path d="M16 9a4 4 0 014 4" />
  </svg>
);
const CustomBadgeCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const promises = [
  {
    icon: <CustomGemIcon />,
    title: "Exquisite Craftsmanship",
    description: "Every piece is meticulously crafted by master artisans.",
  },
  {
    icon: <CustomLeafIcon />,
    title: "Ethical Sourcing",
    description: "We are committed to using responsibly sourced materials.",
  },
  {
    icon: <CustomBadgeCheckIcon />,
    title: "Certified Authenticity",
    description: "Each creation comes with a certificate of authenticity.",
  },
];

export default function OurPromise() {
  return (
    <section className="pb-16">
      <div className="heading-component-main-container mt-0 mb-12">
        <h1 className="heading-component-main-heading">The Caelvi Promise</h1>
        <h2 className="heading-component-main-subheading">
          Our commitment to quality, ethics, and you.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {promises.map((promise, index) => (
          <div key={index} className="flex flex-col items-center">
            <PromiseIcon>{promise.icon}</PromiseIcon>
            <h3 className="font-heading text-xl font-semibold text-accent">
              {promise.title}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">
              {promise.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
