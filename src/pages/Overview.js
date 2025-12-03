// src/pages/Overview.jsx
import { useOutletContext } from "react-router-dom";
 
export default function Overview() {
  const movie = useOutletContext();
 
  if (!movie) return <div className="page">No overview.</div>;
 
  return (
    <div className="overview-block">
      <h3 className="section-title">Overview</h3>
      <p className="overview-text">{movie.Plot || movie.Plot === "" ? (movie.Plot || "Plot not available.") : "Plot not available."}</p>
 
      <div className="more-info-grid">
        <div><strong>Language:</strong> {movie.Language || "N/A"}</div>
        <div><strong>Country:</strong> {movie.Country || "N/A"}</div>
        <div><strong>Awards:</strong> {movie.Awards || "N/A"}</div>
        <div><strong>Box Office:</strong> {movie.BoxOffice || "N/A"}</div>
      </div>
    </div>
  );
}
 