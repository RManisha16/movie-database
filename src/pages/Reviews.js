import { useOutletContext } from 'react-router-dom';

export default function Reviews() {
  const movie = useOutletContext();

  const ratings = Array.isArray(movie?.Ratings) ? movie.Ratings : [];
  const imdbBase = process.env.REACT_APP_IMDB_BASE;
  const imdbUrl = movie?.imdbID ? `${imdbBase}${movie.imdbID}` : null;

  return (
    <div className="overview-block">
      <h3 className="section-title">Reviews & Ratings</h3>

      <div className="ratings-list">
        {ratings.length ? (
          ratings.map((r) => (
            <div className="rating-row" key={r.Source}>
              <strong>{r.Source}</strong> — {r.Value}
            </div>
          ))
        ) : (
          <p>No ratings available.</p>
        )}
      </div>

      <p style={{ marginTop: 12 }}>
        For editorial reviews, check the{' '}
        {imdbUrl ? (
          <a href={imdbUrl} target="_blank" rel="noreferrer">
            IMDb page
          </a>
        ) : (
          'IMDb page not available'
        )}
        .
      </p>
    </div>
  );
}
