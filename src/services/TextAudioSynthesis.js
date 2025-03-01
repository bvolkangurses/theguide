/**
 * Service for handling text-to-speech synthesis
 * Abstracts API calls to the backend
 */
class TextAudioSynthesis {
  /**
   * Synthesize text to speech
   * @param {string} text - The text to synthesize
   * @param {string} bookId - The current book ID for voice selection
   * @returns {Promise<{audio: string, duration: number}>} - Audio URL and duration
   */
  static async synthesize(text, bookId = '') {
    try {
      const response = await fetch('http://localhost:3000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, bookId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to synthesize: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error synthesizing text:', error);
      throw error;
    }
  }

  /**
   * Preload audio synthesis for a text
   * Useful for preparing the next paragraph in advance
   * @param {string} text - The text to preload
   * @param {string} bookId - The current book ID for voice selection
   * @returns {Promise<{audio: string, duration: number}>} - Audio URL and duration
   */
  static async preload(text, bookId = '') {
    return this.synthesize(text, bookId); // Same as synthesize for now, could be optimized differently
  }

  /**
   * Request streaming audio synthesis with progress updates
   * @param {string} text - The text to synthesize
   * @param {string} bookId - The current book ID for voice selection 
   * @param {function} onProgress - Callback for stream progress
   * @returns {Promise<ReadableStream>} - Stream of audio data
   */
  static async synthesizeStream(text, bookId = '', onProgress) {
    try {
      const response = await fetch('http://localhost:3000/synthesize/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, bookId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to synthesize stream: ${response.statusText}`);
      }
      
      if (onProgress && response.body) {
        return response.body;
      }
      
      return response;
    } catch (error) {
      console.error('Error synthesizing text stream:', error);
      throw error;
    }
  }
}

export default TextAudioSynthesis;
