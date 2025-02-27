/**
 * Utility functions to manage the audio cache in localStorage
 */

// Generate a simple hash for a string to use as an ID
const generateParagraphId = (text) => {
  let hash = 0;
  if (text.length === 0) return hash.toString();
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
};

// Save audio data to cache
export const saveAudioToCache = (paragraphText, audioData) => {
  try {
    const paragraphId = generateParagraphId(paragraphText);
    const cacheKey = `audio_cache_${paragraphId}`;
    
    // Store the text along with the audio data for validation
    const cacheEntry = {
      text: paragraphText,
      audio: audioData.audio,
      duration: audioData.duration,
      timestamp: Date.now()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    
    // Update the index of cached paragraphs
    const cacheIndex = JSON.parse(localStorage.getItem('audio_cache_index') || '[]');
    if (!cacheIndex.includes(paragraphId)) {
      cacheIndex.push(paragraphId);
      localStorage.setItem('audio_cache_index', JSON.stringify(cacheIndex));
    }
    
    return paragraphId;
  } catch (error) {
    console.warn('Error saving audio to cache:', error);
    return null;
  }
};

// Get audio data from cache
export const getAudioFromCache = (paragraphText) => {
  try {
    const paragraphId = generateParagraphId(paragraphText);
    const cacheKey = `audio_cache_${paragraphId}`;
    
    const cacheEntry = JSON.parse(localStorage.getItem(cacheKey));
    
    if (!cacheEntry) return null;
    
    // Verify the cached text matches (to avoid hash collisions)
    if (cacheEntry.text !== paragraphText) return null;
    
    return {
      audio: cacheEntry.audio,
      duration: cacheEntry.duration
    };
  } catch (error) {
    console.warn('Error retrieving audio from cache:', error);
    return null;
  }
};

// Clear old cache entries to prevent localStorage from filling up
export const cleanupAudioCache = (maxEntries = 50) => {
  try {
    const cacheIndex = JSON.parse(localStorage.getItem('audio_cache_index') || '[]');
    
    if (cacheIndex.length <= maxEntries) return;
    
    // Get all cache entries with their timestamps
    const entries = cacheIndex.map(id => {
      try {
        const entry = JSON.parse(localStorage.getItem(`audio_cache_${id}`));
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
      localStorage.removeItem(`audio_cache_${id}`);
    });
    
    // Update index
    const newIndex = cacheIndex.filter(id => !entriesToRemove.find(entry => entry.id === id));
    localStorage.setItem('audio_cache_index', JSON.stringify(newIndex));
  } catch (error) {
    console.warn('Error cleaning up audio cache:', error);
  }
};

// Clear all audio cache entries
export const clearAudioCache = () => {
  try {
    // Get the index of cached paragraphs
    const cacheIndex = JSON.parse(localStorage.getItem('audio_cache_index') || '[]');
    
    // Remove each cache entry
    cacheIndex.forEach(id => {
      localStorage.removeItem(`audio_cache_${id}`);
    });
    
    // Clear the index
    localStorage.removeItem('audio_cache_index');
    
    return true;
  } catch (error) {
    console.warn('Error clearing audio cache:', error);
    return false;
  }
};
