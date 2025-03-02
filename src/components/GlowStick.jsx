import React from 'react';
import { FaPlay, FaPause, FaUndo, FaRedo } from 'react-icons/fa';

const GlowStick = ({ 
  isAudioPlaying, 
  onToggleAudio, 
  onSkipForward,
  onSkipBackward 
}) => {
  return (
    <div className="glow-stick-container">
      <div
        className={`glow-stick ${isAudioPlaying ? 'glowing' : ''}`}
      >
        <div className="controls">
          <button 
            className="control-btn skip-backward"
            onClick={onSkipBackward}
            aria-label="Skip backward 10 seconds"
          >
            <FaUndo />
          </button>
          
          <button 
            className="control-btn play-pause"
            onClick={onToggleAudio}
            aria-label={isAudioPlaying ? 'Pause' : 'Play'}
          >
            {isAudioPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button 
            className="control-btn skip-forward"
            onClick={onSkipForward}
            aria-label="Skip forward 10 seconds"
          >
            <FaRedo />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlowStick;