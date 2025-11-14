'use client';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { motion } from 'framer-motion';
import { Truck, RefreshCw, Globe2, ShieldCheck } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <Container>
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="heading-component-main-heading mb-4">
          Shipping & Returns
        </h1>
        <p className="text-text-primary/80 max-w-2xl mx-auto">
          Learn about our shipping options, delivery timelines, and hassle-free
          return policy designed to make your Caelvi experience smooth and
          reliable.
        </p>
      </section>

      {/* Highlights */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
        {[
          {
            icon: <Truck className="w-8 h-8 text-primary" />,
            title: 'Fast Delivery',
            desc: 'Orders dispatched within 24–48 hours across India.',
          },
          {
            icon: <Globe2 className="w-8 h-8 text-primary" />,
            title: 'Worldwide Shipping',
            desc: 'Trusted partners for international deliveries.',
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: 'Secure Packaging',
            desc: 'Luxury, tamper-proof packaging for every order.',
          },
          {
            icon: <RefreshCw className="w-8 h-8 text-primary" />,
            title: 'Easy Returns',
            desc: '7-day return & exchange policy for peace of mind.',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-center bg-white shadow-sm rounded-2xl p-6 border border-primary/10"
          >
            <div className="mb-4 flex justify-center">{item.icon}</div>
            <h3 className="font-medium text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-text-primary/70">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Shipping Policy */}
      <section className="py-16 border-t border-primary/10">
        <h2 className="text-2xl font-medium mb-6 text-center">
          Shipping Policy
        </h2>
        <div className="max-w-3xl mx-auto space-y-6 text-text-primary/80 leading-relaxed">
          <p>
            At Caelvi, we aim to deliver your jewellery as swiftly and securely
            as possible. All domestic orders are shipped via trusted courier
            partners with end-to-end tracking.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Orders processed within{' '}
              <span className="font-medium">24–48 hours</span>.
            </li>
            <li>
              Delivery timelines:{' '}
              <span className="font-medium">5–7 business days</span> (India).
            </li>
            <li>
              International orders:{' '}
              <span className="font-medium">7–15 business days</span>.
            </li>
            <li>Free shipping on prepaid orders above ₹1999.</li>
          </ul>
        </div>
      </section>

      {/* Returns & Exchanges */}
      <section className="py-16 border-t border-primary/10">
        <h2 className="text-2xl font-medium mb-6 text-center">
          Returns & Exchanges
        </h2>
        <div className="max-w-3xl mx-auto space-y-6 text-text-primary/80 leading-relaxed">
          <p>
            We want you to love your Caelvi jewellery. If you’re not satisfied,
            you may return or exchange within{' '}
            <span className="font-medium">7 days of delivery</span>.
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Items must be unused and in original packaging.</li>
            <li>
              Refunds processed within{' '}
              <span className="font-medium">7–10 working days</span>.
            </li>
            <li>Exchanges allowed for sizing or product defects.</li>
            <li>Return shipping charges may apply for international orders.</li>
          </ol>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-primary/10">
        <h2 className="text-2xl font-medium mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: 'Can I track my order?',
              a: 'Yes, once your order is shipped you’ll receive an email/SMS with a tracking link.',
            },
            {
              q: 'Do you accept Cash on Delivery (COD)?',
              a: 'Yes, COD is available across major Indian cities with a small handling fee.',
            },
            {
              q: 'Are returns free?',
              a: 'Yes, returns within India are free. For international orders, return shipping costs may apply.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white border border-primary/10 rounded-xl shadow-sm p-6"
            >
              <h3 className="font-medium text-primary mb-2">{item.q}</h3>
              <p className="text-sm text-text-primary/80">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 border-t border-primary/10">
        <h3 className="text-xl font-medium mb-3">Still need assistance?</h3>
        <p className="text-text-primary/70 mb-6">
          Our support team is here to help with shipping or return queries.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/contact-us"
            className="px-6 py-2 bg-primary text-white rounded-full shadow-md"
          >
            Contact Us
          </Link>
         
        </div>
      </section>
    </Container>
  );
}
