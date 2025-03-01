import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_BOOKS_METADATA, getBookMetadataByPath } from '../utils/serverBookMetadata';

const BookContext = createContext();

export function BookProvider({ children }) {
  const location = useLocation();
  const [currentBook, setCurrentBook] = useState(null);
  
  useEffect(() => {
    // Find book metadata based on the current path
    const book = getBookMetadataByPath(location.pathname);
    setCurrentBook(book || DEFAULT_BOOKS_METADATA[0]); // Default to first book if not found
  }, [location.pathname]);

  // Add the missing function to set current book by path
  const setCurrentBookByPath = (path) => {
    const book = getBookMetadataByPath(path);
    if (book) {
      setCurrentBook(book);
    } else {
      console.warn(`No book found with path: ${path}`);
      // Default to first book if not found
      setCurrentBook(DEFAULT_BOOKS_METADATA[0]);
    }
  };

  const value = {
    books: DEFAULT_BOOKS_METADATA,
    currentBook,
    setCurrentBookByPath, // Add the new function to the context value
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBooks() {
  return useContext(BookContext);
}
