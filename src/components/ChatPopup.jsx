import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import { useBooks } from '../contexts/BookContext';
import AudioPlayer from './AudioPlayer';
import { getBookIdFromPath } from '../utils/bookIdMapper';
import { getBookSpecificKey } from '../utils/storageKeyManager';
import { saveAudioToCache } from '../utils/audioCache';

// New helper for localStorage persistence with book ID
const loadStoredMessages = (key, bookId, initialValue) => {
  try {
    const storageKey = getBookSpecificKey(key, bookId);
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : initialValue;
  } catch (e) {
    return initialValue;
  }
};

const saveStoredMessages = (key, bookId, value) => {
  try {
    const storageKey = getBookSpecificKey(key, bookId);
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving messages:', e);
  }
};

const ChatPopup = ({ 
  highlightedText, 
  highlightId,
  onClose, 
  messages: initialMessages,
  onChatUpdate 
}) => {
  const { currentBook } = useBooks();
  const bookId = getBookIdFromPath(currentBook?.path);
  
  // Use highlight and book specific key for localStorage
  const storageKey = `chatpopup_${highlightId}`;
  const [messages, setMessages] = useState(() => loadStoredMessages(storageKey, bookId, initialMessages));
  const [inputValue, setInputValue] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const { addMessage } = useChat();

  // Persist messages to localStorage on change with book ID
  useEffect(() => {
    saveStoredMessages(storageKey, bookId, messages);
    onChatUpdate(highlightId, messages);
  }, [messages, highlightId, onChatUpdate, storageKey, bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInputValue('');
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      type: 'user',
      timestamp: new Date().toLocaleString(),
      bookId: bookId // Add book ID to the message
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Regarding this text: "${highlightedText}"\n\n${inputValue}`
          }],
          bookId: bookId // Pass bookId to ensure correct voice
        }),
      });

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
            if (jsonStr === '[DONE]') continue;
            
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
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                const audio = new Audio(parsedData.audio);
                audioRef.current = audio;
                audio.onplay = () => setIsAudioPlaying(true);
                audio.onended = () => setIsAudioPlaying(false);
                audio.onerror = () => {
                  console.error('Error playing audio');
                  setIsAudioPlaying(false);
                };
                const playPromise = audio.play();
                if (playPromise) {
                  playPromise.catch(error => {
                    console.error('Error playing audio:', error);
                    setIsAudioPlaying(false);
                  });
                }
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
        const assistantMessage = {
          text: accumulatedResponse.trim(),
          type: 'assistant',
          timestamp: new Date().toLocaleString(),
          bookId: bookId // Add book ID to the message
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="chat-popup">
      <div className="chat-popup-header">
        <div className="highlighted-preview">{highlightedText.slice(0, 50)}...</div>
        <button className="close-btn" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="chat-popup-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            <div className="chat-timestamp">{msg.timestamp}</div>
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-popup-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about this highlight..."
          className="chat-popup-input"
        />
        <button type="submit" className="chat-popup-submit">
          <FaPaperPlane />
        </button>
      </form>
      <AudioPlayer
        audioUrl={audioUrl}
        setIsAudioPlaying={setIsAudioPlaying}
        audioRef={audioRef}
      />
      <div className="chat-popup-glow">
        <div className={`glow-stick ${isAudioPlaying ? 'glowing' : ''}`} />
      </div>
    </div>
  );
};

export default ChatPopup;
