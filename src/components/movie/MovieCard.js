import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';
import { useAuth } from '../../auth/AuthProvider';
import AuthModal from '../authentication/AuthModal';
import TrailerModal from '../trailer/TrailerModal';
import { searchTrailerVideoId } from '../../api/youtube';

const MovieCard = ({ movie }) => {
  const poster = movie.poster || movie.Poster || '';
  const title = movie.title || movie.Title || '';
  const id = movie.id ?? movie.imdbID ?? '';

  const year = movie.year || movie.Year || '';
  const { isAuthenticated } = useAuth();

  const [openAuth, setOpenAuth] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(null);

  const [openTrailer, setOpenTrailer] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  const YT_SEARCH_BASE = process.env.REACT_APP_YOUTUBE_SEARCH;

  const fallbackSearchUrl = useMemo(() => {
    const q = title || movie?.Title || movie?.name || '';
    const query = q ? `${q} trailer` : 'trailer';
    return `${YT_SEARCH_BASE}${encodeURIComponent(query)}`;
  }, [YT_SEARCH_BASE, title, movie]);

  const attemptPlay = async () => {
    if (videoId) {
      setOpenTrailer(true);
      return;
    }

    const q = title || movie?.Title || movie?.name || '';
    if (!q) {
      window.open(fallbackSearchUrl, '_blank');
      return;
    }

    setLoadingTrailer(true);
    try {
      const vId = await searchTrailerVideoId(q);
      if (vId) {
        setVideoId(vId);
        setOpenTrailer(true);
      } else {
        window.open(fallbackSearchUrl, '_blank');
      }
    } catch (err) {
      console.error('Trailer lookup failed', err);
      window.open(fallbackSearchUrl, '_blank');
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

  const detailsHref = id
    ? `/movie/${id}`
    : `/search?q=${encodeURIComponent(title || '')}`;

  return (
    <>
      <Link
        to={detailsHref}
        className="card modern-card"
        aria-label={`Open ${title || 'movie'} details`}
      >
        <div className="poster-wrap">
          {poster && poster !== 'N/A' ? (
            <img src={poster} alt={title || 'Poster'} className="poster-img" />
          ) : (
            <div className="no-img">No Image</div>
          )}

          {/* Year badge (render only if we have a value) */}
          {year ? <div className="year-badge">{year}</div> : null}

          {/* Overlay contains the Play button. Clicking it will NOT navigate. */}
          <div className="poster-overlay">
            <button
              className="view-btn"
              type="button"
              onClick={onPlayClick}
              aria-label={`Play trailer for ${title || 'this movie'}`}
              disabled={loadingTrailer}
            >
              {loadingTrailer ? 'Loading...' : '▶ Play'}
            </button>
          </div>
        </div>

        <div className="card-body">
          <h3 className="card-title">{title || 'Untitled'}</h3>
          <div className="card-sub">{year || ''}</div>
        </div>
      </Link>

      {/* Modals (rendered next to card) */}
      <TrailerModal
        open={openTrailer}
        onClose={() => setOpenTrailer(false)}
        videoId={videoId}
      />
      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default MovieCard;
