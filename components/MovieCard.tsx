'use client';

import { Movie } from '@/lib/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const posterUrl = movie.poster_path ? `${IMAGE_BASE}/w500${movie.poster_path}` : null;
  const title = movie.title || movie.name || 'Unknown';
  const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0];

  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 10 }}
      className="flex-shrink-0 w-32 md:w-48 h-48 md:h-72 rounded overflow-hidden cursor-pointer group relative shadow-lg"
      onClick={onClick}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-all duration-300"
          onLoadingComplete={() => setIsLoading(false)}
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-netflix-card-bg text-gray-500">
          <span className="text-center px-2">No Image</span>
        </div>
      )}

      {/* Rating Badge */}
      <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold z-5">
        {movie.vote_average.toFixed(1)}
      </div>

      {/* Overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/80 flex flex-col justify-between p-3"
      >
        {/* Title and metadata */}
        <div>
          <p className="text-sm font-bold text-white line-clamp-2 mb-2">{title}</p>
          <div className="flex gap-2 text-xs text-gray-300">
            {releaseYear && <span>{releaseYear}</span>}
            {movie.vote_average > 0 && (
              <span className="flex items-center gap-1">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="netflix-button w-full text-xs py-2 flex items-center justify-center gap-1"
        >
          <span>▶</span> Play
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
