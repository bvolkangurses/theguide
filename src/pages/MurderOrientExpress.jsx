import React, { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const MurderOrientExpress = ({ onToggleNarration, isAudioPlaying }) => {
  const { setCurrentBookByPath } = useBooks();

  // Set current book when component mounts
  useEffect(() => {
    setCurrentBookByPath('/murder-on-the-orient-express');
  }, [setCurrentBookByPath]);

  return (
    <div className="book-page">
      <div className="book-container">
        <h1 className='h1' style={{ textAlign: 'center' }}>Murder on the Orient Express</h1>
        <div className="book-content narrow-text scrollable">
          <div id="Ch1-S1-p1" className="para">
            <p className="p">It was five o'clock on a winter's morning in Syria</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MurderOrientExpress;
