'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is the return policy for this product?',
    answer:
      'We offer a 30-day return policy for unused items in their original packaging. Personalized or custom items are non-returnable.',
  },
  {
    id: '2',
    question: 'Does this come with a warranty?',
    answer:
      'Yes, all our jewellery comes with a lifetime warranty on manufacturing defects. This covers craftsmanship issues, not normal wear and tear.',
  },
  {
    id: '3',
    question: 'Can I get this resized?',
    answer:
      'Yes, we offer free resizing within 30 days of purchase. Rings can be resized up or down by 2 sizes.',
  },
  {
    id: '4',
    question: 'Is this product authentic?',
    answer:
      'Absolutely! All our products are 100% authentic and come with certification for quality and authenticity.',
  },
];

export function ProductFAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="my-5">
      <h2 className="text-xl lg:text-2xl font-heading font-semibold text-primary-dark mb-6">
        Frequently Asked Questions
      </h2>

      <div className="divide-y divide-primary/10">
        {faqData.map(item => {
          const isOpen = openItems.includes(item.id);
          return (
            <div key={item.id} className="py-3 lg:py-4">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-medium text-sm lg:text-base group-hover:text-primary transition-colors">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-primary/10">
        <p className="text-sm text-primary-dark/70">
          Still have questions?{' '}
          <a
            href="/contact"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Contact our customer service
          </a>
        </p>
      </div>
    </div>
  );
}
