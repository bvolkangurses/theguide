/**
 * Utility functions to manage the audio cache in localStorage
 */

// Generate a book-specific cache key
const generateCacheKey = (paragraphId, bookId) => {
  return `audio_cache_${bookId || 'default'}_${paragraphId}`;
};

// Generate a simple hash for a string to use as an ID
const generateParagraphId = (text) => {
  let hash = 0;
  
  if (!text || text.length === 0) return hash.toString();
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
};

// Save audio data to cache
export const saveAudioToCache = (paragraphText, audioData, bookId = '') => {
  try {
    const paragraphId = generateParagraphId(paragraphText);
    const cacheKey = generateCacheKey(paragraphId, bookId);
    
    // Store the text along with the audio data and bookId for validation
    const cacheEntry = {
      text: paragraphText,
      audio: audioData.audio,
      duration: audioData.duration,
      timestamp: Date.now(),
      bookId // Store the bookId with the cache entry
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    
    // Update the index of cached paragraphs (keep book-specific indices)
    const indexKey = `audio_cache_index_${bookId || 'default'}`;
    const cacheIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
    if (!cacheIndex.includes(paragraphId)) {
      cacheIndex.push(paragraphId);
      localStorage.setItem(indexKey, JSON.stringify(cacheIndex));
    }
    
    return paragraphId;
  } catch (error) {
    console.warn('Error saving audio to cache:', error);
    return null;
  }
};

// Get audio data from cache
export const getAudioFromCache = (paragraphText, bookId = '') => {
  try {
    if (!paragraphText) return null;
    
    const paragraphId = generateParagraphId(paragraphText);
    const cacheKey = generateCacheKey(paragraphId, bookId);
    
    const cacheEntry = JSON.parse(localStorage.getItem(cacheKey));
    
    if (!cacheEntry) return null;
    
    // Verify the cached text matches (to avoid hash collisions)
    if (cacheEntry.text !== paragraphText) {
      return null;
    }
    
    return {
      audio: cacheEntry.audio,
      duration: cacheEntry.duration
    };
  } catch (error) {
    console.warn('Error retrieving audio from cache:', error);
    return null;
  }
};

// Get all cached audio for a specific book
export const getAllBookAudioFromCache = (bookId = '') => {
  try {
    const indexKey = `audio_cache_index_${bookId || 'default'}`;
    const cacheIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
    const bookAudio = [];
    
    for (const id of cacheIndex) {
      const cacheKey = generateCacheKey(id, bookId);
      const cacheEntry = JSON.parse(localStorage.getItem(cacheKey));
      
      if (cacheEntry) {
        bookAudio.push({
          id,
          text: cacheEntry.text,
          audio: cacheEntry.audio,
          duration: cacheEntry.duration,
          timestamp: cacheEntry.timestamp
        });
      }
    }
    
    return bookAudio;
  } catch (error) {
    console.warn('Error retrieving book audio from cache:', error);
    return [];
  }
};

// Clear old cache entries to prevent localStorage from filling up
export const cleanupAudioCache = (maxEntries = 50) => {
  try {
    // Get all book index keys
    const bookIndexKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('audio_cache_index_')) {
        bookIndexKeys.push(key);
      }
    }
    
    // Process each book's cache
    bookIndexKeys.forEach(indexKey => {
      const cacheIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const bookId = indexKey.replace('audio_cache_index_', '');
      
      if (cacheIndex.length <= maxEntries) return;
      
      // Get all cache entries with their timestamps
      const entries = cacheIndex.map(id => {
        try {
          const cacheKey = generateCacheKey(id, bookId);
          const entry = JSON.parse(localStorage.getItem(cacheKey));
          return { id, timestamp: entry?.timestamp || 0 };
        } catch {
          return { id, timestamp: 0 };
        }
      });
      
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest entries
      const entriesToRemove = entries.slice(0, entries.length - maxEntries);
      entriesToRemove.forEach(({ id }) => {
        const cacheKey = generateCacheKey(id, bookId);
        localStorage.removeItem(cacheKey);
      });
      
      // Update index
      const newIndex = cacheIndex.filter(id => !entriesToRemove.find(entry => entry.id === id));
      localStorage.setItem(indexKey, JSON.stringify(newIndex));
    });
  } catch (error) {
    console.warn('Error cleaning up audio cache:', error);
  }
};

// Clear all audio cache entries
export const clearAudioCache = () => {
  try {
    // Find all audio cache keys
    const cacheKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('audio_cache_') || key.startsWith('audio_cache_index_'))) {
        cacheKeys.push(key);
      }
    }
    
    // Remove all cache entries and indices
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    console.warn('Error clearing audio cache:', error);
    return false;
  }
};

// Clear audio cache for a specific book
export const clearBookAudioCache = (bookId = '') => {
  try {
    const indexKey = `audio_cache_index_${bookId || 'default'}`;
    const cacheIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
    
    // Remove each cache entry for this book
    cacheIndex.forEach(id => {
      const cacheKey = generateCacheKey(id, bookId);
      localStorage.removeItem(cacheKey);
    });
    
    // Clear the index for this book
    localStorage.removeItem(indexKey);
    
    return true;
  } catch (error) {
    console.warn('Error clearing book audio cache:', error);
    return false;
  }
};
