/**
 * Utility functions to manage highlights
 */

/**
 * Apply stored highlights to the DOM
 * @param {Array} highlightedNotes - Array of highlight objects
 * @param {Element} bookContainerRef - Reference to the book container element
 */
export const restoreHighlights = (highlightedNotes, bookContainerRef) => {
  if (!bookContainerRef?.current || !Array.isArray(highlightedNotes)) {
    return;
  }

  // Clear any existing highlights first to avoid duplicates
  const existingHighlights = bookContainerRef.current.querySelectorAll('.highlighted-text');
  existingHighlights.forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent) {
      // Replace the highlight with its text content
      const text = document.createTextNode(highlight.textContent);
      parent.replaceChild(text, highlight);
      
      // Normalize to merge adjacent text nodes
      parent.normalize();
    }
  });
  
  // Apply each stored highlight
  highlightedNotes.forEach(note => {
    try {
      if (!note.path) {
        console.warn('No path information for highlight:', note.id);
        return;
      }
      
      const { paragraphIndex, textStartIndex, paragraphText } = note.path;
      
      // Find the paragraph element by index
      const paragraphs = Array.from(bookContainerRef.current.querySelectorAll('p'));
      const paragraph = paragraphs[paragraphIndex];
      
      if (!paragraph) {
        console.warn('Paragraph not found for highlight:', note.id);
        return;
      }
      
      // Simple text-based approach for restoring highlights
      // This uses a simple string replacement approach which works for basic cases
      const highlightRange = document.createRange();
      let textFound = false;
      
      // We need to walk through text nodes to find the correct one
      const textNodes = getTextNodesIn(paragraph);
      let currentOffset = 0;
      
      for (const textNode of textNodes) {
        const nodeText = textNode.nodeValue;
        const nodeStart = currentOffset;
        const nodeEnd = nodeStart + nodeText.length;
        
        // Check if this text node contains the highlight start
        if (nodeStart <= textStartIndex && textStartIndex < nodeEnd) {
          const relativeStart = textStartIndex - nodeStart;
          const relativeEnd = Math.min(nodeEnd - nodeStart, relativeStart + note.text.length);
          
          // Set range to this part of the text
          highlightRange.setStart(textNode, relativeStart);
          highlightRange.setEnd(textNode, relativeEnd);
          
          // Create highlight span
          const span = document.createElement('span');
          span.className = 'highlighted-text';
          span.dataset.highlightId = note.id;
          
          try {
            highlightRange.surroundContents(span);
            textFound = true;
            break;
          } catch (e) {
            console.error('Error restoring highlight:', e);
          }
        }
        
        currentOffset += nodeText.length;
      }
      
      // If we couldn't find the exact text node, try a content search approach
      if (!textFound && paragraph.textContent.includes(note.text)) {
        // Get all text from the paragraph
        const allText = paragraph.textContent;
        
        // Find the highlight in the text
        const foundIndex = allText.indexOf(note.text);
        if (foundIndex >= 0) {
          // Create a TreeWalker to navigate text nodes
          const walker = document.createTreeWalker(
            paragraph, 
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let node;
          let charCount = 0;
          let startNode = null, endNode = null;
          let startOffset = 0, endOffset = 0;
          
          // Walk through text nodes to find positions
          while ((node = walker.nextNode())) {
            const nodeLength = node.nodeValue.length;
            
            // Check if this node contains the start of the highlight
            if (!startNode && foundIndex >= charCount && foundIndex < charCount + nodeLength) {
              startNode = node;
              startOffset = foundIndex - charCount;
            }
            
            // Check if this node contains the end of the highlight
            const highlightEnd = foundIndex + note.text.length - 1;
            if (!endNode && highlightEnd >= charCount && highlightEnd < charCount + nodeLength) {
              endNode = node;
              endOffset = highlightEnd - charCount + 1; // +1 because end is exclusive
            }
            
            charCount += nodeLength;
            
            // If we found both start and end, we can stop
            if (startNode && endNode) {
              break;
            }
          }
          
          if (startNode && endNode) {
            // Create and apply the highlight
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            
            const span = document.createElement('span');
            span.className = 'highlighted-text';
            span.dataset.highlightId = note.id;
            
            try {
              range.surroundContents(span);
            } catch (e) {
              console.error('Could not surround range, trying extract method:', e);
              // Try alternative approach for complex ranges
              const fragment = range.extractContents();
              span.appendChild(fragment);
              range.insertNode(span);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error restoring highlight:', error);
    }
  });
};

/**
 * Helper function to get all text nodes inside an element
 */
function getTextNodesIn(node) {
  var textNodes = [];
  
  function getTextNodes(node) {
    if (node.nodeType === 3) {
      textNodes.push(node);
    } else {
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) {
        getTextNodes(children[i]);
      }
    }
  }
  
  getTextNodes(node);
  return textNodes;
}
