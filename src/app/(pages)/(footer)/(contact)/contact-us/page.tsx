'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Container from '@/app/components/layouts/Container';
import { motion } from 'framer-motion';
import { useRef } from 'react';

// You'll need to import your actual images
// import { contactHero } from '@/app/assets/Contact';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
      title: 'Email Us',
      content: 'contact@caelvi.com',
      subtitle: 'We respond within 24 hours',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      title: 'Call Us',
      content: '+91 98765 43210',
      subtitle: 'Mon - Sat, 10AM - 8PM',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: 'Visit Our Atelier',
      content: '123 Jewelry Street, Diamond District',
      subtitle: 'Mumbai, Maharashtra 400001',
    },
  ];

  return (
    <div className="space-y-8">
      {contactDetails.map((detail, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-primary/10">
            <div className="flex items-start space-x-4">
              <div className="text-primary text-sm md:text-base group-hover:scale-110 transition-transform duration-300">
                {detail.icon}
              </div>
              <div className="flex-1">
                <h3 className=" md:text-xl font-fraunces font-medium mb-2 text-primary">
                  {detail.title}
                </h3>
                <p className="text-sm md:text-base text-text-primary font-medium mb-1">
                  {detail.content}
                </p>
                <p className="text-sm md:text-base text-text-primary/70">
                  {detail.subtitle}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Business Hours Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10"
      >
        <h3 className=" text-lg md:text-xl font-fraunces font-medium mb-6 text-primary">
          Visit Our Atelier
        </h3>
        <div className="space-y-3 text-sm md:text-base">
          <div className="flex justify-between flex-col md:flex-row md:items-center text-text-primary/80">
            <span className="font-medium">Monday - Saturday</span>
            <span>10:00 AM - 8:00 PM</span>
          </div>
          <div className="flex justify-between flex-col md:flex-row md:items-center text-text-primary/80">
            <span className="font-medium">Sunday</span>
            <span>11:00 AM - 6:00 PM</span>
          </div>
          <div className="pt-4 mt-4 border-t border-primary/10">
            <p className="text-sm text-text-primary/70 italic">
              &quot;Experience our collections in person and meet our master
              craftsmen&quot;
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-8 shadow-md border border-primary/10"
      >
        <h3 className=" text-lg md:text-xl font-fraunces font-medium mb-6 text-primary">
          Helpful Resources
        </h3>
        <div className="space-y-3">
          {[
            'Size Guide & Measurements',
            'Care & Maintenance',
            'Return & Exchange Policy',
            'Custom Design Services',
            'Frequently Asked Questions',
          ].map((link, index) => (
            <Link
              key={index}
              href="#"
              className="block text-text-primary/80 hover:text-primary  duration-300 text-sm py-1 hover:translate-x-1 transform transition-transform"
            >
              {link} →
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) => {
  const baseClasses =
    'w-full px-3 md:px-5 py-2.5 md:py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm md:text-base duration-300 bg-white text-text-primary placeholder-text-primary/50 shadow-sm hover:shadow-md';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <label className="block text-xs md:text-base font-medium text-primary mb-3 font-heading">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 5}
          className={`${baseClasses} resize-none`}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
          required={required}
        />
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-500 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default function ContactUsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });

      setTimeout(() => setIsSubmitted(false), 5000);
    }, 2000);
  };

  return (
    <div className="bg-white text-text-primary">
      <Container>
        <div className="pt-20 mb-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="heading-component-main-heading mb-10">
              Let&apos;s Start a Conversation
            </h2>
            <p className="text-sm md:text-lg text-text-primary/80 leading-relaxed max-w-2xl mx-auto">
              Every masterpiece begins with a conversation. At
              <span className="font-medium text-primary"> Caelvi</span>, our
              consultants and artisans are here to guide you in discovering or
              creating jewelry that reflects your unique story.
            </p>
          </div>
        </div>
      </Container>

      {/* Main Content Section */}
      <Container>
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl sm:p-8 lg:p-10 sm:shadow-md sm:border border-primary/10"
            >
              <div className="mb-8">
                <h3 className="text-xl md:text-3xl font-fraunces font-medium text-primary mb-4">
                  Send us a Message
                </h3>
                <p className="text-sm md:text-lg text-text-primary/70">
                  Share your vision with us, and let&apos;s bring it to life
                  together.
                </p>
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-green-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-green-800 font-medium">
                        Message sent successfully!
                      </p>
                      <p className="text-green-700 text-sm">
                        We&apos;ll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid  gap-6">
                  <FormField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    required
                  />

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="+91 98765 43210"
                    required
                  />

                  <FormField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={errors.subject}
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <FormField
                  label="Message"
                  name="message"
                  type="textarea"
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                  placeholder="Tell us about your vision, questions, or how we can assist you..."
                  rows={6}
                  required
                />

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white   py-2 md:py-3 px-8 rounded-xl hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-heading tracking-wider"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending Message...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContactInfo />
          </motion.div>
        </div>
      </Container>

      {/* Map Section */}
      <Container>
        <div className="py-20">
          <div className="text-center mb-12">
            <h2 className="heading-component-main-heading mb-5">
              Visit Our Atelier
            </h2>
            <p className="text-sm md:text-lg text-text-primary/80 max-w-3xl mx-auto">
              Experience our collections in person and meet the artisans who
              bring each piece to life.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white rounded-2xl p-5 md:p-8 shadow-md border border-primary/10">
              <div className="w-full h-96 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20">
                <div className="text-center text-text-primary/70 px-3">
                  <div className="w-16 h-16 mx-auto mb-4 text-primary/60">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className=" text-lg md:text-xl font-fraunces font-medium text-primary mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-text-primary/70 text-sm md:text-base">
                    Google Maps integration will be displayed here
                  </p>
                  <div className="mt-4 text-sm text-text-primary/60">
                    123 Jewelry Street, Diamond District
                    <br />
                    Mumbai, Maharashtra 400001
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Bottom Decorative Section */}
      <div className="pb-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center space-x-4 mb-8"
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-400"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-300 to-purple-400"></div>
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-300 to-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-300"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-purple-300"></div>
        </motion.div>
        <p className="text-text-primary/60 font-light italic  text-sm md:text-lg font-fraunces">
          &ldquo;Let&apos;s create something extraordinary together&rdquo;
        </p>
      </div>
    </div>
  );
}
