# FlimHub – React Project
 
A movie browsing web application built using React, OMDb API, custom hooks, reusable components, authentication, and unit testing.
 
---
 
## Project Structure
- .vscode      
- public                  -> To store the images & html file
- src/
  - api/                  -> API helper function (tmdb and youtube js)
  - auth/                 -> AuthProvider (localStorage authentication)
  - components/
      - nav/              -> Navbar
      - movie/            -> MovieCard, SkeletonCard
      - trailer/          -> TrailerModal
      - authentication/   -> Login/Signup Modal
      - Loader.jsx
  - context/              -> MovieContext
  - hooks/                -> useFetch custom hook
  - pages/                -> Home, Movies, MovieDetails, Subpages
  - App.jsx               -> App routes
  - index.js
- package.json
 
 
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
 
## Environment Variables (Dummy Example)
 
Create a `.env` file in the root:
 
REACT_APP_OMDB_API_KEY=dummy_omdb_key_here 
REACT_APP_YOUTUBE_API_KEY=dummy_youtube_key_here
 
---
 
## Getting Started
 
### 1️⃣ Clone the repository
 
git clone <your-repo-url> cd movie-project
 
### 2️⃣ Install dependencies
 
npm install
 
### 3️⃣ Start development server
 
npm run dev
 
### 4️⃣ Build the project
 
npm run build
 
### 5️⃣ Run test cases
 
npm run test
 
---
 
## Notes
 
- All API keys are stored inside `.env`
- OMDb is used only once via `type=movie`
- Tests are written using React Testing Library (RTL)
- Mock files are used for CSS & external modules
 
