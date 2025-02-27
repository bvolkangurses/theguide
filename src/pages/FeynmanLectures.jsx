import React from 'react';

const FeynmanLectures = ({ onToggleNarration, isAudioPlaying }) => (
  <div className="book-page">
    <div className="book-container">
      <h1 className='h1' style={{ textAlign: 'center' }}>The Feynman Lectures On Physics</h1>
      <div className="book-content narrow-text scrollable">
        <div id="Ch1-S1-p1" className="para">
          <p className="p">This two-year course in physics</p>
        </div>
      </div>
    </div>
  </div>
);

export default FeynmanLectures;