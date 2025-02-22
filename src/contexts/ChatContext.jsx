import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(() => {
    try {
      const item = window.localStorage.getItem('chatMessages');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading chatMessages from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error writing chatMessages to localStorage:', error);
    }
  }, [messages]);

  const addMessage = (message) => {
    if (!message.timestamp) {
      const now = new Date();
      message.timestamp = { date: now.toLocaleDateString(), time: now.toLocaleTimeString() };
    }
    setMessages(prev => [...prev, message]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
