import React from 'react';

const GlowStick = ({ isAudioPlaying }) => {
  return (
    <div
      className={`glow-stick ${isAudioPlaying ? 'glowing' : ''}`}
    ></div>
  );
};

export default GlowStick;