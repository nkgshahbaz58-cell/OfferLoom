'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        isScrolled ? 'bg-black' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bebas font-bold text-netflix-red">
          NETFLIX
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-netflix-red transition">
            Home
          </Link>
          <Link href="#" className="hover:text-netflix-red transition">
            Trending
          </Link>
          <Link href="#" className="hover:text-netflix-red transition">
            Popular
          </Link>
        </div>

        {/* Search & Menu */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-white transition">
            🔍
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black px-4 py-4 space-y-2">
          <Link href="/" className="block py-2 hover:text-netflix-red">
            Home
          </Link>
          <Link href="#" className="block py-2 hover:text-netflix-red">
            Trending
          </Link>
          <Link href="#" className="block py-2 hover:text-netflix-red">
            Popular
          </Link>
        </div>
      )}
    </nav>
  );
}
