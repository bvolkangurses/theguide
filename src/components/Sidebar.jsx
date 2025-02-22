import React, { useRef, useEffect } from 'react';
import { FaBook, FaUser, FaBars } from 'react-icons/fa';
import { Link } from "react-router-dom";

const books = [
  { id: 1, title: "The Feynman Lectures On Physics", path: "/" },
  // Add more books here as needed
];

const Sidebar = ({ isOpen, onClose, onOpen }) => {
  const handleClear = () => {
    window.localStorage.removeItem('texts');
    window.localStorage.removeItem('highlightedNotes');
    window.location.reload();
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      onOpen();
    }
  };

  return (
    <div
      className={`sidebar-left ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOpen) onOpen();
      }}
    >
      {!isOpen && <FaBars className="open-icon" />}
      {isOpen && (
        <div className="sidebar-content">
          <h2>
            Library
          </h2>
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
            className="clear-button"
            onClick={handleClear}
          >
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;