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
      
      // Store text nodes for path information
      const container = range.commonAncestorContainer;
      const bookContainer = document.querySelector('.book-container');
      
      // Find the parent paragraph or element containing the highlight
      let parentParagraph = range.startContainer;
      while (parentParagraph && parentParagraph.nodeName !== 'P' && parentParagraph !== bookContainer) {
        parentParagraph = parentParagraph.parentNode;
      }
      
      // Find index of the paragraph in the book
      const allParagraphs = Array.from(bookContainer.querySelectorAll('p'));
      const paragraphIndex = parentParagraph ? allParagraphs.indexOf(parentParagraph) : -1;
      
      // Get start and end offsets in the paragraph
      const highlightText = range.toString();
      const paragraphText = parentParagraph ? parentParagraph.textContent : '';
      const textStartIndex = paragraphText.indexOf(highlightText);
      
      // Surround selected content with the highlight span
      try {
        range.surroundContents(span);
      } catch (e) {
        console.error('Could not surround range, it might cross element boundaries:', e);
        // Fall back to simpler highlighting
        const text = range.extractContents();
        span.appendChild(text);
        range.insertNode(span);
      }
      
      // Add highlighted text to notes with position info
      const timestamp = new Date();
      onHighlightAdd({
        id: highlightId,
        text: highlightText,
        timestamp: timestamp.toLocaleString(),
        path: {
          paragraphIndex,
          textStartIndex,
          textEndIndex: textStartIndex + highlightText.length,
          paragraphText: paragraphText // Store the full paragraph text for context
        }
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
