import React, { useEffect, useState } from 'react';
import { FaBook, FaTrash, FaEraser, FaBars, FaBroom, FaPlus, FaEdit, FaTimes } from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import { useBooks } from '../contexts/BookContext';
import { clearAudioCache, clearBookAudioCache } from '../utils/audioCache';
import { clearNarrationPosition, clearBookNarrationPosition } from '../utils/narrationPositionManager';
import { getBookSpecificKey } from '../utils/storageKeyManager';
import AddBookModal from './AddBookModal';

const Sidebar = ({ isOpen, onClose, onOpen, onClearTexts }) => {
  const { clearMessages } = useChat();
  const { books, loading, currentBook, addCustomBook, removeCustomBook, customBooks, setCurrentBookById } = useBooks();
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  
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
      
      // Clear chat messages
      clearMessages();
      
      // Refresh the page to reset all components
      window.location.reload();
  };
  
  const handleOpenAddBookModal = (e) => {
    e.stopPropagation();
    setBookToEdit(null);
    setIsAddBookModalOpen(true);
  };
  
  const handleEditBook = (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    setBookToEdit(book);
    setIsAddBookModalOpen(true);
  };
  
  const handleRemoveBook = (e, bookId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this book?")) {
      removeCustomBook(bookId);
    }
  };

  const openAddBookModal = () => {
    setIsAddBookModalOpen(true);
  };

  const closeAddBookModal = () => {
    setIsAddBookModalOpen(false);
  };

  // New handler for book selection
  const handleBookSelect = (book) => {
    if (book && book.id) {
      setCurrentBookById(book.id);
      onClose();
    } else {
      console.error('Invalid book object:', book);
    }
  };

  return (
    <>
      <div className={`sidebar-left ${isOpen ? 'open' : ''}`} onClick={(e) => {
        e.stopPropagation();
        if (!isOpen) onOpen();
      }}>
        {!isOpen && <FaBars className="open-icon" />}
        {isOpen && (
          <div className="sidebar-content">
            <h2>
              Library
              <button 
                className="close-btn" 
                onClick={onClose}
                style={{ position: 'absolute', right: '15px', top: '15px' }}
              >
                <FaTimes />
              </button>
            </h2>
            {loading ? (
              <div>Loading books...</div>
            ) : (
              <ul className="book-list">
                {books && books.length > 0 ? books.map(book => (
                  <li key={book.id || Math.random()}>
                    <div className="book-item">
                      <div 
                        className={`book-link ${currentBook?.id === book.id ? 'active' : ''} ${book.isCustom ? 'custom-book' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookSelect(book);
                        }}
                      >
                        <div className="book-link-content">
                          <div className={`book-title ${isShortTitle(book.title) ? 'short-title' : ''}`}>
                            {book.title}
                          </div>
                          {book.author && (
                            <div className="book-author">by {book.author} ({book.publicationYear})</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Add edit/delete buttons for custom books */}
                      {book.isCustom && (
                        <div className="book-actions">
                          <button 
                            className="book-action-btn edit-btn"
                            onClick={(e) => handleEditBook(e, book)}
                            title="Edit book"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="book-action-btn delete-btn"
                            onClick={(e) => handleRemoveBook(e, book.id)}
                            title="Delete book"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )) : <div>No books available</div>}
              </ul>
            )}
            
            <button 
              className="sidebar-button add-book-button"
              onClick={openAddBookModal}
            >
              <FaPlus /> Add Book
            </button>
            
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
      
      <AddBookModal 
        isOpen={isAddBookModalOpen}
        onClose={closeAddBookModal}
        onAddBook={addCustomBook}
        bookToEdit={bookToEdit}
      />
    </>
  );
};

export default Sidebar;