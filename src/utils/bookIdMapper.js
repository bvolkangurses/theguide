/**
 * Utility to map between book paths and IDs
 * This is a compatibility layer that uses serverBookMetadata
 */

import { getBookMetadataByPath } from './serverBookMetadata';

/**
 * Get book ID from path
 */
export const getBookIdFromPath = (path) => {
  const book = getBookMetadataByPath(path);
  return book ? book.id : "1"; // Default to Feynman (ID: "1")
};
