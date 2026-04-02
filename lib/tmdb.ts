// TMDB API Client - Data Agent
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  name?: string;
  first_air_date?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Credits {
  cast: Cast[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

// Genre IDs from TMDB
export const genreIds = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  SCIFI: 878,
};

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.TMDB_API_BASE;

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
  return response.json();
}

export async function getTrending() {
  const data = await tmdbFetch<{ results: Movie[] }>('/trending/all/week');
  return data.results;
}

export async function getPopular() {
  const data = await tmdbFetch<{ results: Movie[] }>('/movie/popular');
  return data.results;
}

export async function getTopRated() {
  const data = await tmdbFetch<{ results: Movie[] }>('/movie/top_rated');
  return data.results;
}

export async function getNowPlaying() {
  const data = await tmdbFetch<{ results: Movie[] }>('/movie/now_playing');
  return data.results;
}

export async function getUpcoming() {
  const data = await tmdbFetch<{ results: Movie[] }>('/movie/upcoming');
  return data.results;
}

export async function getMoviesByGenre(genreId: number) {
  const data = await tmdbFetch<{ results: Movie[] }>(`/discover/movie?with_genres=${genreId}`);
  return data.results;
}

// Alias for consistency with page.tsx
export async function getGenreMovies(genreId: number) {
  return getMoviesByGenre(genreId);
}

export async function searchMulti(query: string) {
  const encodedQuery = encodeURIComponent(query);
  const data = await tmdbFetch<{ results: Movie[] }>(`/search/multi?query=${encodedQuery}`);
  return data.results;
}

export async function getMovieDetails(id: number) {
  return tmdbFetch<Movie>(`/movie/${id}`);
}

export async function getMovieVideos(id: number) {
  const data = await tmdbFetch<{ results: Video[] }>(`/movie/${id}/videos`);
  return data.results;
}

export async function getMovieCredits(id: number) {
  return tmdbFetch<Credits>(`/movie/${id}/credits`);
}

export async function getSimilarMovies(id: number) {
  const data = await tmdbFetch<{ results: Movie[] }>(`/movie/${id}/similar`);
  return data.results;
}

export async function getGenres() {
  const data = await tmdbFetch<{ genres: Genre[] }>('/genre/movie/list');
  return data.genres;
}
