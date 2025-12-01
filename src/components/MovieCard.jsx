import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MovieCard.css";
 
import { useAuth } from "../auth/AuthProvider";
import AuthModal from "./AuthModal";
import TrailerModal from "./TrailerModal";
import { searchTrailerVideoId } from "../api/youtube";
 
const MovieCard = ({ movie }) => {
  const poster = movie.poster || movie.Poster || "";
  const title = movie.title || movie.Title || "";
  const id = movie.id ?? movie.imdbID ?? "";
 

  const { isAuthenticated } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(null);
 

  const [openTrailer, setOpenTrailer] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
 

  const attemptPlay = async () => {

    if (videoId) {
      setOpenTrailer(true);
      return;
    }
 
    const q = title || movie?.Title || movie?.name || "";
    if (!q) {
      window.open("https://www.youtube.com/results?search_query=trailer", "_blank");
      return;
    }
 
    setLoadingTrailer(true);
    try {
      const vId = await searchTrailerVideoId(q);
      if (vId) {
        setVideoId(vId);
        setOpenTrailer(true);
      } else {

        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q + " trailer")}`, "_blank");
      }
    } catch (err) {
      console.error("Trailer lookup failed", err);
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q + " trailer")}`, "_blank");
    } finally {
      setLoadingTrailer(false);
    }
  };
 

  const onPlayClick = (e) => {

    e.preventDefault();
    e.stopPropagation();
 

    if (!isAuthenticated) {
      setPendingPlay(() => attemptPlay);
      setOpenAuth(true);
      return;
    }

    attemptPlay();
  };

  const handleAuthSuccess = () => {
    setOpenAuth(false);
    if (pendingPlay) {
      setTimeout(() => {
        pendingPlay();
        setPendingPlay(null);
      }, 50);
    }
  };
 
  return (
    <>
      <Link to={`/movie/${id}`} className="card modern-card" aria-label={`Open ${title} details`}>
        <div className="poster-wrap">
          {poster && poster !== "N/A" ? (
            <img src={poster} alt={title} className="poster-img" />
          ) : (
            <div className="no-img">No Image</div>
          )}
 
          <div className="year-badge">{movie.year}</div>
 
          {/* Overlay contains the Play button. Clicking it will NOT navigate. */}
          <div className="poster-overlay">
            <button
              className="view-btn"
              onClick={onPlayClick}
              aria-label={`Play trailer for ${title}`}
              disabled={loadingTrailer}
            >
              {loadingTrailer ? "Loading..." : "▶ Play"}
            </button>
          </div>
        </div>
 
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          <div className="card-sub">{movie.year}</div>
        </div>
      </Link>
 
      {/* Modals (rendered next to card) */}
      <TrailerModal open={openTrailer} onClose={() => setOpenTrailer(false)} videoId={videoId} />
      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};
 
export default MovieCard;
 