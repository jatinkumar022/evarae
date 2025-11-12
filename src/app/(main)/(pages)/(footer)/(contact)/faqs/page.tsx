'use client';
import { useState } from 'react';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { AnimatePresence, motion } from 'framer-motion';
type FAQCategory =
  | 'Orders & Shipping'
  | 'Returns & Exchanges'
  | 'Jewellery Care'
  | 'Sizing & Fit'
  | 'Products & Materials'
  | 'Account & Orders';

interface FAQItem {
  q: string;
  a: string;
}

const faqData: Record<FAQCategory, FAQItem[]> = {
  'Orders & Shipping': [
    {
      q: 'How long does shipping take?',
      a: 'We offer multiple shipping options to suit your needs. Standard delivery takes 5-7 business days across India, while express delivery is available in 2-3 business days for major cities. International shipping typically takes 7-14 business days depending on your location.',
    },
    {
      q: 'Do you offer international shipping?',
      a: 'Yes, we ship worldwide! International shipping is available to over 25 countries with additional customs and shipping charges. Delivery times vary by destination, and all international orders are fully insured and trackable.',
    },
    {
      q: 'What are the shipping charges?',
      a: 'We offer free shipping on orders above ₹2,999 within India. For orders below this amount, standard shipping charges of ₹149 apply. Express shipping is available for ₹299. International shipping charges are calculated at checkout based on destination and weight.',
    },
    {
      q: 'Can I track my order?',
      a: "Absolutely! Once your order is dispatched, you'll receive a tracking number via SMS and email. You can track your order in real-time through our website or the courier partner's portal.",
    },
    {
      q: 'Do you offer same-day delivery?',
      a: 'Same-day delivery is available in select metro cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad) for orders placed before 12 PM. This service is available for an additional charge of ₹499.',
    },
  ],
  'Returns & Exchanges': [
    {
      q: 'What is your return policy?',
      a: 'We accept returns within 7 days of delivery for unworn items in original condition with tags and packaging intact. Items must be accompanied by the original invoice. Custom or personalized pieces are not eligible for return.',
    },
    {
      q: 'Can I exchange my jewellery?',
      a: "Yes, exchanges are available within 7 days for size adjustments or style changes. The exchange item must be of equal or higher value. If the new item costs less, we'll refund the difference. Exchange shipping is free for the first exchange.",
    },
    {
      q: 'How do I initiate a return or exchange?',
      a: "Simply contact our customer care team or raise a return request through your account on our website. We'll arrange a free pickup from your address and process your return within 3-5 business days of receiving the item.",
    },
    {
      q: 'What if my item arrives damaged?',
      a: "We take great care in packaging, but if your item arrives damaged, please contact us within 24 hours with photos. We'll immediately arrange a replacement or full refund, and our quality team will investigate to prevent future issues.",
    },
    {
      q: "Are there any items that can't be returned?",
      a: 'Personalized or custom-made pieces, pierced earrings (for hygiene reasons), and items damaged due to wear or misuse cannot be returned. Gift vouchers and digital products are also non-returnable.',
    },
  ],
  'Jewellery Care': [
    {
      q: 'How do I care for my Caelvi jewellery?',
      a: 'To maintain the brilliance of your pieces: store them in individual pouches, avoid contact with perfumes and lotions, clean gently with a soft cloth, and remove before swimming or exercising. We provide detailed care instructions with each purchase.',
    },
    {
      q: 'How should I store my jewellery?',
      a: 'Store each piece separately in our provided anti-tarnish pouches or a lined jewelry box. Keep them away from moisture, direct sunlight, and extreme temperatures. For long-term storage, use silica gel packets to absorb moisture.',
    },
    {
      q: 'Can I wear my jewellery while swimming or showering?',
      a: 'We recommend removing your jewelry before swimming, showering, or exercising. Chlorine, saltwater, and soaps can damage the finish and cause tarnishing, especially with gold-plated or silver items.',
    },
    {
      q: 'How do I clean tarnished silver jewellery?',
      a: 'For silver pieces, use a silver polishing cloth or a mild silver cleaner. Gently rub in straight lines, not circles. For intricate designs, use a soft-bristled toothbrush. Avoid harsh chemicals or abrasive materials that can scratch the surface.',
    },
    {
      q: 'What if my jewellery loses its shine?',
      a: 'Natural wear can cause some dulling over time. We offer professional cleaning and polishing services at our stores. Many pieces can be restored to their original brilliance. Contact us for advice on specific care for your items.',
    },
  ],
  'Sizing & Fit': [
    {
      q: 'How do I find my ring size?',
      a: "Use our online ring sizer guide or visit any of our stores for professional sizing. You can also measure an existing ring's inner diameter. We offer free resizing within 30 days of purchase for rings that are adjustable.",
    },
    {
      q: "What if my bracelet doesn't fit?",
      a: 'Our bracelets come in standard sizes, but many are adjustable. If you need a different size, contact us within 7 days for an exchange. We also offer custom sizing for select designs at no additional cost.',
    },
    {
      q: 'Can necklace lengths be adjusted?',
      a: 'Many of our necklaces come with adjustable chains. For fixed-length pieces, we can modify the length at our atelier. Custom length adjustments may take 3-5 business days and could involve additional charges depending on the complexity.',
    },
    {
      q: 'Do you offer custom sizing?',
      a: 'Yes! We provide custom sizing for most of our pieces. Our master craftsmen can adjust rings, bracelets, and necklaces to your exact measurements. Custom sizing typically takes 5-7 business days.',
    },
  ],
  'Products & Materials': [
    {
      q: 'What materials do you use?',
      a: 'We use a variety of high-quality materials including sterling silver, gold-plated brass, semi-precious stones, crystals, and premium alloys. Each product page details the specific materials used. All materials are hypoallergenic and skin-safe.',
    },
    {
      q: 'Are your products hypoallergenic?',
      a: 'Yes, all Caelvi jewelry is designed to be hypoallergenic. We use nickel-free materials and hypoallergenic plating to ensure comfort for sensitive skin. If you have specific allergies, please check the product description or contact us for material details.',
    },
    {
      q: 'Do you use real gemstones?',
      a: 'We use a mix of genuine semi-precious stones, crystals, and high-quality synthetic alternatives. Each product clearly specifies the type of stones used. Our genuine stone pieces are ethically sourced and certified.',
    },
    {
      q: 'What is the difference between gold-plated and gold-filled?',
      a: 'Gold-plated items have a thin layer of gold over a base metal, while gold-filled contains a much thicker layer of gold. Gold-filled jewelry lasts longer and is more durable. We clearly specify the type of gold finish on each product.',
    },
    {
      q: 'Are your diamonds real?',
      a: 'Our diamond collection features both genuine diamonds and high-quality diamond alternatives like cubic zirconia. Each product specifies the type used. All genuine diamonds come with certification and are ethically sourced.',
    },
  ],
  'Account & Orders': [
    {
      q: 'How do I create an account?',
      a: "Creating an account is easy! Click 'Sign Up' on our website, provide your email and create a password. You'll receive a welcome email with exclusive offers. Having an account lets you track orders, save favorites, and enjoy faster checkout.",
    },
    {
      q: 'Can I modify or cancel my order?',
      a: "Orders can be modified or cancelled within 2 hours of placement, before they enter production. After this window, modifications aren't possible, but you can return or exchange items once received according to our return policy.",
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, UPI payments, net banking, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery for orders below ₹5,000. All transactions are secured with 256-bit SSL encryption.',
    },
    {
      q: 'Is it safe to shop online with Caelvi?',
      a: "Absolutely! We use industry-standard security measures to protect your data. Our website is SSL certified, we don't store payment information, and all transactions are processed through secure payment gateways. Your privacy and security are our top priorities.",
    },
    {
      q: 'Can I save items for later?',
      a: "Yes! Add items to your wishlist to save them for later. You can access your wishlist anytime from your account. We'll also notify you of price drops or limited-time offers on your saved items.",
    },
  ],
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] =
    useState<FAQCategory>('Orders & Shipping');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Container>
      {/* Hero */}
      <div className="py-20 text-center">
        <h1 className="heading-component-main-heading mb-4">Help & FAQs</h1>
        <p className="text-text-primary/80 max-w-2xl mx-auto">
          Find answers to common questions about Caelvi jewellery, shipping, and
          care.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {(Object.keys(faqData) as FAQCategory[]).map(category => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
      ${
        activeCategory === category
          ? 'bg-primary text-white'
          : 'bg-primary/10 text-primary'
      }
    `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqData[activeCategory].map((item, index) => (
          <motion.div
            key={index}
            className="bg-white border border-primary/10 rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <span className="font-medium text-primary">{item.q}</span>
              <span className="text-xl leading-none">
                {openIndex === index ? '–' : '+'}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="p-4 pt-0 text-text-primary/80 text-sm leading-relaxed">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Help CTA */}
      <div className="text-center mt-20">
        <h3 className="text-lg font-medium mb-3">Still need help?</h3>
        <p className="text-text-primary/70 mb-6">
          Reach out to our support team for personalized assistance.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/contact-us"
            className="px-6 py-2 bg-primary text-white rounded-full shadow-md"
          >
            Contact Us
          </Link>
          <Link
            href="/track"
            className="px-6 py-2 bg-primary/10 text-primary rounded-full"
          >
            Track Order
          </Link>
        </div>
      </div>
    </Container>
  );
}
