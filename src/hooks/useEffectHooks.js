import { useEffect } from 'react';

const useEffectHooks = (audioUrl, setIsAudioPlaying, audioRef, pendingLLMText, setTexts) => {
  useEffect(() => {
    if (pendingLLMText && !audioRef.current) {
      setTexts(prevTexts => [...prevTexts, pendingLLMText]);
      setPendingLLMText(null);
    }
  }, [pendingLLMText, setTexts, audioRef]);
};

export default useEffectHooks;
