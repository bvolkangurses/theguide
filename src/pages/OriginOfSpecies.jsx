import React, { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const OriginOfSpecies = ({ onToggleNarration, isAudioPlaying }) => {
  const { setCurrentBookByPath } = useBooks();

  // Set current book when component mounts
  useEffect(() => {
    setCurrentBookByPath('/origin-of-species');
  }, [setCurrentBookByPath]);

  return (
    <div className="book-page">
      <div className="book-container whiteboard">
        <h1 className='h1' style={{ textAlign: 'center' }}>On the Origin of Species</h1>
        <div className="book-content narrow-text scrollable">
          <div id="Ch1-S1-p1" className="para">
            <p className="p">WHEN we look to the individuals of the same variety </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginOfSpecies;
