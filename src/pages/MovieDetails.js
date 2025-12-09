import React, { useEffect, useMemo, useState, useRef } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { getMovieDetails, searchMovies } from '../api/tmdb';
import Loader from '../components/Loader';
import TrailerModal from '../components/trailer/TrailerModal';
import { searchTrailerVideoId } from '../api/youtube';
import MovieCard from '../components/movie/MovieCard';
import { useAuth } from '../auth/AuthProvider';

const detailsPromiseCache = new Map();
const detailsDataCache = new Map();

export default function MovieDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState('');

  const [openTrailer, setOpenTrailer] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState('');
  
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [shouldLoadSimilar, setShouldLoadSimilar] = useState(false);

  const similarRef = useRef(null);
  const processedSimilarForIdRef = useRef(new Set());
  const inFlightSimilarRef = useRef(new Set());

  useEffect(() => {
    if (!id) {
      setDetails(null);
      setDetailsError('Movie id missing.');
      setLoadingDetails(false);
      return;
    }

    if (detailsDataCache.has(id)) {
      setDetails(detailsDataCache.get(id));
      setDetailsError('');
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);
    setDetailsError('');

    let cancelled = false;
    let promise = detailsPromiseCache.get(id);

    if (!promise) {
      promise = (async () => {
        try {
          const res = await getMovieDetails(id);
          return res;
        } catch (e) {
          throw e;
        }
      })();
      detailsPromiseCache.set(id, promise);
    }

    (async () => {
      try {
        const res = await promise;

        if (cancelled) return;
        try {
          detailsDataCache.set(id, res);
        } catch (err) {
          // ignore cache set errors
        }

        if (res?.Response === 'True' || res?.imdbID) {
          setDetails(res);
          setDetailsError('');
        } else if (res?.id || res?.title || res?.name) {
          setDetails(res);
          setDetailsError('');
        } else {
          setDetails(null);
          setDetailsError(res?.Error || 'Movie not found.');
        }
      } catch (e) {
        if (!cancelled) {
          setDetails(null);
          setDetailsError(
            'Unable to load movie details. Please try again later.'
          );
          detailsPromiseCache.delete(id);
          detailsDataCache.delete(id);
        }
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let observer;
    let localController;
    let cancelled = false;

    const imdbID = details?.imdbID;
    if (imdbID && !processedSimilarForIdRef.current.has(imdbID)) {
      setShouldLoadSimilar(true);
    }

    if (!shouldLoadSimilar) {
      const el = similarRef.current;
      if (el && typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setShouldLoadSimilar(true);
              observer.disconnect();
            }
          },
          { rootMargin: '200px' }
        );
        observer.observe(el);
      }
    }

    const runFetchSimilar = async () => {
      const imdb = details?.imdbID;
      if (!shouldLoadSimilar) return;
      if (!imdb) {
        return;
      }
      if (processedSimilarForIdRef.current.has(imdb)) return;
      if (inFlightSimilarRef.current.has(imdb)) return;
      inFlightSimilarRef.current.add(imdb);

      localController = new AbortController();
      const { signal } = localController;

      cancelled = false;
      let phrase = '';
      if (details?.Genre) {
        const g = details.Genre.split(',')[0]?.trim();
        if (g) phrase = g;
      }
      if (!phrase && details?.Title) {
        const token = details.Title.split(/\s+/).find((w) => w.length > 3);
        if (token) phrase = token;
      }
      if (!phrase) {
        processedSimilarForIdRef.current.add(imdb);
        inFlightSimilarRef.current.delete(imdb);
        return;
      }

      setLoadingSimilar(true);
      try {
        const res = await searchMovies(phrase, 1, { signal });

        const items = Array.isArray(res?.Search) ? res.Search : [];
        const cards = items
          .filter((s) => s?.imdbID && s.imdbID !== imdb)
          .slice(0, 8)
          .map((s) => ({
            id: s.imdbID,
            title: s.Title,
            year: s.Year,
            poster: s.Poster && s.Poster !== 'N/A' ? s.Poster : undefined,
            raw: s,
          }));

        if (!cancelled) {
          setSimilarMovies(cards);
          processedSimilarForIdRef.current.add(imdb);
        }
      } catch (e) {
        if (
          !cancelled &&
          e?.name !== 'AbortError' &&
          e?.name !== 'CanceledError'
        ) {
        }
      } finally {
        inFlightSimilarRef.current.delete(imdb);
        if (!cancelled) setLoadingSimilar(false);
      }
    };

    if (shouldLoadSimilar) {
      runFetchSimilar();
    }

    return () => {
      cancelled = true;
      observer && observer.disconnect();
      localController && localController.abort();
    };
  }, [details, shouldLoadSimilar]);

  const handlePlayTrailer = async () => {
    setTrailerError('');

    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('openAuth', {
          detail: {
            initialMode: 'login',
            onSuccess: async () => {
              try {
                await handlePlayTrailer();
              } catch {
                // ignore
              }
            },
          },
        })
      );
      return;
    }

    if (videoId) {
      setOpenTrailer(true);
      return { ok: true };
    }

    const title = details?.Title ?? details?.title ?? '';
    if (!title) {
      const msg = 'Trailer not available for this title.';
      setTrailerError(msg);
      return { ok: false, message: msg };
    }

    const fallbackUrl =
      process.env.REACT_APP_YOUTUBE_SEARCH +
      encodeURIComponent(`${title} trailer`);

    setLoadingTrailer(true);
    try {
      const vId = await searchTrailerVideoId(title);
      if (vId) {
        setVideoId(vId);
        setOpenTrailer(true);
      } else {
        setTrailerError(
          `No trailer found. Try searching manually: ${fallbackUrl}`
        );
      }
    } catch {
      setTrailerError(
        `Unable to fetch trailer. Try searching manually: ${fallbackUrl}`
      );
    } finally {
      setLoadingTrailer(false);
    }
  };

  const TMDB_IMG_BASE = process.env.REACT_APP_TMDB_IMG_BASE;

  const posterUrl = useMemo(() => {
    const p =
      details?.Poster ||
      (details?.poster_path ? `${TMDB_IMG_BASE}${details.poster_path}` : null);
    return p && p !== 'N/A' ? p : undefined;
  }, [details, TMDB_IMG_BASE]);

  const imdbUrl = useMemo(() => {
    return details?.imdbID;
  }, [details]);

  if (loadingDetails) return <Loader />;
  if (!details)
    return (
      <div className="page">
        <h2>{detailsError || 'Movie not found.'}</h2>
      </div>
    );

  return (
    <div className="page movie-details-page">
      <h1 className="md-title">{details.Title}</h1>

      <div className="movie-details-layout">
        {/* LEFT: Poster */}
        <div className="left-col">
          {posterUrl ? (
            <img
              className="poster-image"
              src={posterUrl}
              alt={details.Title}
              onClick={handlePlayTrailer}
              style={{ width: '100%', borderRadius: 12, cursor: 'pointer' }}
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
              <div className="meta-value">
                {details.imdbRating ?? 'N/A'} / 10
              </div>
            </div>

            <div className="meta-item">
              <div className="meta-label">🎬 Genres</div>
              <div className="meta-value">{details.Genre ?? 'N/A'}</div>
            </div>

            <div className="meta-item">
              <div className="meta-label">⏱ Runtime</div>
              <div className="meta-value">{details.Runtime ?? 'N/A'}</div>
            </div>

            <div className="meta-item">
              <div className="meta-label">📅 Release</div>
              <div className="meta-value">{details.Released ?? 'N/A'}</div>
            </div>

            <div className="meta-item">
              <div className="meta-label">🎬 Director</div>
              <div className="meta-value">{details.Director ?? 'N/A'}</div>
            </div>

            <div className="meta-item">
              <div className="meta-label">✍️ Writer</div>
              <div className="meta-value">{details.Writer ?? 'N/A'}</div>
            </div>

            <div className="meta-item">
              <div className="meta-label">🧑‍🤝‍🧑 Actors</div>
              <div className="meta-value">{details.Actors ?? 'N/A'}</div>
            </div>

            <div className="meta-item">
              <div className="meta-label">🔗 IMDb</div>
              <div className="meta-value">
                {imdbUrl ? (
                  <a
                    className="imdb-link"
                    href={imdbUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on IMDb
                  </a>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </div>

          {/* controls */}
          <div className="controls-row">
            <div className="ratings-badges">
              {(details.Ratings || []).slice(0, 3).map((r, i) => (
                <span key={i} className="badge">
                  {r.Source}: {r.Value}
                </span>
              ))}
            </div>
          </div>

          {/* tabs */}
          <div className="tabs">
            <NavLink
              to="overview"
              className={({ isActive }) =>
                isActive ? 'tab active-tab' : 'tab'
              }
              end
            >
              Overview
            </NavLink>

            <NavLink
              to="cast"
              className={({ isActive }) =>
                isActive ? 'tab active-tab' : 'tab'
              }
            >
              Cast
            </NavLink>

            <NavLink
              to="reviews"
              className={({ isActive }) =>
                isActive ? 'tab active-tab' : 'tab'
              }
            >
              Reviews
            </NavLink>

            <button
              className="play-trailer-btn"
              onClick={handlePlayTrailer}
              disabled={loadingTrailer}
              aria-label="Play trailer"
            >
              {loadingTrailer ? 'Loading...' : '▶ Play Trailer'}
            </button>
          </div>

          {/* Inline trailer error (if any) */}
          {trailerError && (
            <p style={{ marginTop: 8, color: '#ff8080' }}>{trailerError}</p>
          )}

          <div className="detail-content">
            {/* pass details (not data) */}
            <Outlet context={details} />
          </div>
        </div>
      </div>

      {/* SIMILAR MOVIES */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 12 }}>Similar movies</h3>

        {loadingSimilar ? (
          <p>Loading similar movies…</p>
        ) : similarMovies.length === 0 ? (
          <p style={{ color: '#888' }}>No similar movies found.</p>
        ) : (
          <div className="movie-grid similar-grid">
            {similarMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>

      {/* TRAILER MODAL */}
      <TrailerModal
        open={openTrailer}
        onClose={() => setOpenTrailer(false)}
        videoId={videoId}
      />
      {/* NO AuthModal here — Navbar owns it */}
    </div>
  );
}
