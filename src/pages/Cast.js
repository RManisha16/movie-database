import { useOutletContext } from "react-router-dom";
 
export default function Cast() {
  const movie = useOutletContext();
 
  const actors = (movie?.Actors || "").split(",").map(s => s.trim()).filter(Boolean);
 
  return (
    <div className="overview-block">
      <h3 className="section-title">Cast</h3>
      {actors.length ? (
        <ul className="cast-list">
          {actors.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      ) : (
        <p>No cast info available.</p>
      )}
    </div>
  );
}
 