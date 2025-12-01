import React, { useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { getMovieDetailsUrl } from "../api/tmdb";
import Loader from "../components/Loader";
import TrailerModal from "../components/TrailerModal";
import { searchTrailerVideoId } from "../api/youtube";
 
import { useAuth } from "../auth/AuthProvider";
 
export default function MovieDetails() {
  const { id } = useParams();
  const { data, loading } = useFetch(getMovieDetailsUrl(id));
 
  const { isAuthenticated } = useAuth();
 
  const [openTrailer, setOpenTrailer] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
 
  const handlePlayTrailer = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("openAuth", {
        detail: {
          initialMode: "login",
          onSuccess: async () => {
            try {
              await handlePlayTrailer();
            } catch (err) {
              console.error(err);
            }
          }
        }
      }));
      return;
    }
 
    if (videoId) {
      setOpenTrailer(true);
      return;
    }
 
    const title = data?.Title ?? data?.title ?? "";
    if (!title) {
      window.open("https://www.youtube.com/results?search_query=trailer", "_blank");
      return;
    }
 
    setLoadingTrailer(true);
    try {
      const vId = await searchTrailerVideoId(title);
      if (vId) {
        setVideoId(vId);
        setOpenTrailer(true);
      } else {
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
 
      {/* TRAILER MODAL */}
      <TrailerModal open={openTrailer} onClose={() => setOpenTrailer(false)} videoId={videoId} />
      {/* NO AuthModal here — Navbar owns it */}
    </div>
  );
}