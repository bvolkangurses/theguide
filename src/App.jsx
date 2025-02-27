import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatProvider, useChat } from './contexts/ChatContext';
import './App.css';
import TextInput from './components/TextInput';
import TextDisplay from './components/TextDisplay';
import GlowStick from './components/GlowStick';
import FeynmanLectures from './pages/FeynmanLectures';
import AudioPlayer from './components/AudioPlayer';
import AudioPlayerMain from './components/AudioPlayerMain';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar'; // Add this import
import HighlightPopup from './components/HighlightPopup'; // Add this import
// import useMouseEvents from './hooks/useMouseEvents'; // Remove this import
import useClickEvents from './hooks/useClickEvents';
import useTextEvents from './hooks/useTextEvents';
import useEffectHooks from './hooks/useEffectHooks';
import useSelectionEvents from './hooks/useSelectionEvents'; // Add this import
import { FaBook, FaUser, FaTimes, FaBars } from 'react-icons/fa'; // Ensure these imports are present
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Updated imports
import useLocalStorage from './hooks/useLocalStorage';
import AudioProgressBar from './components/AudioProgressBar';
import { saveAudioToCache, getAudioFromCache, cleanupAudioCache, clearAudioCache } from './utils/audioCache';
import { saveNarrationPosition, loadNarrationPosition, clearNarrationPosition } from './utils/narrationPositionManager';

