import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { getMovieDetailsUrl, getCategoryUrlForPhrase } from "../api/tmdb";
import Loader from "../components/Loader";
import TrailerModal from "../components/trailer/TrailerModal";
import { searchTrailerVideoId } from "../api/youtube";
import MovieCard from "../components/movie/MovieCard";
 
import { useAuth } from "../auth/AuthProvider";
 
export default function MovieDetails() {
  const { id } = useParams();
  const { data, loading } = useFetch(getMovieDetailsUrl(id));
 
  const { isAuthenticated } = useAuth();
 
  const [openTrailer, setOpenTrailer] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
 

  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
 

  const fetchSearchForPhrase = async (phrase, pages = [1, 2]) => {
    try {
      const results = [];
      for (const p of pages) {
        const url = getCategoryUrlForPhrase(phrase, p);
        const r = await fetch(url).catch(() => null);
        if (!r) continue;
        const j = await r.json().catch(() => null);
        if (Array.isArray(j?.Search)) results.push(...j.Search);
      }
      return results;
    } catch {
      return [];
    }
  };
 

  const fetchDetailsById = async (imdbID) => {
    try {
      const url = getMovieDetailsUrl(imdbID);
      const r = await fetch(url).catch(() => null);
      if (!r) return null;
      const j = await r.json().catch(() => null);
      if (j?.Response === "True") return j;
      return null;
    } catch {
      return null;
    }
  };
 

  useEffect(() => {
    if (!data) {
      setSimilarMovies([]);
      return;
    }
 
    let cancelled = false;
 
    const loadSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const phrasesSet = new Set();
 

        if (data.Genre) {
          data.Genre.split(",").slice(0, 2).forEach((g) => {
            const trimmed = g.trim();
            if (trimmed) phrasesSet.add(trimmed);
          });
        }
 

        if (data.Actors) {
          data.Actors.split(",").slice(0, 2).forEach((a) => {
            const name = a.split(" as ")[0].trim();
            if (name) phrasesSet.add(name);
          });
        }
 

        if (data.Director) {
          data.Director.split(",").slice(0, 1).forEach((d) => {
            const t = d.trim();
            if (t) phrasesSet.add(t);
          });
        }
 
        if (data.Title) {
          data.Title.split(/\s+/).filter((w) => w.length > 3).slice(0, 3).forEach((w) => {
            phrasesSet.add(w);
          });
        }
 
        const phrases = Array.from(phrasesSet).slice(0, 6);
        if (phrases.length === 0) {
          setSimilarMovies([]);
          setLoadingSimilar(false);
          return;
        }
 
        const arrays = await Promise.all(phrases.map((p) => fetchSearchForPhrase(p, [1, 2])));
        const flat = arrays.flat();
 
        const seen = new Set();
        const candidates = [];
        for (const s of flat) {
          if (!s?.imdbID) continue;
          if (s.imdbID === data.imdbID) continue;
          if (!seen.has(s.imdbID)) {
            seen.add(s.imdbID);
            candidates.push(s);
          }
        }
 
        if (candidates.length === 0 && data.Genre) {
          const fallbackPhrase = data.Genre.split(",")[0].trim();
          const fb = await fetchSearchForPhrase(fallbackPhrase, [1, 2, 3]);
          for (const s of fb) {
            if (!s?.imdbID || s.imdbID === data.imdbID) continue;
            if (!seen.has(s.imdbID)) {
              seen.add(s.imdbID);
              candidates.push(s);
            }
          }
        }
 
        const top = candidates.slice(0, 20);
        const detailsArr = await Promise.all(top.map((t) => fetchDetailsById(t.imdbID)));
 
        const targetGenreMain = (data.Genre || "").split(",")[0].trim().toLowerCase();
 
        const final = [];
        for (let i = 0; i < detailsArr.length; i++) {
          const d = detailsArr[i];
          if (!d) continue;
          if (d.imdbID === data.imdbID) continue;
 
          final.push({
            id: d.imdbID,
            title: d.Title,
            year: d.Year,
            poster: d.Poster,
            raw: d,
          });
        }
 
        if (!cancelled) {
          setSimilarMovies(final.slice(0, 8));
        }
      } catch (err) {
        console.error("loadSimilar failed", err);
        if (!cancelled) setSimilarMovies([]);
      } finally {
        if (!cancelled) setLoadingSimilar(false);
      }
    };
 
    loadSimilar();
 
    return () => {
      cancelled = true;
    };
  }, [data]);
 
  const handlePlayTrailer = async () => {
  console.log("handlePlayTrailer called — isAuthenticated:", isAuthenticated, "videoId:", videoId);
 

  if (!isAuthenticated) {
    console.log("User not authenticated -> dispatching openAuth");
    window.dispatchEvent(new CustomEvent("openAuth", {
      detail: {
        initialMode: "login",
        onSuccess: async () => {
          console.log("onSuccess callback called (after login). Re-running handlePlayTrailer...");
          try {

            await handlePlayTrailer();
          } catch (err) {
            console.error("Retry after login failed:", err);
          }
        }
      }
    }));
    return;
  }
 
  if (videoId) {
    console.log("videoId already available -> open trailer modal");
    setOpenTrailer(true);
    return;
  }
 
  const title = data?.Title ?? data?.title ?? "";
  if (!title) {
    console.log("No title available, opening generic youtube search");
    window.open("https://www.youtube.com/results?search_query=trailer", "_blank");
    return;
  }
 
  setLoadingTrailer(true);
  try {
    console.log("Searching trailer for:", title);
    const vId = await searchTrailerVideoId(title);
    if (vId) {
      console.log("Found trailer id:", vId);
      setVideoId(vId);
      setOpenTrailer(true);
    } else {
      console.log("No vId found, opening youtube search for title trailer");
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + " trailer")}`, "_blank");
    }
  } catch (err) {
    console.error("Trailer lookup failed", err);
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + " trailer")}`, "_blank");
  } finally {
    setLoadingTrailer(false);
  }
};
 
 
  if (loading) return <Loader />;
  if (!data) return <div className="page"><h2>Movie not found.</h2></div>;
 
  const poster = data.Poster && data.Poster !== "N/A" ? data.Poster : null;
  const imdbUrl = data.imdbID ? `https://www.imdb.com/title/${data.imdbID}` : null;
 
  return (
    <div className="page movie-details-page">
      <h1 className="md-title">{data.Title}</h1>
 
      <div className="movie-details-layout">
        {/* LEFT: Poster */}
        <div className="left-col">
          {poster ? (
            <img
              className="poster-image"
              src={poster}
              alt={data.Title}
              onClick={handlePlayTrailer}
              style={{ width: "100%", borderRadius: 12, cursor: "pointer" }}
            />
          ) : (
            <div className="poster-placeholder">No Image</div>
          )}
        </div>
 
        {/* RIGHT: Meta, trailer and tabs */}
        <div className="right-col">
          {/* meta block */}
          <div className="meta-grid">
            <div className="meta-item">
              <div className="meta-label">⭐ Rating</div>
              <div className="meta-value">{data.imdbRating ?? "N/A"} / 10</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">🎬 Genres</div>
              <div className="meta-value">{data.Genre ?? "N/A"}</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">⏱ Runtime</div>
              <div className="meta-value">{data.Runtime ?? "N/A"}</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">📅 Release</div>
              <div className="meta-value">{data.Released ?? "N/A"}</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">🎬 Director</div>
              <div className="meta-value">{data.Director ?? "N/A"}</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">✍️ Writer</div>
              <div className="meta-value">{data.Writer ?? "N/A"}</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">🧑‍🤝‍🧑 Actors</div>
              <div className="meta-value">{data.Actors ?? "N/A"}</div>
            </div>
 
            <div className="meta-item">
              <div className="meta-label">🔗 IMDb</div>
              <div className="meta-value">
                {imdbUrl ? (
                  <a className="imdb-link" href={imdbUrl} target="_blank" rel="noreferrer">Open on IMDb</a>
                ) : "N/A"}
              </div>
            </div>
          </div>
 
          {/* controls */}
          <div className="controls-row">
            <div className="ratings-badges">
              {(data.Ratings || []).slice(0, 3).map((r, i) => (
                <span key={i} className="badge">{r.Source}: {r.Value}</span>
              ))}
            </div>
          </div>
 
          {/* tabs */}
          <div className="tabs">
            <NavLink to="overview" className={({ isActive }) => (isActive ? "tab active-tab" : "tab")} end>
              Overview
            </NavLink>
 
            <NavLink to="cast" className={({ isActive }) => (isActive ? "tab active-tab" : "tab")}>
              Cast
            </NavLink>
 
            <NavLink to="reviews" className={({ isActive }) => (isActive ? "tab active-tab" : "tab")}>
              Reviews
            </NavLink>
 
            <button
              className="play-trailer-btn"
              onClick={handlePlayTrailer}
              disabled={loadingTrailer}
              aria-label="Play trailer"
            >
              {loadingTrailer ? "Loading..." : "▶ Play Trailer"}
            </button>
          </div>
 
          <div className="detail-content">
            <Outlet context={data} />
          </div>
        </div>
      </div>
 
      {/* SIMILAR MOVIES */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 12 }}>Similar movies</h3>
 
        {loadingSimilar ? (
          <p>Loading similar movies…</p>
        ) : similarMovies.length === 0 ? (
          <p style={{ color: "#888" }}>No similar movies found.</p>
        ) : (
          <div className="movie-grid similar-grid">
            {similarMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>
 
      {/* TRAILER MODAL */}
      <TrailerModal open={openTrailer} onClose={() => setOpenTrailer(false)} videoId={videoId} />
      {/* NO AuthModal here — Navbar owns it */}
    </div>
  );
}