import React from 'react';
import { FaHighlighter, FaTrash } from 'react-icons/fa';

const HighlightPopup = ({ position, onHighlight, onRemove, isEditing }) => {
  return (
    <div 
      className="highlight-popup"
      style={{ 
        top: `${position.y}px`,
        left: `${position.x}px`
      }}
    >
      {!isEditing ? (
        <button onClick={onHighlight} className="highlight-btn">
          <FaHighlighter /> Highlight
        </button>
      ) : (
        <button onClick={onRemove} className="highlight-btn delete">
          <FaTrash /> Remove
        </button>
      )}
    </div>
  );
};

export default HighlightPopup;
