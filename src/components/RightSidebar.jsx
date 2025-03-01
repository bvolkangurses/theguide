import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaBars, FaNotesMedical, FaComments, FaRegLightbulb } from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import { useBooks } from '../contexts/BookContext';
import AudioPlayer from './AudioPlayer';
import ChatPopup from './ChatPopup';
import { getBookIdFromPath } from '../utils/bookIdMapper';
import { saveAudioToCache } from '../utils/audioCache';

const RightSidebar = ({ 
  isOpen, 
  onClose, 
  onOpen, 
  isMainAppPlaying, 
  highlightedNotes,
  defaultTab = 'chat',
  highlightChats,
  onChatUpdate
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { messages, addMessage, bookId: contextBookId } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);

  // Get current book for publication year and API calls
  const { currentBook } = useBooks();
  
  const publicationYear = currentBook?.publicationYear || new Date().getFullYear();
  
  // Use the consistent mapping function
  const bookId = getBookIdFromPath(currentBook?.path);

  useEffect(() => {
    if (isMainAppPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      setAudioUrl(null);
    }
  }, [isMainAppPlaying]);

  useEffect(() => {
    if (highlightedNotes?.length > 0) {
      setActiveTab('notes');
    }
  }, [highlightedNotes]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isOpen) onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInputValue('');
    if (!inputValue.trim()) return;

    // Use current year for user messages
    const currentDate = new Date();
    
    addMessage({
      text: inputValue,
      type: 'user',
      timestamp: {
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
        year: currentDate.getFullYear(),
        bookId: bookId // Add bookId
      }
    });
    
    try {
      const requestBody = { 
        messages: [{ role: 'user', content: inputValue }],
        bookId: bookId // This should now be consistent
      };
      
      
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.body) {
        console.error('ReadableStream not supported in this browser.');
        return;
      }

      let accumulatedResponse = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const completeMessage = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const prefix = 'data: ';
          if (completeMessage.startsWith(prefix)) {
            const jsonStr = completeMessage.replace(prefix, '').trim();
            if (jsonStr === '[DONE]') break;
            try {
              const parsedData = JSON.parse(jsonStr);
              if (parsedData.audio) {
                // Save audio with bookId for reuse
                if (parsedData.audio.audioText) {
                  saveAudioToCache(
                    parsedData.audio.audioText, 
                    { 
                      audio: parsedData.audio.audioUrl,
                      duration: parsedData.audio.duration || 0
                    },
                    bookId
                  );
                }
                
                setAudioUrl(parsedData.audio.audioUrl);
                if (audioRef.current) audioRef.current.pause();
                const audio = new Audio(parsedData.audio);
                audioRef.current = audio;
                audio.onplay = () => setIsAudioPlaying(true);
                audio.onended = () => setIsAudioPlaying(false);
              } else if (parsedData.text) {
                accumulatedResponse += parsedData.text + ' ';
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
      if (accumulatedResponse) {
        // Use publication year for assistant messages
        const assistantDate = new Date();
        assistantDate.setFullYear(publicationYear);
        
        addMessage({
          text: accumulatedResponse.trim(),
          type: 'assistant',
          timestamp: {
            date: assistantDate.toLocaleDateString(),
            time: assistantDate.toLocaleTimeString(),
            year: publicationYear,
            bookId: bookId // Add bookId
          }
        });
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
    }
  };

  // Format timestamp appropriately for each message type
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return `${timestamp.date} · ${timestamp.time}`;
  };

  return (
    <div className={`sidebar-right ${isOpen ? 'open' : ''}`} onClick={handleClick}>
      {!isOpen && <FaBars className="open-icon" />}
      
      <AudioPlayer
        audioUrl={audioUrl}
        setIsAudioPlaying={setIsAudioPlaying}
        audioRef={audioRef}
        audioDuration={audioDuration}
      />
      
      <div className="glow-stick-container">
        <div className={`glow-stick ${isAudioPlaying ? 'glowing' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="sidebar-content">
          <h2>Notebook</h2>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'notes' ? 'active' : ''}`} 
              onClick={() => setActiveTab('notes')}
            >
              <FaRegLightbulb /> Notes
            </button>
            <button 
              className={`tab ${activeTab === 'chat' ? 'active' : ''}`} 
              onClick={() => setActiveTab('chat')}
            >
              <FaComments /> Chat
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'notes' && (
              <div className="notes-content">
                <div className="highlights-list">
                  {highlightedNotes?.length > 0 ? (
                    highlightedNotes.map(note => (
                      <div key={note.id} className="highlight-note" onClick={() => setActiveHighlight(note)}>
                        <div className="highlight-timestamp">{note.timestamp}</div>
                        <div className="highlight-text">{note.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No highlights yet. Select text in the book to highlight.</p>
                    </div>
                  )}
                </div>
                {activeHighlight && (
                  <ChatPopup
                    highlightedText={activeHighlight.text}
                    highlightId={activeHighlight.id}
                    onClose={() => setActiveHighlight(null)}
                    messages={highlightChats[activeHighlight.id] || []}
                    onChatUpdate={onChatUpdate}
                  />
                )}
              </div>
            )}
            {activeTab === 'chat' && (
              <div className="chat-content">
                <div className="chat-messages">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index} className={`chat-message-container ${msg.type}`}>
                        {msg.timestamp && (
                          <div className="chat-timestamp">
                            {formatTimestamp(msg.timestamp)}
                          </div>
                        )}
                        <div className="chat-message">{msg.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>Start a conversation with the author.</p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="chat-input-form">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="chat-input"
                    autoComplete="off"
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
