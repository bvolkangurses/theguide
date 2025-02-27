import React, { useEffect } from 'react';

const AudioPlayer = ({ audioUrl, setIsAudioPlaying, audioRef, audioDuration, onProgress, initialTime = 0 }) => {
  useEffect(() => {
    let isCurrentAudio = true;
    let animationFrameId;

    const updateProgress = () => {
      if (audioRef.current && audioDuration) {
        const progress = (audioRef.current.currentTime / audioDuration) * 100;
        onProgress(progress);
      }
    };

    const setupAudio = async () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        if (!audioUrl || !isCurrentAudio) return;

        const audio = new Audio(audioUrl);
        
        if (initialTime > 0) {
          audio.currentTime = initialTime;
        }

        // Add timeupdate listener to track progress
        audio.ontimeupdate = () => {
          if (onProgress && audioDuration) {
            const progress = (audio.currentTime / audioDuration) * 100;
            onProgress(progress);
          }
        };
        
        // Set up event listeners
        audio.onplay = () => {
          if (isCurrentAudio && setIsAudioPlaying ) {
            setIsAudioPlaying(true);
          }
        };
        
        audio.onpause = () => {
          if (isCurrentAudio) {
            setIsAudioPlaying(false);
            // Do not reset audioRef to preserve currentTime
          }
        };

        audio.onended = () => {
          if (isCurrentAudio) {
            setIsAudioPlaying(false);
            audioRef.current = null; // Reset on ended
          }
        };

        audio.onerror = () => {
          if (isCurrentAudio && setIsAudioPlaying ) {
            setIsAudioPlaying(false);
            audioRef.current = null;
          }
        };

        // Set current audio before playing
        audioRef.current = audio;
        await audio.play();
        animationFrameId = requestAnimationFrame(updateProgress);
      } catch (error) {
        if (isCurrentAudio && setIsAudioPlaying ) {
          setIsAudioPlaying(false);
          audioRef.current = null;
        }
      }
    };

    setupAudio();

    return () => {
      isCurrentAudio = false;
      cancelAnimationFrame(animationFrameId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, setIsAudioPlaying, audioDuration, onProgress, initialTime]);

  return null;
};

export default AudioPlayer;