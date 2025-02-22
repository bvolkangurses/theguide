import React, { useEffect } from 'react';

const AudioPlayer = ({ audioUrl, setIsAudioPlaying, audioRef, setMainAppPlaying }) => {
  useEffect(() => {
    let isCurrentAudio = true;

    const setupAudio = async () => {
      try {
        // Clean up previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        if (!audioUrl || !isCurrentAudio) return;

        const audio = new Audio(audioUrl);
        
        // Set up event listeners
        audio.onplay = () => {
          if (isCurrentAudio && setIsAudioPlaying && setMainAppPlaying) {
            setIsAudioPlaying(true);
            setMainAppPlaying(true);
          }
        };
        
        audio.onended = audio.onpause = () => {
          if (isCurrentAudio && setIsAudioPlaying && setMainAppPlaying) {
            setIsAudioPlaying(false);
            setMainAppPlaying(false);
            audioRef.current = null;
          }
        };

        audio.onerror = () => {
          if (isCurrentAudio && setIsAudioPlaying && setMainAppPlaying) {
            console.error('Error playing audio');
            setIsAudioPlaying(false);
            setMainAppPlaying(false);
            audioRef.current = null;
          }
        };

        // Set current audio before playing
        audioRef.current = audio;
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        if (isCurrentAudio && setIsAudioPlaying && setMainAppPlaying) {
          setIsAudioPlaying(false);
          setMainAppPlaying(false);
          audioRef.current = null;
        }
      }
    };

    setupAudio();

    return () => {
      isCurrentAudio = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, setIsAudioPlaying, setMainAppPlaying]); // Add dependencies

  return null;
};

export default AudioPlayer;