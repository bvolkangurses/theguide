import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_BOOKS_METADATA } from '../utils/serverBookMetadata';

// Create context
const BookContext = createContext();

// Custom hook to use the book context
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

// Provider component
export const BookProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [customBooks, setCustomBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load custom books from localStorage
  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem('__persistent_custom_books');
      if (storedBooks) {
        setCustomBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error('Error loading custom books:', error);
    }
    
    setLoading(false);
  }, []);
  
  // Combine default and custom books
  useEffect(() => {
    const allBooks = [...DEFAULT_BOOKS_METADATA, ...customBooks];
    setBooks(allBooks);
  }, [customBooks]);
  
  // Update current book when location changes
  useEffect(() => {
    if (books.length > 0) {
      const currentPath = location.pathname;
      const matchedBook = books.find(book => book.path === currentPath) || books[0];
      setCurrentBook(matchedBook);
    }
  }, [location, books]);
  
  // Function to add a new custom book or update an existing one
  const addCustomBook = (bookData) => {
    // Check if this is an update or new book
    const isUpdate = bookData.id && customBooks.some(book => book.id === bookData.id);
    
    if (isUpdate) {
      // Update existing book
      const updatedBooks = customBooks.map(book => 
        book.id === bookData.id ? { ...bookData, isCustom: true } : book
      );
      setCustomBooks(updatedBooks);
      
      // Save to localStorage
      try {
        localStorage.setItem('__persistent_custom_books', JSON.stringify(updatedBooks));
      } catch (error) {
        console.error('Error saving updated custom books:', error);
      }
    } else {
      // Ensure the book has a system prompt
      if (!bookData.systemPrompt && bookData.author && bookData.title) {
        bookData.systemPrompt = `You are ${bookData.author}. You are speaking to someone reading ${bookData.title}. When responding keep ${bookData.author}'s personality in mind. Keep your responses under 100 words.`;
      }
      
      // Add a new book
      const newBook = {
        ...bookData,
        id: bookData.id || `custom-${Date.now()}`,
        isCustom: true
      };
      
      const newBooks = [...customBooks, newBook];
      setCustomBooks(newBooks);
      
      // Save to localStorage
      try {
        localStorage.setItem('__persistent_custom_books', JSON.stringify(newBooks));
      } catch (error) {
        console.error('Error saving custom books:', error);
      }
    }
    
    // Navigate to the book's path if provided
    if (bookData.path) {
      navigate(bookData.path);
    }
  };
  
  // Function to remove a custom book
  const removeCustomBook = (bookId) => {
    const updatedBooks = customBooks.filter(book => book.id !== bookId);
    setCustomBooks(updatedBooks);
    
    // Update localStorage
    try {
      localStorage.setItem('__persistent_custom_books', JSON.stringify(updatedBooks));
    } catch (error) {
      console.error('Error saving custom books after removal:', error);
    }
    
    // If the current book is being removed, navigate to the first available book
    if (currentBook && currentBook.id === bookId) {
      const firstBook = books.find(book => book.id !== bookId);
      if (firstBook) {
        navigate(firstBook.path);
      }
    }
  };
  
  // Add the missing setCurrentBookByPath function
  const setCurrentBookByPath = (path) => {
    // Don't do anything if books aren't loaded yet
    if (!books || books.length === 0) {
      console.log(`Books not loaded yet, can't set book with path: ${path}`);
      return;
    }
    
    // Only navigate if we're not already on this path
    if (location.pathname !== path) {
      const book = books.find(b => b.path === path);
      if (book) {
        setCurrentBook(book);
        navigate(path);
      } else {
        console.error(`No book found with path: ${path}. Available paths: ${books.map(b => b.path).join(', ')}`);
      }
    } else {
      // If we're already on the right path, just set the current book without navigating
      const book = books.find(b => b.path === path);
      if (book) {
        setCurrentBook(book);
      }
    }
  };
  
  return (
    <BookContext.Provider
      value={{
        books,
        currentBook,
        loading,
        addCustomBook,
        removeCustomBook,
        customBooks,
        setCurrentBookByPath
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export default BookContext;
