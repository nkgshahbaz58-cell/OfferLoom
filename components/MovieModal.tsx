'use client';

import { Movie, Cast, Video } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface MovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  cast?: Cast[];
  videos?: Video[];
  similarMovies?: Movie[];
}

export default function MovieModal({
  movie,
  isOpen,
  onClose,
  cast = [],
  videos = [],
  similarMovies = [],
}: MovieModalProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    // Find trailer video
    const trailer = videos.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );
    setTrailerKey(trailer?.key || null);
  }, [videos]);

  const backdropUrl = movie.backdrop_path
    ? `${IMAGE_BASE}/w1280${movie.backdrop_path}`
    : null;
  const title = movie.title || movie.name || 'Unknown';
  const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 md:py-0 max-h-screen overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-netflix-black rounded-lg overflow-hidden max-w-4xl w-full max-h-screen overflow-y-auto"
            >
              {/* Backdrop Image or Trailer */}
              <div className="relative w-full aspect-video bg-black">
                {trailerKey ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                    title={title}
                    allowFullScreen
                    allow="autoplay"
                  />
                ) : backdropUrl ? (
                  <Image
                    src={backdropUrl}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-netflix-card-bg">
                    <p className="text-gray-500">No Image Available</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 rounded-full p-2 z-10"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 md:p-8 space-y-6"
              >
                {/* Title and Meta */}
                <div>
                  <h2 className="text-3xl md:text-5xl font-bebas font-bold text-white mb-2">
                    {title}
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-300">
                    {releaseYear && <span>{releaseYear}</span>}
                    {movie.vote_average > 0 && (
                      <span className="flex items-center gap-1">
                        ⭐ {movie.vote_average.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="netflix-button flex items-center gap-2"
                  >
                    <span>▶</span> Play
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="netflix-button-secondary"
                  >
                    + My List
                  </motion.button>
                </div>

                {/* Synopsis */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Cast */}
                {cast.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Cast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {cast.slice(0, 5).map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                          className="text-center"
                        >
                          <div className="relative w-full aspect-square mb-2 rounded overflow-hidden bg-netflix-card-bg">
                            {member.profile_path ? (
                              <Image
                                src={`${IMAGE_BASE}/w185${member.profile_path}`}
                                alt={member.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white line-clamp-1">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {member.character}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Movies */}
                {similarMovies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Similar Titles</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {similarMovies.slice(0, 8).map((movie) => {
                        const posterUrl = movie.poster_path
                          ? `${IMAGE_BASE}/w200${movie.poster_path}`
                          : null;
                        return (
                          <motion.div
                            key={movie.id}
                            whileHover={{ scale: 1.05 }}
                            className="flex-shrink-0 w-24 md:w-32 h-36 md:h-48 rounded overflow-hidden cursor-pointer relative group"
                          >
                            {posterUrl ? (
                              <Image
                                src={posterUrl}
                                alt={movie.title || movie.name || 'Movie Poster'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-netflix-card-bg">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-white">▶</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
