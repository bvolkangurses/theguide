import React, { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const OriginOfSpecies = ({ onToggleNarration, isAudioPlaying }) => {
  const { books, setCurrentBookByPath } = useBooks();

  // Set current book when component mounts and books are loaded
  useEffect(() => {
    if (books && books.length > 0) {
      setCurrentBookByPath('/origin-of-species');
    }
  }, [books, setCurrentBookByPath]);

  return (
    <div className="book-page">
      <div className="book-container">
        <h1 className='h1' style={{ textAlign: 'center' }}>On the Origin of Species</h1>
        <div className="book-content narrow-text scrollable">
          <div id="Ch1-S1-p1" className="para">
            <p className="p">When we look to the individuals of the same variety</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginOfSpecies;
