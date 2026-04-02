'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Movie } from '@/lib/types';
import { searchMulti } from '@/lib/tmdb';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface SearchBarProps {
  onSelectMovie?: (movie: Movie) => void;
}

export default function SearchBar({ onSelectMovie }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchMulti(searchQuery);
      // Filter for movies and TV shows with poster paths
      const filtered = data
        .filter((item) => (item.poster_path || item.backdrop_path) && (item.title || item.name))
        .slice(0, 12);
      setResults(filtered);
      setIsOpen(true);
    } catch (err) {
      setError('Failed to search. Please try again.');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search (300ms)
    debounceTimer.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSelectMovie = (movie: Movie) => {
    onSelectMovie?.(movie);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder="Search movies, shows..."
          className="w-full px-4 py-2 pr-10 bg-netflix-card-bg text-white placeholder-gray-500 rounded border border-gray-600 focus:outline-none focus:border-netflix-red transition"
        />

        {/* Search Icon */}
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-netflix-red border-t-transparent rounded-full"
          />
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-netflix-red text-sm mt-2"
        >
          {error}
        </motion.p>
      )}

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-netflix-black border border-netflix-card-bg rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                {results.map((movie) => {
                  const posterUrl = movie.poster_path
                    ? `${IMAGE_BASE}/w154${movie.poster_path}`
                    : movie.backdrop_path
                    ? `${IMAGE_BASE}/w300${movie.backdrop_path}`
                    : null;
                  const title = movie.title || movie.name || 'Unknown';

                  return (
                    <motion.button
                      key={movie.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectMovie(movie)}
                      className="group relative overflow-hidden rounded h-24 bg-netflix-card-bg hover:ring-2 hover:ring-netflix-red transition text-left"
                    >
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-500 text-xs px-2">
                            {title}
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-xl">▶</span>
                      </div>

                      {/* Title on image */}
                      {posterUrl && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                          <p className="text-xs text-white line-clamp-1">{title}</p>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {query ? 'No results found' : 'Start typing to search...'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
