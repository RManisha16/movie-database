import React, { useEffect, useRef, useState } from 'react';
import MovieCard from '../components/movie/MovieCard';
import '../index.css';
import { searchMovies } from '../api/tmdb';

const MAX_DETAILS = 30;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadTrending = async (pageNum = 1) => {
    setLoading(true);
    setMovies([]);

    try {
      const json = await searchMovies('avengers', pageNum);
      if (json?.Response === 'True' && Array.isArray(json?.Search)) {
        const mapped = json.Search.slice(0, MAX_DETAILS).map((m) => ({
          id: m.imdbID,
          title: m.Title,
          year: m.Year,
          poster: m.Poster,
        }));
        setMovies(mapped);
      } else {
        setMovies([]);
      }
    } catch (e) {
      console.error('Trending fetch failed', e);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const didRunRef = useRef(false);

  useEffect(() => {
    if (page === 1 && didRunRef.current) return;
    didRunRef.current = true;

    let cancelled = false;
    (async () => {
      await loadTrending(page);
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16 }}>TRENDING</h2>

      {loading ? (
        <p style={{ padding: 20 }}>Loading...</p>
      ) : movies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        <div className="movie-grid">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Home;
