/**
 * Utility functions to manage narration position persistence
 */

const STORAGE_KEY = 'narration_position';

/**
 * Save current narration position to localStorage
 * @param {Object} position - Contains paragraphIndex and timePosition
 */
export const saveNarrationPosition = (position) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch (error) {
    console.warn('Error saving narration position:', error);
  }
};

/**
 * Load saved narration position from localStorage
 * @returns {Object|null} - The saved position or null if not found
 */
export const loadNarrationPosition = () => {
  try {
    const savedPosition = localStorage.getItem(STORAGE_KEY);
    if (!savedPosition) return null;
    
    return JSON.parse(savedPosition);
  } catch (error) {
    console.warn('Error loading narration position:', error);
    return null;
  }
};

/**
 * Clear saved narration position
 */
export const clearNarrationPosition = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Error clearing narration position:', error);
  }
};
