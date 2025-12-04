import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/movie/MovieCard';
import SkeletonMovieCard from '../components/SkeletonMovieCard';
import { searchMovies } from '../api/tmdb';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search = () => {
  const queryParams = useQuery();
  const q = queryParams.get('q') ?? '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setMovies([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);

    (async () => {
      try {
        const data = await searchMovies(trimmed, 1, { signal });
        const list = Array.isArray(data?.Search) ? data.Search : [];
        const normalized = list.map((m) => ({
          id: m.imdbID ?? m.id,
          title: m.Title ?? m.title,
          poster: m.Poster ?? m.poster,
          year: m.Year,
          raw: m,
        }));
        setMovies(normalized);
      } catch (err) {
        if (signal.aborted) return;
        console.error('Search fetch error:', err);
        setMovies([]);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [q]);

  return (
    <div className="page">
      <h1>
        Search results for: <span style={{ textTransform: 'none' }}>{q}</span>
      </h1>

      {loading && (
        <div className="movie-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonMovieCard key={i} />
          ))}
        </div>
      )}

      {!loading && movies.length === 0 && <p>No movies found.</p>}

      <div className="movie-grid">
        {!loading && movies.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  );
};

export default Search;