function AppContent() {
  // Replace useState with useLocalStorage for persistent states
  const [texts, setTexts] = useLocalStorage('texts', []);
  const [highlightedNotes, setHighlightedNotes] = useLocalStorage('highlightedNotes', []);
  const [currentText, setCurrentText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0, maxWidth: 0 });
  const [isInputEditing, setIsInputEditing] = useState(false); // Rename for clarity
  const inputRef = useRef(null);
  const [pendingLLMText, setPendingLLMText] = useState(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false); // Update state
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // Add state
  const [isMainAppPlaying, setIsMainAppPlaying] = useState(false);
  const [highlightChats, setHighlightChats] = useState({});

  // Add bookContainerRef
  const bookContainerRef = useRef(null);

  // Rename narration-related state variables with "Main" suffix
  const [audioUrlMain, setAudioUrlMain] = useState(null);
  const [audioDurationMain, setAudioDurationMain] = useState(0);
  const [isAudioPlayingMain, setIsAudioPlayingMain] = useState(false);
  const [audioRefMain] = useState(useRef(null));
  const [audioProgressMain, setAudioProgressMain] = useState(0);
  const [paragraphsMain, setParagraphsMain] = useState([]);
  const [currentParagraphIndexMain, setCurrentParagraphIndexMain] = useState(0);
  const [nextAudioUrlMain, setNextAudioUrlMain] = useState(null);
  const [nextAudioDurationMain, setNextAudioDurationMain] = useState(0);
  const [isPreloadingMain, setIsPreloadingMain] = useState(false);
  const [isWaitingForNextParagraphMain, setIsWaitingForNextParagraphMain] = useState(false);
  const [showProgressBarMain, setShowProgressBarMain] = useState(false);

  
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioRef] = useState(useRef(null));

  // Clean up audio cache when component mounts
  useEffect(() => {
    cleanupAudioCache();
  }, []);

  // Add effect to resume audio when isAudioPlayingMain becomes true and audioRef already exists
  useEffect(() => {
    if (isAudioPlayingMain && audioRefMain.current) {
      audioRefMain.current.play().catch(err => {
        // Silent catch
      });
    }
  }, [isAudioPlayingMain, audioRefMain]);

  // Add an effect to save narration position when it changes
  useEffect(() => {
    // Only save when actually playing audio and we have a valid position
    if (isAudioPlayingMain && audioRefMain.current && paragraphsMain.length > 0) {
      const position = {
        paragraphIndex: currentParagraphIndexMain,
        timePosition: audioRefMain.current.currentTime || 0,
        paragraphText: paragraphsMain[currentParagraphIndexMain]
      };
      
      saveNarrationPosition(position);
    }
  }, [
    currentParagraphIndexMain, 
    isAudioPlayingMain,
    // We use audioProgressMain as a proxy for time changes
    audioProgressMain
  ]);
  
  // Periodically save position (every 5 seconds) when playing
  useEffect(() => {
    let saveInterval;
    
    if (isAudioPlayingMain && audioRefMain.current) {
      saveInterval = setInterval(() => {
        const position = {
          paragraphIndex: currentParagraphIndexMain,
          timePosition: audioRefMain.current.currentTime || 0,
          paragraphText: paragraphsMain[currentParagraphIndexMain]
        };
        
        saveNarrationPosition(position);
      }, 5000); // Save every 5 seconds
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isAudioPlayingMain, currentParagraphIndexMain, paragraphsMain]);

  // Handler for audio ended event - extract this from the useEffect
  const handleAudioEndedMain = useCallback(async () => {
    // If we have more paragraphs
    if (currentParagraphIndexMain < paragraphsMain.length - 1) {
      // If we've already preloaded the next paragraph
      if (nextAudioUrlMain) {
        setCurrentParagraphIndexMain(prevIndex => prevIndex + 1);
        setAudioUrlMain(nextAudioUrlMain);
        setAudioDurationMain(nextAudioDurationMain);
        setNextAudioUrlMain(null);
        setNextAudioDurationMain(0);
      } 
      // If we haven't preloaded the next paragraph, set waiting state and fetch it
      else {
        const nextIndex = currentParagraphIndexMain + 1;
        
        // Set waiting state to true so we don't replay the current paragraph
        setIsWaitingForNextParagraphMain(true);
        
        try {
          // Increment paragraph index before fetch to prevent race conditions
          setCurrentParagraphIndexMain(nextIndex);
          
          // Reset the current audio URL to prevent replay
          setAudioUrlMain(null);
          
          // Check cache first
          const paragraphText = paragraphsMain[nextIndex];
          const cachedAudio = getAudioFromCache(paragraphText);
          
          if (cachedAudio) {
            // Use cached audio if available
            setAudioUrlMain(cachedAudio.audio);
            setAudioDurationMain(cachedAudio.duration);
            setIsAudioPlayingMain(true);
            setIsWaitingForNextParagraphMain(false);
          } else {
            // Otherwise, fetch from API
            const response = await fetch('http://localhost:3000/synthesize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: paragraphText }),
            });
            
            if (!response.ok) {
              setIsWaitingForNextParagraphMain(false);
              return;
            }
            
            const data = await response.json();
            if (data.audio && data.duration) {
              // Save to cache before using
              saveAudioToCache(paragraphText, data);
              
              setAudioUrlMain(data.audio);
              setAudioDurationMain(data.duration);
              setIsAudioPlayingMain(true);
              setIsWaitingForNextParagraphMain(false);
            } else {
              setIsWaitingForNextParagraphMain(false);
            }
          }
        } catch (error) {
          setIsWaitingForNextParagraphMain(false);
        }
      }
    } else {
      // At end of all paragraphs
      setIsAudioPlayingMain(false);
    }
  }, [currentParagraphIndexMain, paragraphsMain, nextAudioUrlMain, nextAudioDurationMain]);

  // Effect to monitor progress and preload next paragraph
  useEffect(() => {
    const preloadNextParagraph = async () => {
      if (isPreloadingMain || !paragraphsMain.length || currentParagraphIndexMain >= paragraphsMain.length - 1) return;
      
      setIsPreloadingMain(true);
      
      try {
        const nextIndex = currentParagraphIndexMain + 1;
        const paragraphText = paragraphsMain[nextIndex];
        
        // Check cache first for preloading
        const cachedAudio = getAudioFromCache(paragraphText);
        
        if (cachedAudio) {
          // Use cached audio if available
          setNextAudioUrlMain(cachedAudio.audio);
          setNextAudioDurationMain(cachedAudio.duration);
        } else {
          // Otherwise, fetch from API
          const response = await fetch('http://localhost:3000/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: paragraphText }),
          });
          
          if (!response.ok) {
            return;
          }
          
          const data = await response.json();
          if (data.audio && data.duration) {
            // Save to cache before using
            saveAudioToCache(paragraphText, data);
            
            setNextAudioUrlMain(data.audio);
            setNextAudioDurationMain(data.duration);
          }
        }
      } catch (error) {
        // Silent catch
      } finally {
        setIsPreloadingMain(false);
      }
    };

    // If we're at 75% progress and not already preloading, preload the next paragraph
    if (isAudioPlayingMain && audioProgressMain >= 75 && !isPreloadingMain && !nextAudioUrlMain) {
      preloadNextParagraph();
    }
  }, [audioProgressMain, isAudioPlayingMain, paragraphsMain, currentParagraphIndexMain, isPreloadingMain, nextAudioUrlMain]);

  // Replace the old handleToggleNarration with a sequential one:
  const handleToggleNarrationMain = async () => {
    if (isAudioPlaying) { return }
    
    if (isAudioPlayingMain) {
      // Pause without resetting the audio URL so it resumes later
      if (audioRefMain.current) {
        audioRefMain.current.pause();
      }
      setIsAudioPlayingMain(false);
      return;
    }
    
    // If audioUrl already exists, resume playing
    if (audioUrlMain) {
      setIsAudioPlayingMain(true);
      setShowProgressBarMain(true); // Show progress bar when resuming
      return;
    }
    
    // Otherwise, synthesize audio as before:
    const text = bookContainerRef.current?.innerText.trim();
    if (text && text.length > 0) {
      const allParagraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      setParagraphsMain(allParagraphs);
      
      // Try to restore saved position
      const savedPosition = loadNarrationPosition();
      let startParagraphIndex = 0;
      let startTimePosition = 0;
      
      // Validate saved position
      if (savedPosition && savedPosition.paragraphText) {
        // Find the saved paragraph in the current text
        const matchIndex = allParagraphs.findIndex(p => 
          p.trim() === savedPosition.paragraphText.trim()
        );
        
        if (matchIndex >= 0) {
          startParagraphIndex = matchIndex;
          startTimePosition = savedPosition.timePosition || 0;
        }
      }
      
      setCurrentParagraphIndexMain(startParagraphIndex);
      setShowProgressBarMain(true);
      
      if (allParagraphs.length > 0) {
        setIsAudioPlayingMain(true);
        const paragraphText = allParagraphs[startParagraphIndex];
        
        try {
          // Check cache first
          const cachedAudio = getAudioFromCache(paragraphText);
          
          if (cachedAudio) {
            // Use cached audio if available
            setAudioUrlMain(cachedAudio.audio);
            setAudioDurationMain(cachedAudio.duration);
            
            // Set timer to seek to the saved position after audio is loaded
            setTimeout(() => {
              if (audioRefMain.current && startTimePosition > 0) {
                audioRefMain.current.currentTime = startTimePosition;
              }
            }, 100);
          } else {
            // Otherwise, fetch from API
            const response = await fetch('http://localhost:3000/synthesize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: paragraphText }),
            });
            
            if (!response.ok) {
              return;
            }
            
            const data = await response.json();
            if (data.audio && data.duration) {
              // Save to cache before using
              saveAudioToCache(paragraphText, data);
              
              setAudioUrlMain(data.audio);
              setAudioDurationMain(data.duration);
              
              // Set timer to seek to the saved position after audio is loaded
              setTimeout(() => {
                if (audioRefMain.current && startTimePosition > 0) {
                  audioRefMain.current.currentTime = startTimePosition;
                }
              }, 100);
            }
          }
        } catch (error) {
          // Silent catch
        }
      }
    }
  };

  // Add handlers for skipping forward and backward
  const handleSkipForward = () => {
    if (audioRefMain.current) {
      // Skip forward 10 seconds, but don't exceed the audio duration
      const newTime = Math.min(
        audioRefMain.current.currentTime + 10, 
        audioDurationMain || audioRefMain.current.duration || 0
      );
      audioRefMain.current.currentTime = newTime;
    }
  };

  const handleSkipBackward = () => {
    if (audioRefMain.current) {
      // Skip backward 10 seconds, but don't go below 0
      const newTime = Math.max(audioRefMain.current.currentTime - 10, 0);
      audioRefMain.current.currentTime = newTime;
    }
  };

  // useMouseEvents(); // Remove this hook invocation
  useClickEvents(setTextPosition, setCurrentText, setIsInputEditing, inputRef, isAudioPlaying || isAudioPlayingMain);
  const { handleTextChange, handleTextSubmit, handleKeyPress } = useTextEvents(
    setTexts, 
    currentText, 
    setCurrentText, 
    setIsInputEditing, 
    inputRef, 
    textPosition,
    setAudioUrl, 
    setPendingLLMText,
    bookContainerRef // Add this parameter
  );
  useEffectHooks(null, null, audioRef, pendingLLMText, setTexts);

  const { addMessage } = useChat(); // Add this hook
  const handleHighlightAdd = useCallback((note) => {
    setHighlightedNotes(prev => [...prev, note]);
    setIsRightSidebarOpen(true);
  }, []);

  const handleHighlightRemove = useCallback((highlightId) => {
    setHighlightedNotes(prev => prev.filter(note => note.id !== highlightId));
  }, []);

  const handleChatUpdate = useCallback((highlightId, messages) => {
    setHighlightChats(prev => ({
      ...prev,
      [highlightId]: messages
    }));
  }, []);

  const { 
    popupPosition, 
    handleHighlight, 
    handleRemoveHighlight, 
    handleEditHighlight,
    isEditing: isHighlightEditing // Rename in destructuring
  } = useSelectionEvents(handleHighlightAdd, handleHighlightRemove); // Add selection events hook

  // Add click handler for outside clicks
  const handleOutsideClick = (e) => {
    // Check if click is in the book content or container
    const isClickInSidebar = e.target.closest('.sidebar-right') || e.target.closest('.sidebar-left');
    
    // Close sidebars if clicking in content area or anywhere else except sidebars
    if (!isClickInSidebar) {
      setIsRightSidebarOpen(false);
      setIsLeftSidebarOpen(false);
    }

    // Handle text input separately
    if (!e.target.closest('.text-input')) {
      setIsInputEditing(false); // Use renamed state
      setCurrentText('');
    }
  };

  const handleClear = () => {
    localStorage.clear();
    clearNarrationPosition(); // Clear narration position
    setTexts([]);
    setHighlightedNotes([]);
  };

  const handleClearTextsOnly = () => {
    setTexts([]);
    window.localStorage.removeItem('texts');
  };

  return (
    <div className="app-container" onClick={handleOutsideClick}>
      <Sidebar 
        isOpen={isLeftSidebarOpen} 
        onClose={() => setIsLeftSidebarOpen(false)} 
        onOpen={() => setIsLeftSidebarOpen(true)}
        onClearTexts={handleClearTextsOnly} 
      />

      <Routes>
        <Route path="/" element={
          <>
            {/* Add ref to FeynmanLectures */}
            <div ref={bookContainerRef}>
              <FeynmanLectures 
                onToggleNarration={handleToggleNarrationMain}
                isAudioPlaying={isAudioPlayingMain}
              />
            </div>
            <RightSidebar 
              isOpen={isRightSidebarOpen}
              onClose={() => setIsRightSidebarOpen(false)}
              onOpen={() => setIsRightSidebarOpen(true)}
              isMainAppPlaying={isMainAppPlaying}
              highlightedNotes={highlightedNotes}
              defaultTab="notes"
              highlightChats={highlightChats}
              onChatUpdate={handleChatUpdate}
            />
            <TextDisplay texts={texts} />
            {isInputEditing && ( // Use renamed state
              <TextInput
                textPosition={textPosition}
                currentText={currentText}
                setCurrentText={setCurrentText}
                handleTextChange={handleTextChange}
                handleKeyPress={handleKeyPress}
                inputRef={inputRef}
              />
            )}
            {/* Conditionally render AudioProgressBar based on flag */}
            
              <AudioProgressBar 
                isAudioPlaying={isAudioPlayingMain}
                audioDuration={audioDurationMain}
                audioProgress={audioProgressMain}
                audioRef={audioRefMain}
              />
            
            <GlowStick 
              isAudioPlaying={isAudioPlayingMain || isAudioPlaying} 
              onToggleAudio={handleToggleNarrationMain}
              onSkipForward={handleSkipForward}
              onSkipBackward={handleSkipBackward}
            />
            <AudioPlayerMain
              audioUrl={audioUrlMain}
              setIsAudioPlaying={setIsAudioPlayingMain}
              audioRef={audioRefMain}
              setMainAppPlaying={setIsMainAppPlaying} // Add this prop
              audioDuration={audioDurationMain}
              onProgress={setAudioProgressMain}
              onAudioEnded={handleAudioEndedMain} // Pass the handler as a prop
              isWaitingForNextParagraph={isWaitingForNextParagraphMain}
              enableProgressTracking={showProgressBarMain} // Pass the flag to AudioPlayer
            />
            <AudioPlayer
              audioUrl={audioUrl}
              setIsAudioPlaying={setIsAudioPlaying}
              audioRef={audioRef}
            />
            {popupPosition && (
              <HighlightPopup
                position={popupPosition}
                onHighlight={handleHighlight}
                onRemove={handleRemoveHighlight}
                onEdit={handleEditHighlight}
                isEditing={isHighlightEditing} // Use renamed prop
              />
            )}
          </>
        } />
      </Routes>
    </div>
  );
}

// Main App component now just provides context
function App() {
  return (
    <Router>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </Router>
  );
}

export default App;