import React, { createContext, useContext, useMemo, useState } from 'react';

export const MovieContext = createContext(undefined);

export const useMovieContext = () => {
  const ctx = useContext(MovieContext);
  if (!ctx) {
    throw new Error('useMovieContext must be used within MovieProvider');
  }
  return ctx;
};

const MovieProvider = ({ children }) => {
  const [searchText, setSearchText] = useState('');

  const value = useMemo(() => ({ searchText, setSearchText }), [searchText]);

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};

export default MovieProvider;
