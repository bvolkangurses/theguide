import React, { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const BriefHistoryOfTime = ({ onToggleNarration, isAudioPlaying }) => {
  const { setCurrentBookByPath } = useBooks();

  // Set current book when component mounts
  useEffect(() => {
    setCurrentBookByPath('/brief-history-of-time');
  }, [setCurrentBookByPath]);

  return (
    <div className="book-page">
      <div className="book-container">
        <h1 className='h1' style={{ textAlign: 'center' }}>A Brief History of Time</h1>
        <div className="book-content narrow-text scrollable">
          <div id="summary" className="para">
            <p className="p">First published in 1988, this landmark book made complex concepts like the Big Bang, black holes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefHistoryOfTime;
