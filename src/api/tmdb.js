const OMDB_BASE = process.env.REACT_APP_OMDB_BASE;
const OMDB_KEY  = process.env.REACT_APP_OMDB_KEY;

if (!OMDB_KEY) {
  console.warn("⚠ REACT_APP_OMDB_KEY is missing. Check your .env file.");
}
 
const buildUrl = (params) => `${OMDB_BASE}?apikey=${OMDB_KEY}&${params}`;
 
 
const CATEGORY_QUERIES = {
  avengers: ["avengers"],
  comedy: ["comedy", "funny movie", "slapstick", "romantic comedy"],
  action: ["action", "action movie", "hero", "fight"],
  emotional: ["emotional", "tearjerker", "family drama"],
};
 
export const getCategoryUrlForPhrase = (phrase, page = 1) =>
  buildUrl(`type=movie&s=${encodeURIComponent(phrase)}&page=${page}`);
 
export const getCategoryPhrases = (categoryKey) =>
  CATEGORY_QUERIES[categoryKey] ?? [categoryKey || "avengers"];
 
export const searchMovieUrl = (query, page = 1) =>
  buildUrl(`type=movie&s=${encodeURIComponent(query)}&page=${page}`);
 
export const getMovieDetailsUrl = (id) =>
  buildUrl(`i=${encodeURIComponent(id)}`);
 
export const getTrendingUrl = () => getCategoryUrlForPhrase("avengers");
 
export const getCastUrl = (id) => getMovieDetailsUrl(id);
export const getReviewsUrl = (id) => getMovieDetailsUrl(id);
 