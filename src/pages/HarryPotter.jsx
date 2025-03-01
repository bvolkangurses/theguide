import React, { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const HarryPotter = ({ onToggleNarration, isAudioPlaying }) => {
  const { setCurrentBookByPath } = useBooks();

  // Set current book when component mounts
  useEffect(() => {
    setCurrentBookByPath('/harry-potter');
  }, [setCurrentBookByPath]);

  return (
    <div className="book-page">
      <div className="book-container">
        <h1 className='h1' style={{ textAlign: 'center' }}>Harry Potter and the Philosopher's Stone</h1>
        <div className="book-content narrow-text scrollable">
          <div id="summary" className="para">
            <p className="p">The story follows Harry Potter, a young wizard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarryPotter;
