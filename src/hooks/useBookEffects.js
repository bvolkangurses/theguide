import { useEffect } from 'react';
import { getBookIdFromPath } from '../utils/bookIdMapper';

/**
 * Hook to handle book-specific side effects 
 * @param {object} currentBook - The current book object
 * @param {function} resetFn - Function to reset state when book changes
 * @returns {string} - The current book ID
 */
const useBookEffects = (currentBook, resetFn) => {
  const bookId = getBookIdFromPath(currentBook?.path);

  // Reset states when book changes
  useEffect(() => {
    if (resetFn && typeof resetFn === 'function') {
      console.log(`Book changed to: ${bookId}`);
      resetFn(bookId);
    }
  }, [bookId, resetFn]);
  
  return bookId;
};

export default useBookEffects;
