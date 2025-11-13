'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/app/(main)/components/layouts/Container';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import emailjs from '@emailjs/browser';
import toastApi from '@/lib/toast';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';

// You'll need to import your actual images
// import { contactHero } from '@/app/(main)/(main)/assets/Contact';

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
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      title: 'Call Us',
      content: '+91 93289 01475',
      subtitle: 'Mon - Sat, 10AM - 8PM',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: 'Visit Our Atelier',
      content: 'Ahmedabad, Gujarat',
      subtitle: 'India',
    },
  ];

  return (
    <div className="space-y-6">
      {contactDetails.map((detail, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-primary/10">
            <div className="flex items-start space-x-3">
              <div className="text-primary text-xs md:text-sm group-hover:scale-110 transition-transform duration-300">
                {detail.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-lg font-fraunces font-medium mb-1.5 text-primary">
                  {detail.title}
                </h3>
                <p className="text-xs md:text-sm text-text-primary font-medium mb-1">
                  {detail.content}
                </p>
                <p className="text-xs md:text-sm text-text-primary/70">
                  {detail.subtitle}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-md border border-primary/10"
      >
        <h3 className="text-sm md:text-lg font-fraunces font-medium mb-4 text-primary">
          Helpful Resources
        </h3>
        <div className="space-y-2">
          <Link
            href="/faqs"
            className="block text-text-primary/80 hover:text-primary  duration-300 text-xs md:text-sm py-0.5 hover:translate-x-1 transform transition-transform"
          >
            Size Guide & Measurements →
          </Link>
          <Link
            href="/faqs"
            className="block text-text-primary/80 hover:text-primary  duration-300 text-xs md:text-sm py-0.5 hover:translate-x-1 transform transition-transform"
          >
            Care & Maintenance →
          </Link>
          <Link
            href="/returns"
            className="block text-text-primary/80 hover:text-primary  duration-300 text-xs md:text-sm py-0.5 hover:translate-x-1 transform transition-transform"
          >
            Return & Exchange Policy →
          </Link>
          <Link
            href="/contact-us"
            className="block text-text-primary/80 hover:text-primary  duration-300 text-xs md:text-sm py-0.5 hover:translate-x-1 transform transition-transform"
          >
            Custom Design Services →
          </Link>
          <Link
            href="/faqs"
            className="block text-text-primary/80 hover:text-primary  duration-300 text-xs md:text-sm py-0.5 hover:translate-x-1 transform transition-transform"
          >
            Frequently Asked Questions →
          </Link>
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
    'w-full px-3 md:px-4 py-2 md:py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm duration-300 bg-white text-text-primary placeholder-text-primary/50 shadow-sm hover:shadow-md';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <label className="block text-xs md:text-sm font-medium text-primary mb-2 font-heading">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 4}
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
          className="mt-1.5 text-xs text-red-500 flex items-center"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
    
    // Real-time validation for specific fields
    let newValue = value;
    
    // Phone number formatting (allow only digits, +, spaces, dashes, parentheses)
    if (name === 'phone') {
      // First, allow only valid characters
      newValue = value.replace(/[^\d\+\s\-\(\)]/g, '');
      
      // Extract country code and phone digits separately
      const hasCountryCode = /^(\+91|91)/.test(newValue);
      let phoneDigits = newValue.replace(/[\s\-\(\)]/g, '');
      
      // Remove country code if present
      if (phoneDigits.startsWith('+91')) {
        phoneDigits = phoneDigits.substring(3);
      } else if (phoneDigits.startsWith('91')) {
        phoneDigits = phoneDigits.substring(2);
      }
      
      // Remove leading zeros
      phoneDigits = phoneDigits.replace(/^0+/, '');
      
      // Limit to 10 digits
      if (phoneDigits.length > 10) {
        phoneDigits = phoneDigits.substring(0, 10);
      }
      
      // Reconstruct with country code if it was present
      if (hasCountryCode && phoneDigits) {
        newValue = `+91 ${phoneDigits}`;
      } else {
        newValue = phoneDigits;
      }
    }
    
    // Name formatting (allow letters, spaces, hyphens, apostrophes)
    if (name === 'name') {
      newValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 254) {
      newErrors.email = 'Email address is too long';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove spaces, dashes, and parentheses for validation
      let cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      
      // Remove country code if present
      if (cleanPhone.startsWith('+91')) {
        cleanPhone = cleanPhone.substring(3);
      } else if (cleanPhone.startsWith('91')) {
        cleanPhone = cleanPhone.substring(2);
      }
      
      // Remove leading zeros
      cleanPhone = cleanPhone.replace(/^0+/, '');
      
      // Must be exactly 10 digits starting with 6-9
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initialize EmailJS on mount
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toastApi.error('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    // Debug: Log environment variables (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('EmailJS Config Check:', {
        serviceId: serviceId ? `${serviceId.substring(0, 10)}...` : 'MISSING',
        templateId: templateId ? `${templateId.substring(0, 10)}...` : 'MISSING',
        publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING',
      });
    }

    if (!serviceId || !templateId || !publicKey) {
      const missing = [];
      if (!serviceId) missing.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID');
      if (!templateId) missing.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID');
      if (!publicKey) missing.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');
      
      toastApi.error(
        'Configuration Error',
        `Missing environment variables: ${missing.join(', ')}. Please check your .env.local file.`
      );
      console.error('Missing EmailJS environment variables:', missing);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        dateStyle: 'medium',
      });
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeStyle: 'short',
      });

      // Prepare template parameters - match exactly with EmailJS template variables
      const templateParams = {
        name: formData.name.trim() || 'Unknown',
        email: formData.email.trim() || '',
        phone: formData.phone.trim() || '',
        title: formData.subject.trim() || 'No Subject',
        message: formData.message.trim() || '',
        time: `${dateStr} at ${timeStr}`, // Combined time for message display
        date: dateStr, // Separate date for footer
      };

      // Debug: Log what we're sending (remove in production if needed)
      if (process.env.NODE_ENV !== 'production') {
        console.log('EmailJS Template Params:', templateParams);
      }

      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      // Debug: Log response
      if (process.env.NODE_ENV !== 'production') {
        console.log('EmailJS Response:', response);
      }

      // Success
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      toastApi.success(
        'Message Sent Successfully!',
        'We will get back to you within 24 hours.'
      );

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error: unknown) {
      console.error('EmailJS Error:', error);
      setIsSubmitting(false);
      
      // Provide more specific error messages
      let errorMessage = 'Please try again later or contact us directly at contact@caelvi.com';
      
      const emailError =
        typeof error === 'object' && error !== null
          ? (error as { status?: number; text?: string })
          : {};

      if (emailError?.status === 400) {
        if (emailError?.text?.includes('service ID')) {
          errorMessage = 'Service ID not found. Please check your EmailJS configuration in .env.local file.';
        } else if (emailError?.text?.includes('template')) {
          errorMessage = 'Template ID not found. Please check your EmailJS configuration.';
        } else {
          errorMessage = 'Invalid EmailJS configuration. Please verify your service and template IDs.';
        }
      } else if (emailError?.status === 403) {
        errorMessage = 'EmailJS access denied. Please check your public key.';
      } else if (emailError?.status === 500) {
        errorMessage = 'EmailJS server error. Please try again later.';
      }
      
      toastApi.error('Failed to Send Message', errorMessage);
    }
  };

  return (
    <div className="bg-white text-text-primary">
      <Container>
        <div className="pt-16 mb-8">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <h2 className="heading-component-main-heading mb-6">
              Let&apos;s Start a Conversation
            </h2>
            <p className="text-sm md:text-base text-text-primary/80 leading-relaxed max-w-2xl mx-auto">
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
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl sm:p-6 lg:p-8 sm:shadow-md sm:border border-primary/10"
            >
              <div className="mb-6">
                <h3 className="text-lg md:text-2xl font-fraunces font-medium text-primary mb-3">
                  Send us a Message
                </h3>
                <p className="text-sm md:text-base text-text-primary/70">
                  Share your vision with us, and let&apos;s bring it to life
                  together.
                </p>
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-2"
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
                      <p className="text-green-800 font-medium text-sm">
                        Message sent successfully!
                      </p>
                      <p className="text-green-700 text-xs">
                        We&apos;ll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid  gap-4">
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

                <div className="grid md:grid-cols-2 gap-4">
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
                  rows={5}
                  required
                />

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 md:py-2.5 px-6 rounded-xl hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-heading tracking-wider flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="h-4 w-4 text-white" />
                      <span>Sending Message...</span>
                    </>
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
        <div className="py-16">
          <div className="text-center mb-8">
            <h2 className="heading-component-main-heading mb-4">
              Visit Our Atelier
            </h2>
            <p className="text-sm md:text-base text-text-primary/80 max-w-3xl mx-auto">
              Experience our collections in person at our Ahmedabad location and meet the artisans who
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
            <div className="relative bg-white rounded-2xl p-4 md:p-6 shadow-md border border-primary/10 overflow-hidden">
              <div className="w-full h-80 rounded-xl overflow-hidden relative group">
                <Image
                  src="/images/ahmedabad-map.jpg"
                  alt="Ahmedabad Map - Caelvi Location"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white">
                    <h3 className="text-sm md:text-base font-fraunces font-medium mb-1">
                      Our Location
                    </h3>
                    <p className="text-xs md:text-sm mb-2 opacity-90">
                      Ahmedabad, Gujarat, India
                    </p>
                    <a
                      href="https://www.google.com/maps/search/Ahmedabad,+Gujarat,+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium hover:underline transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Bottom Decorative Section */}
      <div className="pb-16 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center space-x-3 mb-6"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-pink-300 to-rose-400"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-300 to-purple-400"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-300 to-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-300"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-400 to-purple-300"></div>
        </motion.div>
        <p className="text-text-primary/60 font-light italic text-xs md:text-base font-fraunces">
          &ldquo;Let&apos;s create something extraordinary together&rdquo;
        </p>
      </div>
    </div>
  );
}
