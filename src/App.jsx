import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/nav/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import Overview from './pages/Overview';
import Cast from './pages/Cast';
import Reviews from './pages/Reviews';

import MovieProvider from './context/MovieContext';
import AuthProvider from './auth/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* AuthProvider at top so all children can access auth state */}
        <MovieProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            {/* Movie details route with nested children */}
            <Route path="/movie/:id" element={<MovieDetails />}>
              {/* index route (when /movie/:id is visited) -> Overview */}
              <Route index element={<Overview />} />
              {/* explicit child routes */}
              <Route path="overview" element={<Overview />} />
              <Route path="cast" element={<Cast />} />
              <Route path="reviews" element={<Reviews />} />
            </Route>
            {/* fallback */}
            <Route path="*" element={<h1>404 Page Not Found</h1>} />
          </Routes>
        </MovieProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
