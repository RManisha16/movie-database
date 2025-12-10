import axios from 'axios';

const OMDB_BASE = process.env.REACT_APP_OMDB_BASE;
const OMDB_KEY = process.env.REACT_APP_OMDB_KEY;

if (!OMDB_BASE) {
  throw new Error('REACT_APP_OMDB_BASE is missing. Check your .env file.');
}
if (!OMDB_KEY) {
  throw new Error('REACT_APP_OMDB_KEY is missing. Check your .env file.');
}

export const omdb = axios.create({
  baseURL: OMDB_BASE,
  params: { apikey: OMDB_KEY },
});

const cache = new Map();

let CACHE_TTL_MS = 5 * 60 * 1000; 
const MAX_ENTRIES = 500; 

function makeKey(parts) {
  return parts.join('|');
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function setInCache(key, value, ttlMs = CACHE_TTL_MS) {
  const record = { value, expiresAt: Date.now() + ttlMs };
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, record);
}
export function clearOmdbCache() {
  cache.clear();
}

export function setOmdbCacheTTL(ms) {
  CACHE_TTL_MS = Math.max(0, Number(ms) || 0);
}

export const searchMovies = async (query, page = 1, axiosConfig = {}) => {
  try {
    const { data } = await omdb.get('', {
      ...axiosConfig,
      params: {
        ...(axiosConfig.params || {}),
        type: 'movie',
        s: query,
        page,
      },
    });

    if (!data || typeof data !== 'object') {
      return { Response: 'False', Error: 'Invalid response from OMDb.' };
    }
    return data;
  } catch (err) {
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
      return { Response: 'False', Error: 'Request canceled.' };
    }
    const msg =
      err?.response?.data?.Error ||
      err?.response?.data?.message ||
      err?.message ||
      'Unable to search movies at the moment.';
    return { Response: 'False', Error: msg };
  }
};

export const getMovieDetails = async (imdbId, axiosConfig = {}) => {
  try {
    const { data } = await omdb.get('', {
      ...axiosConfig,
      params: { ...(axiosConfig.params || {}), i: imdbId, plot: 'full' },
    });

    if (!data || typeof data !== 'object') {
      return { Response: 'False', Error: 'Invalid response from OMDb.' };
    }
    return data;
  } catch (err) {
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
      return { Response: 'False', Error: 'Request canceled.' };
    }
    const msg =
      err?.response?.data?.Error ||
      err?.response?.data?.message ||
      err?.message ||
      'Unable to load movie details.';
    return { Response: 'False', Error: msg };
  }
};
