'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Footer() {
  const [language, setLanguage] = useState('en');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const linkClasses = 'hover:text-netflix-red transition duration-300';

  return (
    <footer className="bg-netflix-black border-t border-netflix-card-bg py-12 px-4 md:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Logo / Branding */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bebas font-bold text-netflix-red">
            OfferLoom
          </h2>
          <p className="text-gray-500 text-sm mt-1">Your Netflix-inspired streaming experience</p>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8"
        >
          {/* Company Section */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bebas font-bold text-white mb-4 text-lg">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className={`text-sm text-gray-400 ${linkClasses}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#careers" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#press" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Press
                </Link>
              </li>
              <li>
                <Link href="#blog" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Blog
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Support Section */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bebas font-bold text-white mb-4 text-lg">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#help" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#contact" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#faq" className={`text-sm text-gray-400 ${linkClasses}`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#status" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Service Status
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal Section */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bebas font-bold text-white mb-4 text-lg">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#terms" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="#privacy" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#cookies" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Cookie Preferences
                </Link>
              </li>
              <li>
                <Link href="#compliance" className={`text-sm text-gray-400 ${linkClasses}`}>
                  Compliance
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Language Selector */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bebas font-bold text-white mb-4 text-lg">Language</h4>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-netflix-card-bg text-white p-2 rounded border border-gray-600 focus:outline-none focus:border-netflix-red transition text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </motion.div>
        </motion.div>

        {/* Social Links */}
        <motion.div variants={itemVariants} className="flex gap-6 justify-center md:justify-start mb-8">
          <a
            href="#facebook"
            className="text-gray-500 hover:text-netflix-red transition"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="#twitter"
            className="text-gray-500 hover:text-netflix-red transition"
            aria-label="Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7-2.25 1.5-5.5 2.75-5.5 2.75" />
            </svg>
          </a>
          <a
            href="#instagram"
            className="text-gray-500 hover:text-netflix-red transition"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 11.37A4 4 0 1112.63 8A4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
          <a
            href="#youtube"
            className="text-gray-500 hover:text-netflix-red transition"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="h-px bg-netflix-card-bg mb-8" />

        {/* Bottom Section */}
        <motion.div variants={itemVariants} className="text-center md:text-left">
          <p className="text-gray-500 text-xs">
            © 2024 OfferLoom. All rights reserved. Netflix Clone for demonstration purposes only.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Powered by TMDB API • Built with Next.js 14 & Tailwind CSS
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}

