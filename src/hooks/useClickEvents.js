import { useEffect } from 'react';

const useClickEvents = (setTextPosition, setCurrentText, setIsEditing, inputRef) => {
  useEffect(() => {
    const handleClick = (e) => {
      // Don't trigger text input if user is selecting text
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        return;
      }

      if (!e.target.closest('.book-container') && !e.target.closest('.text-input')) {
        const appContainerRect = document.querySelector('.app-container').getBoundingClientRect();
        const bookContainerRect = document.querySelector('.book-container').getBoundingClientRect();
        const isLeftSide = e.clientX < window.innerWidth / 2;
        const maxWidth = isLeftSide ? bookContainerRect.left - e.clientX : window.innerWidth - e.clientX;

        setTextPosition({ x: e.clientX - appContainerRect.left - 15, y: e.clientY - appContainerRect.top - 32, maxWidth });
        setCurrentText('');
        setIsEditing(true);
        setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [setTextPosition, setCurrentText, setIsEditing, inputRef]);
};

export default useClickEvents;
