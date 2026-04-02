'use client';

import React, { useRef, useState } from 'react';
import { Movie } from '@/lib/types';
import MovieCard from './MovieCard';
import { motion } from 'framer-motion';

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative px-4 md:px-8"
    >
      <h2 className="text-2xl font-bebas font-bold mb-4 text-white">{title}</h2>

      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition bg-black/50 hover:bg-black/70 p-2 rounded"
          aria-label="Scroll left"
        >
          ◀
        </button>

        {/* Movies Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-scroll scrollbar-hide"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition bg-black/50 hover:bg-black/70 p-2 rounded"
          aria-label="Scroll right"
        >
          ▶
        </button>
      </div>
    </motion.div>
  );
}
