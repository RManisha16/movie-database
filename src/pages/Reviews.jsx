import { useOutletContext } from "react-router-dom";
 
export default function Reviews() {
  const movie = useOutletContext();
 
  return (
    <div className="overview-block">
      <h3 className="section-title">Reviews & Ratings</h3>
 
      <div className="ratings-list">
        {(movie?.Ratings || []).length ? (
          movie.Ratings.map((r, i) => (
            <div className="rating-row" key={i}>
              <strong>{r.Source}</strong> — {r.Value}
            </div>
          ))
        ) : (
          <p>No ratings available.</p>
        )}
      </div>
 
      <p style={{ marginTop: 12 }}>
        For editorial reviews, check the <a href={`https://www.imdb.com/title/${movie?.imdbID}`} target="_blank" rel="noreferrer">IMDb page</a>.
      </p>
    </div>
  );
}
 