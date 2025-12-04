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

// const inFlight = new Map(); // key -> Promise
const cache = new Map(); // key -> { data, expires }
// const TTL_MS = 5 * 60 * 1000; // cache 5 minutes

// function stableKey(path = '', params = {}) {
//   // Build a deterministic key from path + sorted params.
//   // (We include apikey for uniqueness even though axios adds it)
//   const merged = { ...params, apikey: OMDB_KEY };
//   const keys = Object.keys(merged).sort();
//   const qp = keys
//     .map((k) => `${k}=${encodeURIComponent(merged[k] ?? '')}`)
//     .join('&');
//   return `${OMDB_BASE}${path}?${qp}`;
// }

// function getWithDedup(path = '', params = {}, axiosConfig = {}) {
//   const key = stableKey(path, params);
//   const now = Date.now();

//   // ✅ Serve from cache if fresh
//   const hit = cache.get(key);
//   if (hit && hit.expires > now) {
//     return Promise.resolve(hit.data);
//   }

//   // ✅ Reuse the same in-flight promise if one exists
//   if (inFlight.has(key)) {
//     return inFlight.get(key);
//   }

//   // Start the request
//   const p = omdb
//     .get(path, {
//       ...axiosConfig,
//       params: {
//         ...(axiosConfig.params || {}),
//         ...params,
//       },
//     })
//     .then((res) => {
//       const data = res.data;
//       cache.set(key, { data, expires: now + TTL_MS });
//       return data;
//     })
//     .finally(() => {
//       inFlight.delete(key);
//     });

//   inFlight.set(key, p);
//   return p;
// }

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
