import React, { useEffect } from 'react';

const AudioPlayerMain = ({
  audioUrl: audioUrlMain,
  setIsAudioPlaying: setIsAudioPlayingMain,
  audioRef: audioRefMain,
  audioDuration: audioDurationMain,
  onProgress: onProgressMain,
  onAudioEnded: onAudioEndedMain,
  isWaitingForNextParagraph: isWaitingForNextParagraphMain = false,
  enableProgressTracking: enableProgressTrackingMain = true,
  initialTime: initialTimeMain = 0
}) => {
  useEffect(() => {
    let isCurrentAudio = true;
    let animationFrameId = null;

    const updateProgress = () => {
      // Only update progress if tracking is enabled
      if (enableProgressTrackingMain && audioRefMain.current && audioDurationMain) {
        const progress = (audioRefMain.current.currentTime / audioDurationMain) * 100;
        onProgressMain(progress);
        
        // Continue the animation loop if tracking is enabled and audio is playing
        if (isCurrentAudio && audioRefMain.current && !audioRefMain.current.paused && enableProgressTrackingMain) {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
      }
    };

    const setupAudio = async () => {
      try {
        // Don't set up a new audio if we're waiting for the next paragraph
        // and there's no audioUrl available yet
        if (isWaitingForNextParagraphMain && !audioUrlMain) {
          return;
        }

        if (audioRefMain.current) {
          // Remove any existing event listeners to prevent memory leaks
          audioRefMain.current.removeEventListener('play', onPlay);
          audioRefMain.current.removeEventListener('pause', onPause);
          audioRefMain.current.removeEventListener('ended', onEnded);
          audioRefMain.current.pause();
          audioRefMain.current = null;
        }
        
        if (!audioUrlMain || !isCurrentAudio) return;

        const audio = new Audio(audioUrlMain);
        if (initialTimeMain > 0) {
          audio.currentTime = initialTimeMain;
        }
        
        // Define event handlers
        const onPlay = () => {
          if (isCurrentAudio) {
            setIsAudioPlayingMain(true);
            // Only start animation frame if progress tracking is enabled
            if (enableProgressTrackingMain) {
              animationFrameId = requestAnimationFrame(updateProgress);
            }
          }
        };
        
        const onPause = () => {
          if (isCurrentAudio) {
            setIsAudioPlayingMain(false);
            // Stop the animation loop when audio pauses
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        };
        
        const onEnded = () => {
          if (isCurrentAudio) {
            // Don't set isAudioPlaying to false here, let the parent component decide
            // based on whether there are more paragraphs to play
            
            // Stop the animation loop when audio ends
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
            
            // Call the onAudioEnded callback to handle next paragraph
            if (onAudioEndedMain) {
              onAudioEndedMain();
            }
          }
        };
        
        // We'll still keep this for backup and initial value setting
        audio.ontimeupdate = () => {
          // Only update if tracking is enabled
          if (enableProgressTrackingMain && onProgressMain && audioDurationMain && !animationFrameId) {
            const progress = (audio.currentTime / audioDurationMain) * 100;
            onProgressMain(progress);
          }
        };
        
        // Add event listeners
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        
        audioRefMain.current = audio;
        await audio.play();
        
        // Only start animation frame if progress tracking is enabled
        if (enableProgressTrackingMain) {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
      } catch (error) {
        if (isCurrentAudio) {
          setIsAudioPlayingMain(false);
          audioRefMain.current = null;
        }
      }
    };

    setupAudio();
    
    return () => {
      isCurrentAudio = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (audioRefMain.current) {
        // Clean up event listeners
        audioRefMain.current.removeEventListener('play', audioRefMain.current.onplay);
        audioRefMain.current.removeEventListener('pause', audioRefMain.current.onpause);
        audioRefMain.current.removeEventListener('ended', audioRefMain.current.onended);
        audioRefMain.current.pause();
        audioRefMain.current = null;
      }
    };
  }, [audioUrlMain, setIsAudioPlayingMain, audioDurationMain, onProgressMain, initialTimeMain, audioRefMain, onAudioEndedMain, isWaitingForNextParagraphMain, enableProgressTrackingMain]);

  return null;
};

export default AudioPlayerMain;