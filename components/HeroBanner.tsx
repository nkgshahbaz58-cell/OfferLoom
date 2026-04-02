'use client';

import { Movie } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function HeroBanner({ featured }: { featured: Movie }) {
  const backdropUrl = featured.backdrop_path ? `${IMAGE_BASE}/original${featured.backdrop_path}` : null;
  const title = featured.title || featured.name || 'Featured';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-96 md:h-screen w-full overflow-hidden"
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

      {/* Overlay */}
      <div className="netflix-overlay absolute inset-0" />

      {/* Content */}
      <div className="absolute bottom-20 left-4 md:left-8 md:bottom-32 space-y-4 max-w-md">
        <h1 className="text-4xl md:text-6xl font-bebas font-bold text-white">
          {title}
        </h1>
        <p className="text-sm md:text-base text-gray-300 line-clamp-3">
          {featured.overview}
        </p>

        <div className="flex gap-4">
          <button className="netflix-button flex items-center gap-2">
            ▶ Play
          </button>
          <button className="netflix-button-secondary">More Info</button>
        </div>
      </div>
    </motion.div>
  );
}
