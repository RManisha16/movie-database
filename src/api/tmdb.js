import axios from 'axios';

const OMDB_BASE = process.env.REACT_APP_OMDB_BASE;
const OMDB_KEY = process.env.REACT_APP_OMDB_KEY;

if (!OMDB_BASE) {
  console.warn('⚠ REACT_APP_OMDB_BASE is missing. Check your .env file.');
}
if (!OMDB_KEY) {
  console.warn('⚠ REACT_APP_OMDB_KEY is missing. Check your .env file.');
}

export const omdb = axios.create({
  baseURL: OMDB_BASE,
  params: { apikey: OMDB_KEY },
});

const cache = new Map();
export function clearOmdbCache() {
  cache.clear();
}

export const searchMovies = async (query, page = 1, axiosConfig = {}) => {
  const { data } = await omdb.get('', {
    ...axiosConfig,
    params: {
      ...(axiosConfig.params || {}),
      type: 'movie',
      s: query,
      page,
    },
  });
  return data;
};

export const getMovieDetails = async (imdbId, axiosConfig = {}) => {
  const { data } = await omdb.get('', {
    ...axiosConfig,
    params: { ...(axiosConfig.params || {}), i: imdbId, plot: 'full' },
  });
  return data;
};
