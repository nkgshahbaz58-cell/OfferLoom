import { Movie, MovieDetails, Genre } from './types';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function fetchTMDB(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY || '');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value.toString());
  });

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('TMDB fetch error:', error);
    return null;
  }
}

export async function getTrending(): Promise<Movie[]> {
  const data = await fetchTMDB('/trending/all/week', { language: 'en-US' });
  return data?.results || [];
}

export async function getPopular(): Promise<Movie[]> {
  const data = await fetchTMDB('/movie/popular', { language: 'en-US' });
  return data?.results || [];
}

export async function getTopRated(): Promise<Movie[]> {
  const data = await fetchTMDB('/movie/top_rated', { language: 'en-US' });
  return data?.results || [];
}

export async function getNowPlaying(): Promise<Movie[]> {
  const data = await fetchTMDB('/movie/now_playing', { language: 'en-US' });
  return data?.results || [];
}

export async function getUpcoming(): Promise<Movie[]> {
  const data = await fetchTMDB('/movie/upcoming', { language: 'en-US' });
  return data?.results || [];
}

export async function getGenreMovies(genreId: number): Promise<Movie[]> {
  const data = await fetchTMDB('/discover/movie', {
    with_genres: genreId,
    language: 'en-US',
  });
  return data?.results || [];
}

export async function search(query: string): Promise<Movie[]> {
  const data = await fetchTMDB('/search/multi', {
    query,
    language: 'en-US',
  });
  return data?.results || [];
}

export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  return await fetchTMDB(`/movie/${id}`, {
    language: 'en-US',
    append_to_response: 'credits,videos,similar',
  });
}

export async function getGenres(): Promise<Genre[]> {
  const data = await fetchTMDB('/genre/movie/list', { language: 'en-US' });
  return data?.genres || [];
}

export const genreIds = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  SCIFI: 878,
};
