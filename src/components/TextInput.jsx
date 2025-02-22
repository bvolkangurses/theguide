
import React from 'react';

const TextInput = ({ textPosition, currentText, setCurrentText, handleTextChange, handleKeyPress, inputRef }) => (
  <div
    className="text-input"
    style={{ top: textPosition.y, left: textPosition.x, zIndex: 1000, maxWidth: textPosition.maxWidth }}
  >
    <textarea
      ref={inputRef}
      value={currentText}
      onChange={handleTextChange}
      onKeyPress={handleKeyPress}
      autoFocus
      wrap='off'
    />
  </div>
);

export default TextInput;