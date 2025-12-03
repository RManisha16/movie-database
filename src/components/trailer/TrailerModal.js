import React from "react";
import "./TrailerModal.css"; 
 
export default function TrailerModal({ open, onClose, videoId }) {
  if (!open) return null;
 
  const src = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
 
  return (
    <div className="trailer-overlay" onClick={onClose}>
      <div className="trailer-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
          <button onClick={onClose} aria-label="Close trailer">✕</button>
        </div>
        {src ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              title="trailer"
              src={src}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div style={{ padding: 24 }}>Trailer not found.</div>
        )}
      </div>
    </div>
  );
}
