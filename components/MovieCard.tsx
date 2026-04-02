'use client';

import { Movie } from '@/lib/types';
import Image from 'next/image';
import { motion } from 'framer-motion';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = movie.poster_path ? `${IMAGE_BASE}/w500${movie.poster_path}` : null;
  const title = movie.title || movie.name || 'Unknown';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex-shrink-0 w-32 md:w-48 h-48 md:h-72 rounded overflow-hidden cursor-pointer group relative"
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-netflix-card-bg">
          No Image
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center">
        <p className="text-xs md:text-sm text-center p-2 mb-2">{title}</p>
        <button className="netflix-button text-xs md:text-sm">▶ Play</button>
      </div>

      {/* Rating */}
      <div className="absolute top-2 right-2 bg-netflix-red px-2 py-1 rounded text-xs font-bold">
        {movie.vote_average.toFixed(1)}
      </div>
    </motion.div>
  );
}
