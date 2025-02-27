import React from 'react';

const AudioProgressBar = React.memo(({ audioDuration, audioProgress, audioRef, isAudioPlaying }) => {
  const progress = audioProgress;
  
  // Format time from seconds to MM:SS format
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds && timeInSeconds !== 0) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate current time based on progress percentage
  const currentTime = audioDuration ? (audioProgress / 100) * audioDuration : 0;
  
  const handleClick = (e) => {
    if (!audioRef?.current || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * audioDuration;
    audioRef.current.currentTime = newTime;
    
    // Only play if audio was already playing before the click
    if (isAudioPlaying) {
      audioRef.current.play().catch(err => console.error("Error playing audio:", err));
    }
  };

  const handleMouseDown = (e) => {
    if (!audioRef?.current || !audioDuration) return;
    const wasPlaying = !audioRef.current.paused;
    const rect = e.currentTarget.getBoundingClientRect();
    
    const updateTime = (clientX) => {
      const relativeX = clientX - rect.left;
      const newTime = (relativeX / rect.width) * audioDuration;
      audioRef.current.currentTime = newTime;
    };
    
    const handleMouseMove = (e) => updateTime(e.clientX);
    
    const handleMouseUp = (e) => {
      updateTime(e.clientX);
      // Only play if audio was already playing before the drag started
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className="audio-progress-container"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        height: '5px',
        cursor: 'pointer',
        background: '#ddd',
        position: 'fixed',
        left: 0,
        width: '100%',
        zIndex: 1001,
        transition: 'height 0.2s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.height = '30px')}
      onMouseLeave={(e) => (e.currentTarget.style.height = '5px')}
    >
      <div
        className="audio-progress-bar"
        style={{
          width: `${progress}%`,
          height: '100%',
          background: 'gray',
          transition: 'none'
        }}
      />
      
      {/* Time display container - only visible on hover */}
      <div 
        className="audio-time-display"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          position: 'absolute',
          bottom: '5px',
          fontSize: '12px',
          color: '#333',
          padding: '0 10px',
          boxSizing: 'border-box',
          opacity: 0,
          transition: 'opacity 0.1s ease',
          userSelect: 'none', // Disable text selection
          WebkitUserSelect: 'none', // For Safari
          MozUserSelect: 'none', // For Firefox
          msUserSelect: 'none', // For IE/Edge
          pointerEvents: 'none', // Prevent interaction with the time display
        }}
        ref={el => {
          if (el) {
            const parent = el.parentElement;
            if (parent) {
              parent.onmouseenter = () => {
                el.style.opacity = '1';
              };
              parent.onmouseleave = () => {
                el.style.opacity = '0';
              };
            }
          }
        }}
      >
        {/* Start time */}
        <span>{formatTime(0)}</span>
        
        {/* Current time */}
        <span>{formatTime(currentTime)}</span>
        
        {/* End time */}
        <span>{formatTime(audioDuration)}</span>
      </div>
    </div>
  );
});

export default AudioProgressBar;
