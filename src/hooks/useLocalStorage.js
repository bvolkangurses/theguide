import { useState, useEffect, useRef, useCallback } from 'react';
import { getBookSpecificKey } from '../utils/storageKeyManager';

/**
 * Standard localStorage hook
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key:', key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing localStorage key:', key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

/**
 * Book-specific version of localStorage hook
 */
export const useBookStorage = (baseKey, bookId, initialValue) => {
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);
  // Keep previous bookId in a ref to detect changes
  const prevBookIdRef = useRef(bookId);
  
  // Generate storage key once
  const getStorageKey = useCallback(() => getBookSpecificKey(baseKey, bookId), [baseKey, bookId]);
  
  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(getStorageKey());
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key:', getStorageKey(), error);
      return initialValue;
    }
  });

  // Load data when bookId changes
  useEffect(() => {
    // Skip the first render since we already initialized from localStorage
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only load new data if bookId actually changed
    if (prevBookIdRef.current !== bookId) {
      try {
        const newKey = getBookSpecificKey(baseKey, bookId);
        const item = window.localStorage.getItem(newKey);
        
        if (item) {
          // Parse once and update state directly
          const parsedValue = JSON.parse(item);
          setStoredValue(parsedValue);
        } else {
          setStoredValue(initialValue);
        }
        
        // Update the previous bookId ref
        prevBookIdRef.current = bookId;
      } catch (error) {
        console.error('Error updating for new bookId:', error);
      }
    }
  }, [bookId, baseKey, getStorageKey, initialValue]);

  // Save to localStorage when value changes
  useEffect(() => {
    // Skip saving during the initialization render
    if (isFirstRender.current) return;
    
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing localStorage:', error);
    }
  }, [storedValue, getStorageKey]);

  // Create a stable setter function using useCallback instead of useRef
  const setValue = useCallback((value) => {
    try {
      // Use the React state updater pattern to ensure we have the latest state
      setStoredValue(prevValue => {
        // Handle functional updates
        const valueToStore = typeof value === 'function' ? value(prevValue) : value;
        
        // Save to localStorage
        try {
          const key = getStorageKey();
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }
        
        // Return new value for state
        return valueToStore;
      });
    } catch (error) {
      console.error('Error in setValue:', error);
    }
  }, [getStorageKey]);

  return [storedValue, setValue];
};

export default useLocalStorage;
