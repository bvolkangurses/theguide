import React from 'react';

const TextDisplay = ({ texts }) => (
  <>
    {texts.map((text, index) => (
      <pre
        key={index}
        className={`text ${text.role || 'user'}`}
        style={{ 
          top: text.y, 
          left: text.x, 
          position: 'absolute', 
          width: text.width || 'auto',
          maxWidth: text.maxWidth || 'none',
          whiteSpace: 'pre-wrap',
          textAlign: text.textAlign
        }}
      >
        {text.text}
      </pre>
    ))}
  </>
);

export default TextDisplay;