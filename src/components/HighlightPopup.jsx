import React from 'react';
import { FaHighlighter, FaTrash, FaComments } from 'react-icons/fa';

const HighlightPopup = ({ position, onHighlight, onRemove, onOpenChat, isEditing }) => {
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
        <>
          <button onClick={onRemove} className="highlight-btn delete">
            <FaTrash /> Remove
          </button>
          {onOpenChat && (
            <button onClick={onOpenChat} className="highlight-btn chat">
              <FaComments /> Chat
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default HighlightPopup;
