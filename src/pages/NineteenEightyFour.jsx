import React, { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const NineteenEightyFour = ({ onToggleNarration, isAudioPlaying }) => {
  const { setCurrentBookByPath } = useBooks();

  // Set current book when component mounts
  useEffect(() => {
    setCurrentBookByPath('/1984');
  }, [setCurrentBookByPath]);

  return (
    <div className="book-page">
      <div className="book-container">
        <h1 className='h1' style={{ textAlign: 'center' }}>1984</h1>
        <div className="book-content narrow-text scrollable">
          <div id="Ch1-S1-p1" className="para">
            <p className="p">It was a bright cold day in April</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NineteenEightyFour;
