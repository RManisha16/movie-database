# FlimHub – React Project
 
A movie browsing web application built using React, OMDb API, custom hooks, reusable components, and authentication.
 
---
 
## Project Structure
src/
├─ api/
│  └─ omdb.js
├─ components/        # reusable UI (PascalCase)
│  ├─ MovieCard/
│  │  ├─ MovieCard.jsx
│  │  ├─ MovieCard.css
│  │  └─ MovieCard.test.jsx
│  └─ Navbar/
├─ pages/             # page-level components (PascalCase)
│  ├─ Home/
│  │  └─ Home.jsx
│  └─ MovieDetails/
├─ hooks/             # custom hooks (camelCase)
│  └─ useFetch.js
├─ context/           # providers e.g. AuthProvider.jsx
├─ utils/             # helpers, constants
├─ assets/
└─ index.js / App.jsx
 
 
 
---
 
## Project Features
 
- Search movies using **OMDb API**
- View **complete movie details**
- Watch trailers using **YouTube search**
- Login / Signup using **localStorage auth**
- Automatic login popup for protected actions
- Similar movies recommendation (based on genre)
- Categories:
  - Trending  
  - Comedy  
  - Action  
  - Romance
  - Emotional  
  - Avengers  
- Reusable components (MovieCard, TrailerModal, Loader)
- Custom hooks for fetching & debouncing
 
---
 
## Environment Variables 
 
Create a `.env` file in the root:
 
REACT_APP_OMDB_KEY=dummy_omdb_key_here 
REACT_APP_YOUTUBE_KEY=dummy_youtube_key_here
REACT_APP_OMDB_BASE=https://www.omdbapi.com/ 
REACT_APP_YOUTUBE_BASE=https://www.google.com/youtube/v3

Restart the dev server after changing `.env`.

---
 
## Development
1. `git clone <repo>`
2. `npm install`
3. `npm start` — run dev server
4. `npm run build` — build for production
5. `npm test` — run tests
 
---
 
## Notes
 
- All API keys are stored inside `.env`
- OMDb is used only once via `type=movie`
- Tests are written using React Testing Library (RTL)
- Mock files are used for CSS & external modules
 
