import { useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';

const useTextEvents = (
  setTexts, 
  currentText, 
  setCurrentText, 
  setIsEditing, 
  inputRef, 
  textPosition, 
  setAudioUrl, 
  setPendingLLMText,
  bookContainerRef // Add this parameter
) => {
  const { addMessage } = useChat();

  const handleTextChange = useCallback((e) => {
    const textarea = e.target;
    const value = textarea.value;
    
    setCurrentText(value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [setCurrentText, inputRef]);

  const handleTextSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (inputRef.current && bookContainerRef.current) {
      // Get book container rect
      const bookContainerRect = bookContainerRef.current.getBoundingClientRect();
      
      // Add user message to chat with timestamp
      const timestamp = new Date();
      const message = {
        text: currentText,
        type: 'user',
        timestamp: {
          date: timestamp.toLocaleDateString(),
          time: timestamp.toLocaleTimeString()
        }
      };
      addMessage(message);

      const isLeftSide = e.clientX < window.innerWidth / 2;
      const maxWidth = isLeftSide ? bookContainerRect.left - e.clientX : window.innerWidth - e.clientX;
      const textWidth = inputRef.current.offsetWidth;
      const newText = {
        text: currentText,
        x: textPosition.x + 16,
        y: textPosition.y - 1,
        textAlign: 'left',
        width: textWidth,
        role: 'user',
        timestamp: new Date().toISOString() // Add timestamp for persistence
      };
      setTexts((prevTexts) => [...prevTexts, newText]);
      setCurrentText('');
      setIsEditing(false);

      try {
        const response = await fetch('http://localhost:3000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            messages: [{ role: 'user', content: currentText }],
            source: 'main' // Add source to identify where the request came from
          }),
        });

        if (!response.body) {
          console.error('ReadableStream not supported in this browser.');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = '';

        // Create temporary element to measure text height
        const measureDiv = document.createElement('pre');
        measureDiv.style.position = 'absolute';
        measureDiv.style.visibility = 'hidden';
        measureDiv.style.width = `${textWidth}px`;
        measureDiv.style.whiteSpace = 'pre-wrap';
        measureDiv.style.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';
        measureDiv.style.lineHeight = '1.5';
        measureDiv.style.margin = '0';
        measureDiv.style.padding = '0';
        measureDiv.textContent = currentText || ' '; // Use space if empty to get minimum height
        
        document.body.appendChild(measureDiv);
        const totalHeight = measureDiv.offsetHeight;
        document.body.removeChild(measureDiv);

        const llmResponse = {
          text: '',
          x: textPosition.x + 16,
          y: textPosition.y + totalHeight + 10,
          textAlign: 'left',
          width: textWidth,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        setTexts(prevTexts => [...prevTexts, llmResponse]);

        let accumulatedResponse = '';  // Add this to accumulate the assistant's response

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
              const completeMessage = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);
              const prefix = 'data: ';
              if (completeMessage.startsWith(prefix)) {
                const jsonStr = completeMessage.replace(prefix, '').trim();
                if (jsonStr === '[DONE]') {
                  // Add complete response to chat when done with timestamp
                  if (accumulatedResponse) {
                    const timestamp = new Date();
                    const responseMessage = {
                      text: accumulatedResponse.trim(),
                      type: 'assistant',
                      timestamp: {
                        date: timestamp.toLocaleDateString(),
                        time: timestamp.toLocaleTimeString()
                      }
                    };
                    addMessage(responseMessage);
                  }
                  done = true;
                  break;
                }
                try {
                  const parsedData = JSON.parse(jsonStr);

                  if (parsedData.audio) {
                    setAudioUrl(parsedData.audio); // Set the audio URL state
                  } else if (parsedData.text) {
                    // Accumulate the response text
                    accumulatedResponse += parsedData.text + ' ';
                    
                    setTexts(prevTexts => {
                      const updated = [...prevTexts];
                      const lastIndex = updated.length - 1;
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        text: updated[lastIndex].text + parsedData.text + ' ',
                      };
                      return updated;
                    });
                  }
                } catch (parseError) {
                  console.error('Error parsing JSON:', parseError);
                }
              }
              boundary = buffer.indexOf('\n\n');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
      }
    }
  }, [setTexts, currentText, setCurrentText, setIsEditing, inputRef, textPosition, setAudioUrl, setPendingLLMText, addMessage, bookContainerRef]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  }, [handleTextSubmit]);

  return { handleTextChange, handleTextSubmit, handleKeyPress };
};

export default useTextEvents;
