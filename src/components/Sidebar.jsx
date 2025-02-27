import React, { useRef, useEffect } from 'react';
import { FaBook, FaUser, FaBars, FaVolumeUp } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { useChat } from '../contexts/ChatContext';
import { clearAudioCache } from '../utils/audioCache';
import { clearNarrationPosition } from '../utils/narrationPositionManager';

const books = [
  { id: 1, title: "The Feynman Lectures On Physics", path: "/" },
  // Add more books here as needed
];

const Sidebar = ({ isOpen, onClose, onOpen, onClearTexts }) => {
  const { clearMessages } = useChat();

  const handleClearAudioCache = () => {
    clearAudioCache();
    clearNarrationPosition(); // Also clear narration position when clearing audio cache
    // Optional: show feedback to the user that cache was cleared
  };

  const handleClear = () => {
    window.localStorage.clear();
    clearMessages();
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
          <ul className="book-list">
            {books.map(book => (
              <li key={book.id}>
                <Link to={book.path} className="book-link">
                  {book.title}
                </Link>
              </li>
            ))}
          </ul>
          <button
            className="clear-button clear-texts"
            onClick={onClearTexts}
          >
            Clear Whiteboard
          </button>
          <button
            className="clear-button"
            onClick={() => { handleClear(); handleClearAudioCache(); }}
          >
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;