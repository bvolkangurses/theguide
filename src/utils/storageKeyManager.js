/**
 * Utility functions to manage book-specific storage keys
 */

/**
 * Generate a book-specific storage key
 * @param {string} baseKey - Base key name
 * @param {string} bookId - Book identifier
 * @returns {string} - Book-specific storage key
 */
export const getBookSpecificKey = (baseKey, bookId) => {
  if (!bookId) return baseKey; // Fallback to base key if no bookId
  return `${baseKey}_${bookId}`;
};

/**
 * Get all keys in localStorage that match a specific pattern
 * @param {string} keyPattern - Pattern to match
 * @returns {Array} - Array of matching keys
 */
export const getMatchingStorageKeys = (keyPattern) => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(keyPattern)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Clear all book-specific data for a given base key
 * @param {string} baseKey - Base key name
 */
export const clearAllBookSpecificData = (baseKey) => {
  const keys = getMatchingStorageKeys(`${baseKey}_`);
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
};
