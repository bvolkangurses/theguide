import React, { useState, useEffect } from 'react';
import { FaBook, FaTimes, FaUpload } from 'react-icons/fa';
import { useBooks } from '../contexts/BookContext';

const AddBookModal = ({ isOpen, onClose }) => {
  const { addCustomBook } = useBooks();
  
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    publicationYear: new Date().getFullYear(),
    path: '',
    content: '',
    systemPrompt: ''
  });
  
  const [errors, setErrors] = useState({});
  const [fileContent, setFileContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Generate system prompt whenever author or title changes
  useEffect(() => {
    if (bookData.author && bookData.title) {
      const generatedPrompt = 
        `You are ${bookData.author}. You are speaking to someone reading ${bookData.title}. When responding keep ${bookData.author}'s personality in mind. Keep your responses under 100 words.`;
      
      setBookData(prev => ({
        ...prev,
        systemPrompt: generatedPrompt
      }));
    }
  }, [bookData.author, bookData.title]);
  
  // Path generator based on title
  useEffect(() => {
    if (bookData.title) {
      const generatedPath = `/${bookData.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')}`;
      
      setBookData(prev => ({
        ...prev,
        path: generatedPath
      }));
    }
  }, [bookData.title]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData({
      ...bookData,
      [name]: value
    });
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFileContent(content);
      setBookData({
        ...bookData,
        content: content
      });
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      setErrors({
        ...errors,
        file: 'Error reading file'
      });
    };
    
    reader.readAsText(file);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!bookData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!bookData.author.trim()) {
      newErrors.author = 'Author is required';
    }
    
    if (!bookData.path.trim()) {
      newErrors.path = 'Path is required';
    } else if (!bookData.path.startsWith('/')) {
      newErrors.path = 'Path must start with /';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create custom book ID
    const customId = `custom-${Date.now()}`;
    
    const newBook = {
      ...bookData,
      id: customId,
      authorVoiceID: 'default' // Use default voice ID
    };
    
    addCustomBook(newBook);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaBook /> Add New Book</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="add-book-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Book Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={bookData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={bookData.author}
                onChange={handleInputChange}
                className={errors.author ? 'error' : ''}
              />
              {errors.author && <div className="error-message">{errors.author}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="publicationYear">Publication Year</label>
              <input
                type="number"
                id="publicationYear"
                name="publicationYear"
                value={bookData.publicationYear}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="path">URL Path</label>
              <input
                type="text"
                id="path"
                name="path"
                value={bookData.path}
                onChange={handleInputChange}
                className={errors.path ? 'error' : ''}
              />
              {errors.path && <div className="error-message">{errors.path}</div>}
              <small>Path must start with / (e.g., /my-book)</small>
            </div>
            
            <div className="file-upload-group">
              <label>Book Content (Optional)</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="book-content-file"
                  className="file-input"
                  accept=".txt"
                  onChange={handleFileUpload}
                />
                <label htmlFor="book-content-file" className="file-upload-label">
                  <FaUpload /> Upload Text File
                </label>
              </div>
              {isUploading && <div className="upload-status loading">Uploading...</div>}
              {fileContent && <div className="upload-status">File uploaded successfully!</div>}
              {errors.file && <div className="error-message">{errors.file}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="systemPrompt">System Prompt</label>
              <textarea
                id="systemPrompt"
                name="systemPrompt"
                value={bookData.systemPrompt}
                onChange={handleInputChange}
                rows={4}
              />
              <small>This prompt is auto-generated but can be edited if needed</small>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;
