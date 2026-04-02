import { Suspense } from 'react';
import HeroBanner from '@/components/HeroBanner';
import MovieRow from '@/components/MovieRow';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { getTrending, getPopular, getTopRated, getNowPlaying, getGenreMovies, genreIds } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [trending, popular, topRated, nowPlaying, action, comedy, horror, scifi] = await Promise.all([
    getTrending(),
    getPopular(),
    getTopRated(),
    getNowPlaying(),
    getGenreMovies(genreIds.ACTION),
    getGenreMovies(genreIds.COMEDY),
    getGenreMovies(genreIds.HORROR),
    getGenreMovies(genreIds.SCIFI),
  ]).catch(() => [[], [], [], [], [], [], [], []]);

  return (
    <div className="min-h-screen bg-netflix-black">
      <Suspense fallback={<LoadingSkeleton />}>
        <HeroBanner featured={trending[0]} />
      </Suspense>

      <div className="space-y-8 px-4 py-8 md:px-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Trending Now" movies={trending} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Popular Movies" movies={popular} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Top Rated" movies={topRated} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Now Playing" movies={nowPlaying} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Action" movies={action} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Comedy" movies={comedy} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Horror" movies={horror} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <MovieRow title="Sci-Fi" movies={scifi} />
        </Suspense>
      </div>
    </div>
  );
}
