import React from 'react';
import { Link } from 'react-router-dom';

const Library = () => {
  return (
    <div className="library-container">
      <h1>Library</h1>
      <ul>
        <li><Link to="/">The Feynman Lectures On Physics</Link></li>
        <li><Link to="/book2">Another Book</Link></li>
        <li><Link to="/book3">Yet Another Book</Link></li>
        {/* Add more books as needed */}
      </ul>
    </div>
  );
};

export default Library;
