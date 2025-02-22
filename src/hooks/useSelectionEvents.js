import { useState, useEffect, useCallback } from 'react';

const useSelectionEvents = (onHighlightAdd, onHighlightRemove) => {
  const [selection, setSelection] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleHighlight = useCallback(() => {
    if (selection) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      const highlightId = Date.now().toString();
      span.className = 'highlighted-text';
      span.dataset.highlightId = highlightId;
      range.surroundContents(span);
      
      // Add highlighted text to notes
      const highlightedText = range.toString();
      const timestamp = new Date();
      onHighlightAdd({
        id: highlightId,
        text: highlightedText,
        timestamp: timestamp.toLocaleString(),
      });

      setSelection(null);
      setPopupPosition(null);
    }
  }, [selection, onHighlightAdd]);

  const handleRemoveHighlight = useCallback(() => {
    if (selection) {
      const highlightSpan = selection.anchorNode.parentElement;
      if (highlightSpan.classList.contains('highlighted-text')) {
        const highlightId = highlightSpan.dataset.highlightId;
        const textNode = document.createTextNode(highlightSpan.textContent);
        highlightSpan.parentNode.replaceChild(textNode, highlightSpan);
        
        // Remove from notes
        if (highlightId) {
          onHighlightRemove(highlightId);
        }
      }
      setSelection(null);
      setPopupPosition(null);
      setIsEditing(false);
    }
  }, [selection, onHighlightRemove]);

  const handleSelection = useCallback((e) => {
    const sel = window.getSelection();
    const clickedElement = e.target;
    
    // Check if clicking on existing highlight
    if (clickedElement.classList?.contains('highlighted-text')) {
      setSelection(sel);
      const rect = clickedElement.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 40
      });
      setIsEditing(true);
      return;
    }

    // Handle new selection
    if (!sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const bookContainer = document.querySelector('.book-container');
      
      if (bookContainer && bookContainer.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        setSelection(sel);
        setPopupPosition({
          x: rect.left + (rect.width / 2),
          y: rect.top - 40
        });
        setIsEditing(false);
      }
    }
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (!e.target.closest('.highlight-popup')) {
      setSelection(null);
      setPopupPosition(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSelection, handleClickOutside]);

  return { 
    popupPosition, 
    handleHighlight, 
    handleRemoveHighlight,
    isEditing 
  };
};

export default useSelectionEvents;
