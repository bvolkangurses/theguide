/**
 * Utility functions to manage narration position persistence
 */
import { getBookSpecificKey } from './storageKeyManager';

const STORAGE_KEY = 'narration_position';

/**
 * Save current narration position to localStorage
 * @param {Object} position - Contains paragraphIndex and timePosition
 * @param {string} bookId - Current book identifier
 */
export const saveNarrationPosition = (position, bookId) => {
  try {
    const key = getBookSpecificKey(STORAGE_KEY, bookId);
    localStorage.setItem(key, JSON.stringify(position));
  } catch (error) {
    console.warn('Error saving narration position:', error);
  }
};

/**
 * Load saved narration position from localStorage
 * @param {string} bookId - Current book identifier
 * @returns {Object|null} - The saved position or null if not found
 */
export const loadNarrationPosition = (bookId) => {
  try {
    const key = getBookSpecificKey(STORAGE_KEY, bookId);
    const savedPosition = localStorage.getItem(key);
    if (!savedPosition) return null;
    
    return JSON.parse(savedPosition);
  } catch (error) {
    console.warn('Error loading narration position:', error);
    return null;
  }
};

/**
 * Clear saved narration position
 * @param {string} bookId - Current book identifier
 */
export const clearNarrationPosition = (bookId) => {
  try {
    const key = getBookSpecificKey(STORAGE_KEY, bookId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Error clearing narration position:', error);
  }
};

/**
 * Clear narration position for a specific book
 * @param {string} bookId - Current book identifier
 */
export const clearBookNarrationPosition = (bookId) => {
  const key = `narration_position_${bookId}`;
  localStorage.removeItem(key);
};

/**
 * Clear all book narration positions
 */
export const clearAllNarrationPositions = () => {
  try {
    // Use the new utility function to clear all book-specific narration positions
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_KEY)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing all narration positions:', error);
  }
};
