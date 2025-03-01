/**
 * Manages book metadata including author, publication year, and voice samples
 * Works in both server-side and client-side environments
 */

// Default metadata for books in the application
const DEFAULT_BOOKS_METADATA = [
  {
    id: "1",
    title: "The Feynman Lectures On Physics",
    path: "/",
    author: "Richard P. Feynman",
    publicationYear: 1964,
    authorVoiceSample: "https://example.com/feynman-voice-sample.mp3",
    authorVoiceID: "CLYGFM7xUpqUpCICyooH",
    systemPrompt: "You are Richard Feynman, a physicist who loves to explain complex concepts in simple terms. You are speaking to someone reading your book 'Feynman Lectures on Physics'. They might ask you questions about it or physics in general. Respond accordingly but keep Richard Feynman's personality in mind in your tone. Keep your responses to less than 100 words.",
  },
  {
    id: "2",
    title: "On the Origin of Species",
    path: "/origin-of-species",
    author: "Charles Darwin",
    publicationYear: 1859,
    authorVoiceSample: "https://example.com/darwin-voice-sample.mp3",
    authorVoiceID: "ArXuxqSbGWJcZpGZdkdK",
    systemPrompt: "You are Charles Darwin, the naturalist who developed the theory of evolution by natural selection. You are speaking to someone reading your book 'On the Origin of Species'. They might ask you questions about it or biology in general. Respond accordingly but keep Charles Darwin's personality in mind in your tone. Keep your responses to less than 100 words.",
  },
  // {
  //   id: "3",
  //   title: "A Brief History of Time",
  //   path: "/brief-history-of-time",
  //   author: "Stephen Hawking",
  //   publicationYear: 1988,
  //   authorVoiceSample: "https://example.com/hawking-voice-sample.mp3",
  //   authorVoiceID: "pkHuriaYg92NN031PT3s",
  //   systemPrompt: "You are Stephen Hawking, the renowned theoretical physicist and cosmologist. You are speaking to someone reading your book 'A Brief History of Time'. When responding to questions about cosmology, black holes, or the universe, use clear analogies that make complex concepts accessible, while acknowledging your ALS condition that required a voice synthesizer. Keep responses under 100 words."
  // },
  {
    id: "3",
    title: "Murder on the Orient Express",
    path: "/murder-on-the-orient-express",
    author: "Agatha Christie",
    publicationYear: 1934,
    authorVoiceSample: "https://example.com/christie-voice-sample.mp3",
    authorVoiceID: "B69GUalo3SuvQ6Cn65CY",
    systemPrompt: "You are Agatha Christie, the world-famous mystery novelist known as the 'Queen of Crime'. You are speaking to someone reading your book 'Murder on the Orient Express'. Respond with the measured, observant tone of your detective Hercule Poirot, noting human behavior and details. Keep responses under 100 words, maintaining the polite, slightly formal English style of the 1930s.",
  },
  {
    id: "4",
    title: "1984",
    path: "/1984",
    author: "George Orwell",
    publicationYear: 1949,
    authorVoiceSample: "https://example.com/orwell-voice-sample.mp3",
    authorVoiceID: "wIz0Qw0bc8sogGZf7WnM",
    systemPrompt: "You are George Orwell, author of '1984' and other works exploring totalitarianism and social injustice. You are speaking to someone reading '1984'. You have a clear, direct writing style and strong political convictions. Keep your responses concise, under 100 words, with the plain-spoken but insightful style characteristic of your essays.",
  },
  // {
  //   id: "5",
  //   title: "Harry Potter and the Philosopher's Stone",
  //   path: "/harry-potter",
  //   author: "J.K. Rowling",
  //   publicationYear: 1997,
  //   authorVoiceSample: "https://example.com/rowling-voice-sample.mp3",
  //   authorVoiceID: "nyctJDtrCzcbsqXzf8vG",
  //   systemPrompt: "You are J.K. Rowling, the author of the Harry Potter series. You are speaking to someone reading 'Harry Potter and the Philosopher's Stone'. When responding to questions about the wizarding world, maintain the whimsical yet thoughtful tone that characterizes your writing. Keep responses concise (under 100 words) and appropriate for readers of all ages, while capturing the magical essence of the Harry Potter universe."
  // },
];

/**
 * Map descriptive IDs to numeric IDs
 * This allows clients to use readable IDs while maintaining compatibility
 */
export const mapDescriptiveIdToNumeric = (descriptiveId) => {
  // Convert to lowercase for case-insensitive matching
  const id = String(descriptiveId).toLowerCase();
  
  const idMapping = {
    'feynman': '1',
    'darwin': '2',
    'orwell': '3',
    '1984': '3',
    'christie': '4',
    'agatha': '4',
    'murder': '4',
    'orient-express': '4',
    'rowling': '5',
    'harry': '5',
    'potter': '5',
    'philosophers-stone': '5',
    'harry-potter': '5',
    'hawking': '6',
    'stephen': '6',
    'brief-history': '6',
    'brief-history-of-time': '6', 
    'time': '6',
  };
  
  // Return the numeric ID if found in mapping, otherwise return the original ID
  return idMapping[id] || descriptiveId;
};

/**
 * Get metadata for a specific book by ID
 * Handles both numeric IDs and descriptive IDs
 */
export const getBookMetadataById = (bookId) => {
  // Simplify logging for client-side
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    // Only log detailed info on server-side
    console.log(`Looking for book with ID: "${bookId}" (${typeof bookId})`);
    console.log("Available book IDs:", DEFAULT_BOOKS_METADATA.map(book => `"${book.id}" (${typeof book.id})`));
  }
  
  // Map descriptive ID to numeric ID if needed
  const mappedId = mapDescriptiveIdToNumeric(bookId);
  
  if (!isClient) {
    console.log(`Mapped ID: "${mappedId}" (from "${bookId}")`);
  }
  
  // Ensure bookId is a string for comparison
  const stringBookId = String(mappedId);
  const book = DEFAULT_BOOKS_METADATA.find(book => book.id === stringBookId);
  
  if (!isClient) {
    console.log("Found book:", book || "null");
  }
  return book || null;
};

/**
 * Get metadata for a specific book by path
 */
export const getBookMetadataByPath = (path) => {
  return DEFAULT_BOOKS_METADATA.find(book => book.path === path) || null;
};

/**
 * Get book ID from path
 */
export const getBookIdFromPath = (path) => {
  const book = getBookMetadataByPath(path);
  return book ? book.id : "1"; // Default to Feynman (ID: "1")
};

// Export default metadata for direct access
export { DEFAULT_BOOKS_METADATA };
