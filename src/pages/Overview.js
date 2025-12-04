import { useOutletContext } from 'react-router-dom';

export default function Overview() {
  const movie = useOutletContext();

  if (!movie || typeof movie !== 'object') {
    return <div className="page">No overview.</div>;
  }

  const plot =
    typeof movie.Plot === 'string' && movie.Plot.trim().length > 0
      ? movie.Plot
      : 'Plot not available.';

  return (
    <div className="overview-block">
      <h3 className="section-title">Overview</h3>
      <p className="overview-text">{plot}</p>

      <div className="more-info-grid">
        <div>
          <strong>Language:</strong> {movie.Language || 'N/A'}
        </div>
        <div>
          <strong>Country:</strong> {movie.Country || 'N/A'}
        </div>
        <div>
          <strong>Awards:</strong> {movie.Awards || 'N/A'}
        </div>
        <div>
          <strong>Box Office:</strong> {movie.BoxOffice || 'N/A'}
        </div>
      </div>
    </div>
  );
}
