import React from 'react';
import { FaPlay } from 'react-icons/fa';

const ContextMenu = ({ position, onStartPlayback, onClose }) => {
  if (!position) return null;

  return (
    <div 
      className="context-menu"
      style={{ 
        top: position.y,
        left: position.x
      }}
    >
      <button onClick={onStartPlayback} className="context-menu-item">
        <FaPlay className="context-menu-icon" /> Read from here
      </button>
    </div>
  );
};

export default ContextMenu;
