import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBookSpecificKey } from '../utils/storageKeyManager';
import { useBooks } from './BookContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { currentBook } = useBooks();
  const bookId = currentBook?.path ? currentBook.path.split('/').pop() : 'default';
  
  // Use book-specific storage key
  const storageKey = getBookSpecificKey('chatMessages', bookId);
  
  const [messages, setMessages] = useState(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading chatMessages from localStorage:', error);
      return [];
    }
  });

  // Update messages when book changes
  useEffect(() => {
    try {
      const newKey = getBookSpecificKey('chatMessages', bookId);
      const item = window.localStorage.getItem(newKey);
      if (item) {
        setMessages(JSON.parse(item));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading book-specific messages:', error);
      setMessages([]);
    }
  }, [bookId]);

  // Save messages to localStorage
  useEffect(() => {
    try {
      const newKey = getBookSpecificKey('chatMessages', bookId);
      window.localStorage.setItem(newKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error writing chatMessages to localStorage:', error);
    }
  }, [bookId, messages]);

  const addMessage = (message) => {
    if (!message.timestamp) {
      const now = new Date();
      message.timestamp = { date: now.toLocaleDateString(), time: now.toLocaleTimeString() };
    }
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = (specificBookId = null) => {
    if (specificBookId) {
      // Clear messages for a specific book
      const targetKey = getBookSpecificKey('chatMessages', specificBookId);
      localStorage.removeItem(targetKey);
      if (specificBookId === bookId) {
        setMessages([]);
      }
    } else {
      // Clear only current book's messages
      setMessages([]);
    }
  };

  const clearAllBookMessages = () => {
    // Get all chat storage keys
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('chatMessages_')) {
        keys.push(key);
      }
    }
    
    // Remove all book-specific chat messages
    keys.forEach(key => localStorage.removeItem(key));
    
    // Reset current state
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      addMessage, 
      clearMessages,
      clearAllBookMessages,
      bookId // Export the current bookId for convenience
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
