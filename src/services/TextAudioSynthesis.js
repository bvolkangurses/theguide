/**
 * Service for handling text-to-speech synthesis
 * Abstracts API calls to the backend
 */
class TextAudioSynthesis {
  /**
   * Synthesize text to speech
   * @param {string} text - The text to synthesize
   * @returns {Promise<{audio: string, duration: number}>} - Audio URL and duration
   */
  static async synthesize(text) {
    try {
      const response = await fetch('http://localhost:3000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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
   * @returns {Promise<{audio: string, duration: number}>} - Audio URL and duration
   */
  static async preload(text) {
    return this.synthesize(text); // Same as synthesize for now, could be optimized differently
  }
}

export default TextAudioSynthesis;
