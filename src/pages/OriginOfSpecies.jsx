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
      <div className="book-container scrollable">
      <h1 className='h1' style={{ textAlign: 'center' }}>On the Origin of Species</h1>
        <div className="book-content">
          {/* Book content here */}
          <p>WHEN we look to the individuals of the same variety </p>
            {/* More paragraphs... */}
        </div>
      </div>
    </div>
  );
};

export default OriginOfSpecies;
