'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    service: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you for your message! We'll get back to you soon.");
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        service: 'general',
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Our Atelier',
      details: ['47 Linking Road, Bandra West', 'Ahmedabad, Gujarat 380001'],
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+91 1800 CAELVI', '+91 79 4567 8900'],
    },
    {
      icon: '📧',
      title: 'Email',
      details: ['hello@caelvi.com', 'support@caelvi.com'],
    },
    {
      icon: '🕐',
      title: 'Store Hours',
      details: ['Mon - Sat: 10 AM - 8 PM', 'Sun: 11 AM - 7 PM'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-rose-50">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="heading-component-main-heading mb-6">
            Connect With Us
          </h1>
          <p className="text-text-primary/80 max-w-xl mx-auto leading-relaxed">
            Begin your personalized jewelry journey with our expert artisans
          </p>
        </motion.div>
      </section>

      {/* Info + Form */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Get In Touch
            </h2>
            <p className="text-text-primary/70 leading-relaxed mb-8">
              Whether you’re seeking the perfect engagement ring or a bespoke
              masterpiece, our team is here to guide you every step of the way.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white shadow-sm border border-primary/10 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <h3 className="font-semibold text-text-primary mb-2">
                    {info.title}
                  </h3>
                  {info.details.map((detail, idx) => (
                    <p
                      key={idx}
                      className="text-text-primary/70 text-sm leading-snug"
                    >
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-primary/10 space-y-6"
          >
            <h3 className="text-xl font-semibold text-text-primary">
              Send Us a Message
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name *"
                className="input-component"
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone (Optional)"
                className="input-component"
              />
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your Email *"
              className="input-component"
              required
            />

            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              className="input-component"
            >
              <option value="general">General Inquiry</option>
              <option value="custom">Custom Design</option>
              <option value="engagement">Engagement Rings</option>
              <option value="repair">Repair Services</option>
              <option value="consultation">Personal Consultation</option>
            </select>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your jewelry dreams..."
              rows={4}
              className="input-component resize-none"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-component w-full"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Map */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold text-text-primary mb-3">
              Visit Our Atelier
            </h2>
            <p className="text-text-primary/70 max-w-xl mx-auto">
              Experience our collections in person at our Ahmedabad showroom.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative rounded-2xl overflow-hidden shadow-lg border border-primary/10"
          >
            <div className="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!..."
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-md border border-primary/10 text-sm">
              <h3 className="font-semibold text-text-primary mb-2">
                Caelvi Atelier Ahmedabad
              </h3>
              <p className="text-text-primary/70">
                📍 47 Linking Road, Ahmedabad
              </p>
              <p className="text-text-primary/70">📞 +91 79 4567 8900</p>
              <p className="text-text-primary/70">🕐 Mon-Sat: 10 AM - 8 PM</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
