import React, { useMemo } from 'react';
import './TrailerModal.css';

export default function TrailerModal({ open, onClose, videoId }) {
  const EMBED_BASE = process.env.REACT_APP_YOUTUBE_EMBED_BASE;

  const src = useMemo(() => {
    if (!videoId) return { ok: false, src: '', message: 'Trailer not found.' };

    if (!EMBED_BASE) {
      return {
        ok: false,
        src: '',
        message: 'YouTube embed base URL is missing.',
      };
    }

    const url = new URL(EMBED_BASE + videoId);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('rel', '0');
    return url.toString();
  }, [EMBED_BASE, videoId]);

  if (!open) return;

  return (
    <div
      className="trailer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="trailer-box" onClick={(e) => e.stopPropagation()}>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', padding: 8 }}
        >
          <button onClick={onClose} aria-label="Close trailer">
            ✕
          </button>
        </div>

        {src ? (
          <div
            style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}
          >
            <iframe
              title="Trailer"
              src={src}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        ) : (
          <div style={{ padding: 24 }}>Trailer not found.</div>
        )}
      </div>
    </div>
  );
}
