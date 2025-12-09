
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
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/footer/Footer';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MovieProvider>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              }
            />
            <Route
              path="/search"
              element={
                <ErrorBoundary>
                  <Search />
                </ErrorBoundary>
              }
            />

            {/* Movie details route with nested children -> boundary around this section */}
            <Route
              path="/movie/:id"
              element={
                <ErrorBoundary>
                  <MovieDetails />
                </ErrorBoundary>
              }
            >
              <Route
                index
                element={
                  <ErrorBoundary>
                    <Overview />
                  </ErrorBoundary>
                }
              />
              <Route
                path="overview"
                element={
                  <ErrorBoundary>
                    <Overview />
                  </ErrorBoundary>
                }
              />
              <Route
                path="cast"
                element={
                  <ErrorBoundary>
                    <Cast />
                  </ErrorBoundary>
                }
              />
              <Route
                path="reviews"
                element={
                  <ErrorBoundary>
                    <Reviews />
                  </ErrorBoundary>
                }
              />
            </Route>

            {/* fallback */}
            <Route path="*" element={<h1>404 Page Not Found</h1>} />
          </Routes>
          <Footer/>
        </MovieProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
