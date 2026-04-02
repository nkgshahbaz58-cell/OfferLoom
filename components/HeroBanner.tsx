'use client';

import { Movie } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface HeroBannerProps {
  featured: Movie;
  onPlayClick?: () => void;
  onMoreInfoClick?: () => void;
}

export default function HeroBanner({
  featured,
  onPlayClick,
  onMoreInfoClick
}: HeroBannerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const backdropUrl = featured.backdrop_path ? `${IMAGE_BASE}/original${featured.backdrop_path}` : null;
  const title = featured.title || featured.name || 'Featured';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-96 md:h-screen w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Gradient Overlay */}
      <div className="netflix-overlay absolute inset-0" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute bottom-20 left-4 md:left-8 md:bottom-32 space-y-4 max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bebas font-bold text-white leading-tight drop-shadow-lg">
          {title}
        </h1>

        <p className="text-sm md:text-base text-gray-200 line-clamp-3 drop-shadow-md max-w-xl">
          {featured.overview}
        </p>

        {/* Rating and Release Year */}
        <div className="flex gap-4 text-sm text-gray-300">
          {featured.vote_average > 0 && (
            <span className="flex items-center gap-1">
              ⭐ {featured.vote_average.toFixed(1)}/10
            </span>
          )}
          {featured.release_date && (
            <span>{featured.release_date.split('-')[0]}</span>
          )}
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayClick}
            className="netflix-button flex items-center gap-2 text-sm md:text-base"
          >
            <span>▶</span> Play
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMoreInfoClick}
            className="netflix-button-secondary text-sm md:text-base"
          >
            More Info
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
