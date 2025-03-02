/**
 * Find the paragraph element that was clicked
 * @param {MouseEvent} event - The click event
 * @param {React.RefObject} containerRef - Reference to container element
 * @returns {Object} - Information about the clicked paragraph
 */
export const findParagraphFromClickPosition = (event, containerRef) => {
  if (!containerRef || !containerRef.current) {
    return null;
  }

  // Get the element at click position
  let element = document.elementFromPoint(event.clientX, event.clientY);
  
  // Find the parent paragraph element if clicked on a child element
  while (element && element !== containerRef.current) {
    // Check if this is a paragraph or heading element
    if (
      element.tagName === 'P' || 
      element.tagName === 'H1' || 
      element.tagName === 'H2' || 
      element.tagName === 'H3' || 
      element.tagName === 'H4' || 
      element.tagName === 'H5' || 
      element.tagName === 'H6'
    ) {
      break;
    }
    element = element.parentElement;
  }

  // If we didn't find a paragraph or heading, or we reached the container without finding one
  if (!element || element === containerRef.current) {
    return null;
  }

  // Get the text of the element
  const paragraphText = element.textContent.trim();
  
  // Find all paragraphs in the container
  const allParagraphs = [];
  
  // Recursively collect text nodes from the container
  const collectTextNodes = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        allParagraphs.push(text);
      }
    } else {
      // For paragraph and heading elements, treat them as individual units
      if (
        node.tagName === 'P' || 
        node.tagName === 'H1' || 
        node.tagName === 'H2' || 
        node.tagName === 'H3' || 
        node.tagName === 'H4' || 
        node.tagName === 'H5' || 
        node.tagName === 'H6'
      ) {
        const text = node.textContent.trim();
        if (text) {
          allParagraphs.push(text);
        }
      } else {
        // For other elements, check their children
        for (const child of node.childNodes) {
          collectTextNodes(child);
        }
      }
    }
  };
  
  // Start collection from the container
  collectTextNodes(containerRef.current);
  
  // Filter out empty paragraphs and very short ones (likely not actual content)
  const filteredParagraphs = allParagraphs.filter(p => p.length > 15);
  
  // Find the index of the clicked paragraph
  const paragraphIndex = filteredParagraphs.findIndex(p => 
    p.includes(paragraphText) || paragraphText.includes(p)
  );
  
  return {
    text: paragraphText,
    index: paragraphIndex >= 0 ? paragraphIndex : 0,
    element,
    allParagraphs: filteredParagraphs
  };
};
