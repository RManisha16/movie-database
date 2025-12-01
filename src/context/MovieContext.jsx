import { createContext, useState } from "react";
 
export const MovieContext = createContext();
 
const MovieProvider = ({ children }) => {
  const [searchText, setSearchText] = useState("");
 
  return (
    <MovieContext.Provider value={{ searchText, setSearchText }}>
      {children}
    </MovieContext.Provider>
  );
};
 
export default MovieProvider;
 