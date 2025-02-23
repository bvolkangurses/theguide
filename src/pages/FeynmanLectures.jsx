import React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

const FeynmanLectures = ({ onToggleNarration, isPlaying }) => (
  <div className="book-page">
    <div className="book-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button 
          onClick={onToggleNarration} 
          className="narration-button"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>
      <h1 className='h1' style={{ textAlign: 'center' }}>The Feynman Lectures On Physics</h1>
      <div className="book-content narrow-text scrollable">
        <div id="Ch1-S1-p1" className="para">
          <p className="p">This two-year course in physics is presented from the point
          of view that you, the reader, are going to be a physicist. This is not
          necessarily the case of course, but that is what every professor in
          every subject assumes! If you are going to be a physicist, you will have
          a lot to study: two hundred years of the most rapidly developing field
          of knowledge that there is. So much knowledge, in fact, that you might
          think that you cannot learn all of it in four years, and truly you
          cannot; you will have to go to graduate school too!</p>
        </div>
      </div>
    </div>
  </div>
);

export default FeynmanLectures;