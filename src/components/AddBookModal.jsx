import React, { useState, useEffect } from 'react';
import { FaBook, FaTimes, FaUpload } from 'react-icons/fa';
import { useBooks } from '../contexts/BookContext';

const AddBookModal = ({ isOpen, onClose, onAddBook, bookToEdit }) => {
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
  
  // Reset or populate form when modal opens/closes or bookToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (bookToEdit) {
        // Populate form with existing book data for editing
        setBookData({
          title: bookToEdit.title || '',
          author: bookToEdit.author || '',
          publicationYear: bookToEdit.publicationYear || new Date().getFullYear(),
          path: bookToEdit.path || '',
          content: bookToEdit.content || '',
          systemPrompt: bookToEdit.systemPrompt || ''
        });
        setFileContent(null); // Reset file content when editing
      } else {
        // Reset form for new book
        setBookData({
          title: '',
          author: '',
          publicationYear: new Date().getFullYear(),
          path: '',
          content: '',
          systemPrompt: ''
        });
        setFileContent(null);
      }
      setErrors({});
    }
  }, [isOpen, bookToEdit]);
  
  // Generate system prompt whenever author or title changes
  // Only auto-generate if it hasn't been manually edited or it's a new book
  useEffect(() => {
    if (bookData.author && bookData.title && (!bookToEdit || !bookToEdit.systemPrompt)) {
      const generatedPrompt = 
        `You are ${bookData.author}. You are speaking to someone reading ${bookData.title}. When responding keep ${bookData.author}'s personality in mind. Keep your responses under 100 words.`;
      
      setBookData(prev => ({
        ...prev,
        systemPrompt: generatedPrompt
      }));
    }
  }, [bookData.author, bookData.title, bookToEdit]);
  
  // Path generator based on title (only for new books)
  useEffect(() => {
    if (bookData.title && !bookToEdit) {
      const generatedPath = `/${bookData.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')}`;
      
      setBookData(prev => ({
        ...prev,
        path: generatedPath
      }));
    }
  }, [bookData.title, bookToEdit]);
  
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
    
    if (bookToEdit) {
      // Update existing book
      const updatedBook = {
        ...bookToEdit,
        ...bookData
      };
      onAddBook(updatedBook);
    } else {
      // Create new book with custom ID
      const newBook = {
        ...bookData,
        id: `custom-${Date.now()}`,
        authorVoiceID: 'default',
        isCustom: true // Ensure the book is marked as custom
      };
      onAddBook(newBook);
    }
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaBook /> {bookToEdit ? 'Edit Book' : 'Add New Book'}</h2>
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
                disabled={bookToEdit} // Path should not be editable for existing books
              />
              {errors.path && <div className="error-message">{errors.path}</div>}
              <small>Path must start with / (e.g., /my-book){bookToEdit ? ' - Cannot be changed for existing books' : ''}</small>
            </div>
            
            <div className="file-upload-group">
              <label>Book Content {bookToEdit ? '(Upload to replace existing content)' : '(Optional)'}</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="book-content-file"
                  className="file-input"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                />
                <label htmlFor="book-content-file" className="file-upload-label">
                  <FaUpload /> Upload Text File
                </label>
              </div>
              {isUploading && <div className="upload-status loading">Uploading...</div>}
              {fileContent && <div className="upload-status">File uploaded successfully!</div>}
              {bookToEdit && bookToEdit.content && !fileContent && <div className="upload-status">Current content will be preserved unless you upload a new file</div>}
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
              <small>This prompt guides how the AI responds when discussing this book</small>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {bookToEdit ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;
