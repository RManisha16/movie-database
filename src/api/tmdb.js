const KEY = "20da2eb7";
const BASE = `https://www.omdbapi.com/?apikey=${KEY}&type=movie`;

const CATEGORY_QUERIES = {
  avengers: ["avengers"],
  comedy: ["comedy", "funny movie", "slapstick", "romantic comedy"],
  action: ["action", "action movie", "hero", "fight"],
  romance: ["romance", "romantic", "romance movie", "love"],
  emotional: ["emotional", "tearjerker", "family drama"]
};
 
// return URL for a single phrase (used by fetch logic)
export const getCategoryUrlForPhrase = (phrase, page = 1) =>
  `${BASE}&s=${encodeURIComponent(phrase)}&page=${page}`;
 
// returns the array of phrases for the category
export const getCategoryPhrases = (categoryKey) =>
  CATEGORY_QUERIES[categoryKey] ?? [categoryKey ?? "avengers"];
 
// search by arbitrary query
export const searchMovieUrl = (query, page = 1) =>
  `${BASE}&s=${encodeURIComponent(query)}&page=${page}`;

export const getMovieDetailsUrl = (id) =>
  `${BASE}&i=${encodeURIComponent(id)}`;
 

export const getTrendingUrl = () => getCategoryUrlForPhrase("avengers");
 
export const getCastUrl = (id) => getMovieDetailsUrl(id);
export const getReviewsUrl = (id) => getMovieDetailsUrl(id);
 