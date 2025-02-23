import { useState, useRef, useCallback } from 'react';
import { ChatProvider, useChat } from './contexts/ChatContext';
import './App.css';
import TextInput from './components/TextInput';
import TextDisplay from './components/TextDisplay';
import GlowStick from './components/GlowStick';
import FeynmanLectures from './pages/FeynmanLectures';
import AudioPlayer from './components/AudioPlayer';
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

function AppContent() {
  // Replace useState with useLocalStorage for persistent states
  const [texts, setTexts] = useLocalStorage('texts', []);
  const [highlightedNotes, setHighlightedNotes] = useLocalStorage('highlightedNotes', []);
  const [currentText, setCurrentText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0, maxWidth: 0 });
  const [isInputEditing, setIsInputEditing] = useState(false); // Rename for clarity
  const inputRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [pendingLLMText, setPendingLLMText] = useState(null);
  const audioRef = useRef(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false); // Update state
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // Add state
  const [isMainAppPlaying, setIsMainAppPlaying] = useState(false);
  const [highlightChats, setHighlightChats] = useState({});

  // Add bookContainerRef
  const bookContainerRef = useRef(null);

  // Replace the old handleToggleNarration with a sequential one:
  const handleToggleNarration = async () => {
    if (isAudioPlaying) {
      // If audio is playing, pause it
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsAudioPlaying(false);
      setAudioUrl(null);
      return;
    }

    const text = bookContainerRef.current?.innerText.trim();
    if (text && text.length > 0) {
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      setIsAudioPlaying(true);
      for (const para of paragraphs) {
        console.log("Feeding text for synthesis:", para);
        try {
          const response = await fetch('http://localhost:3000/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: para }),
          });
          if (!response.ok) {
            console.error('Failed to fetch audio for a paragraph');
            continue;
          }
          const data = await response.json();
          if (data.audio) {
            setAudioUrl(data.audio);
          } else {
            console.error('No audio data for paragraph');
          }
        } catch (error) {
          console.error('Error fetching audio for paragraph:', error);
        }
      }
    } else {
      console.error("No text found in the book container");
    }
  };

  // useMouseEvents(); // Remove this hook invocation
  useClickEvents(setTextPosition, setCurrentText, setIsInputEditing, inputRef, isAudioPlaying);
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
              <FeynmanLectures onToggleNarration={handleToggleNarration} />
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
            <GlowStick isAudioPlaying={isAudioPlaying} />
            <AudioPlayer
              audioUrl={audioUrl}
              setIsAudioPlaying={setIsAudioPlaying}
              audioRef={audioRef}
              setMainAppPlaying={setIsMainAppPlaying} // Add this prop
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