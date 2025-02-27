import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaBars, FaNotesMedical, FaComments } from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import AudioPlayer from './AudioPlayer';
import ChatPopup from './ChatPopup';

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
  const { messages, addMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);

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
    setInputValue(''); // clear immediately upon submit
    if (!inputValue.trim()) return;

    const timestamp = new Date();
    addMessage({
      text: inputValue,
      type: 'user',
      timestamp: {
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString()
      }
    });
    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: inputValue }],
          source: 'sidebar'
        }),
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
        const ts = new Date();
        addMessage({
          text: accumulatedResponse.trim(),
          type: 'assistant',
          timestamp: {
            date: ts.toLocaleDateString(),
            time: ts.toLocaleTimeString()
          }
        });
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
    }
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
        <>
          <div className="tabs">
            <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
              <FaNotesMedical /> Notes
            </button>
            <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <FaComments /> Chat
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'notes' && (
              <div className="notes-content">
                <div className="highlights-list">
                  {highlightedNotes?.map(note => (
                    <div key={note.id} className="highlight-note" onClick={() => setActiveHighlight(note)}>
                      <div className="highlight-timestamp">{note.timestamp}</div>
                      <div className="highlight-text">{note.text}</div>
                    </div>
                  ))}
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
                  {messages.map((msg, index) => (
                    <div key={index} className={`chat-message-container ${msg.type}`}>
                      {msg.timestamp && (
                        <div className="chat-timestamp">
                          {msg.timestamp.date} at {msg.timestamp.time}
                        </div>
                      )}
                      <div className="chat-message">{msg.text}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="chat-input-form">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="chat-input"
                  />
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RightSidebar;
