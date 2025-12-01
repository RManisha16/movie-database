import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SkeletonMovieCard from "../components/SkeletonMovieCard";
import { searchMovieUrl } from "../api/tmdb";
 
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
 
const Search = () => {
  const queryParams = useQuery();
  const q = queryParams.get("q") ?? "";
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    if (!q || q.trim() === "") {
      setMovies([]);
      return;
    }
 
    const controller = new AbortController();
    const signal = controller.signal;
 
    setLoading(true);
    fetch(searchMovieUrl(q), { signal })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.Search) ? data.Search : [];
        const normalized = list.map((m) => ({
          id: m.imdbID ?? m.id,
          title: m.Title ?? m.title,
          poster: m.Poster ?? m.poster,
          year: m.Year,
          raw: m,
        }));
        setMovies(normalized);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Search fetch error:", err);
          setMovies([]);
        }
      })
      .finally(() => setLoading(false));
 
    return () => controller.abort();
  }, [q]);
 
  return (
    <div className="page">
      <h1>Search results for: <span style={{ textTransform: "none" }}>{q}</span></h1>
 
      {loading && (
        <div className="movie-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonMovieCard key={i} />)}
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
 