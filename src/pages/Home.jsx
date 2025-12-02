import React, { useState, useEffect } from "react";
import MovieCard from "../components/movie/MovieCard";
import "../index.css";
 
import {
  getCategoryPhrases,
  getCategoryUrlForPhrase,
  getMovieDetailsUrl,
} from "../api/tmdb";
 
const CATEGORY_TO_GENRE = {
  comedy: "Comedy",
  action: "Action",
  romance: "Romance",
  emotional: "Drama", 
};
 
const MAX_DETAILS = 30;
 
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [category, setCategory] = useState("trending");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
 
  const fetchSearchForPhrase = async (phrase, pageNum = 1) => {
    try {
      const url = getCategoryUrlForPhrase(phrase, pageNum);
      const r = await fetch(url);
      const json = await r.json();
      if (json?.Response === "True" && Array.isArray(json?.Search)) {
        return json.Search;
      }
      return [];
    } catch {
      return [];
    }
  };
 
  const fetchDetailsById = async (id) => {
    try {
      const url = getMovieDetailsUrl(id);
      const r = await fetch(url);
      const json = await r.json();
      if (json?.Response === "True") return json;
      return null;
    } catch {
      return null;
    }
  };
 
  const genreMatches = (detail, target) => {
    if (!detail?.Genre) return false;
    return detail.Genre.toLowerCase().includes(target.toLowerCase());
  };
 
  const loadCategory = async (cat, pageNum = page) => {
    setLoading(true);
    setMovies([]);
 
    try {
      let phrases = [];
      if (cat === "trending") {
        const mixKeys = ["avengers", "comedy", "action", "romance", "emotional"];
        mixKeys.forEach((k) => {
          const arr = getCategoryPhrases(k);
          if (Array.isArray(arr)) phrases.push(...arr);
        });
      } else {
        phrases = getCategoryPhrases(cat);
      }
 
      phrases = Array.from(new Set(phrases));
 
      const arrays = await Promise.all(phrases.map((p) => fetchSearchForPhrase(p, pageNum)));
 
      const flat = arrays.flat();
      const seen = new Set();
      const unique = [];
      for (const m of flat) {
        if (!m || !m.imdbID) continue;
        if (!seen.has(m.imdbID)) {
          seen.add(m.imdbID);
          unique.push(m);
        }
      }
 
      if (cat === "avengers" || cat === "trending") {
        setMovies(
          unique.slice(0, MAX_DETAILS).map((m) => ({
            id: m.imdbID,
            title: m.Title,
            year: m.Year,
            poster: m.Poster,
          }))
        );
        setLoading(false);
        return;
      }
 
      const targetGenre = CATEGORY_TO_GENRE[cat] ?? cat;
      const toFetch = unique.slice(0, MAX_DETAILS);
      const details = await Promise.all(toFetch.map((x) => fetchDetailsById(x.imdbID)));
 
      const filtered = [];
      for (let i = 0; i < details.length; i++) {
        const d = details[i];
        if (d && genreMatches(d, targetGenre)) {
          filtered.push({
            id: toFetch[i].imdbID,
            title: toFetch[i].Title,
            year: toFetch[i].Year,
            poster: toFetch[i].Poster,
          });
        }
      }
 
      setMovies(filtered);
    } catch (e) {
      console.log("Category failed", e);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    loadCategory(category, page);
  }, [category, page]);
 
  return (
    <div className="page">
      {/* Category Buttons */}
      <div className="category-buttons">
        {["trending", "avengers", "comedy", "action", "romance", "emotional"].map((catKey) => (
          <button
            key={catKey}
            className={category === catKey ? "active-btn" : ""}
            onClick={() => {
              setPage(1);
              setCategory(catKey);
            }}
          >
            {catKey.toUpperCase()}
          </button>
        ))}
      </div>
 
      <br/>
 
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
 
      {/* Pagination */}
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
 