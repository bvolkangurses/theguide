import React, { useEffect } from 'react';
import { FaBook, FaTrash, FaEraser, FaBars, FaBroom } from 'react-icons/fa';
import { Link, useLocation } from "react-router-dom";
import { useChat } from '../contexts/ChatContext';
import { useBooks } from '../contexts/BookContext';
import { clearAudioCache, clearBookAudioCache } from '../utils/audioCache';
import { clearNarrationPosition, clearBookNarrationPosition } from '../utils/narrationPositionManager';
import { getBookSpecificKey } from '../utils/storageKeyManager';

const Sidebar = ({ isOpen, onClose, onOpen, onClearTexts }) => {
  const { clearMessages } = useChat();
  const location = useLocation();
  const { books, loading, currentBook } = useBooks();
  
  // Helper function to determine if a title is short
  const isShortTitle = (title) => {
    return title.length < 6;
  };

  const handleClearAudioCache = () => {
    clearAudioCache();
    clearNarrationPosition();
  };

  // Modified to preserve book metadata
  const handleClear = () => {
    // Get current localStorage items
    const items = { ...localStorage };
    
    // Clear localStorage
    window.localStorage.clear();
    
    // Re-add any keys that start with __persistent to preserve them
    Object.keys(items).forEach(key => {
      if (key.startsWith('__persistent')) {
        localStorage.setItem(key, items[key]);
      }
    });
    
    clearMessages();
    window.location.reload();
  };

  // New handler for clearing book-specific data
  const handleClearBookData = () => {
    if (!currentBook) return;
    
    const bookId = currentBook.id;
    const bookTitle = currentBook.title;
    
      // Clear book-specific storage items
      const bookPrefixes = ['texts', 'highlightedNotes', 'highlightChats'];
      bookPrefixes.forEach(prefix => {
        localStorage.removeItem(getBookSpecificKey(prefix, bookId));
      });
      
      // Clear book-specific narration position
      clearBookNarrationPosition(bookId);
      
      // Clear book-specific audio cache
      clearBookAudioCache(bookId);
      
      // Refresh the page to reset all components
      window.location.reload();
  };

  return (
    <div className={`sidebar-left ${isOpen ? 'open' : ''}`} onClick={(e) => {
      e.stopPropagation();
      if (!isOpen) onOpen();
    }}>
      {!isOpen && <FaBars className="open-icon" />}
      {isOpen && (
        <div className="sidebar-content">
          <h2>Library</h2>
          {loading ? (
            <div>Loading books...</div>
          ) : (
            <ul className="book-list">
              {books && books.length > 0 ? books.map(book => (
                <li key={book.id || Math.random()}>
                  <Link 
                    to={book.path} 
                    className={`book-link ${location.pathname === book.path ? 'active' : ''}`}
                  >
                    <div className="book-link-content">
                      <div className={`book-title ${isShortTitle(book.title) ? 'short-title' : ''}`}>
                        {book.title}
                      </div>
                      {book.author && (
                        <div className="book-author">by {book.author} ({book.publicationYear})</div>
                      )}
                    </div>
                  </Link>
                </li>
              )) : <div>No books available</div>}
            </ul>
          )}
          <button
            className="clear-button clear-texts"
            onClick={onClearTexts}
          >
            <FaEraser /> Clear Whiteboard
          </button>
          <button
            className="clear-button clear-current-book"
            onClick={handleClearBookData}
          >
            <FaBroom /> Clear Book Data
          </button>
          <button
            className="clear-button"
            onClick={() => { handleClear(); handleClearAudioCache(); }}
          >
            <FaTrash /> Clear All Data
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;