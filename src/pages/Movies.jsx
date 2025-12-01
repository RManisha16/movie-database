// src/pages/Movies.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { tmdbFetch } from '../api/tmdb';
import useFetch from '../hooks/useFetch';
 
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
 
export default function Movies() {
  const q = useQuery().get('query');
  const pageRef = React.useRef(1);
  const [page, setPage] = React.useState(1);
 
  React.useEffect(() => {
    pageRef.current = page;
  }, [page]);
 
  const fetcher = () =>
    tmdbFetch(q ? '/search/movie' : '/movie/popular', q ? { query: q, page: pageRef.current } : { page: pageRef.current });
 
  const { data, loading, error } = useFetch(fetcher, [q, page]);
 
  const movies = data?.results || [];
  const totalPages = data?.total_pages || 1;
 
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{q ? `Search results for "${q}"` : 'Popular movies'}</h1>
 
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{String(error)}</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-500">No movies found.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
 
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
 