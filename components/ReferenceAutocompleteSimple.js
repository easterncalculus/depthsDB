import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/References.module.css';

const ReferenceAutocompleteSimple = ({ 
  textAreaRef, 
  onSelectReference = () => {} 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [hashPosition, setHashPosition] = useState(null);
  const popoverRef = useRef(null);

  // Extract query when user types # followed by text
  const checkForReference = () => {
    if (!textAreaRef.current) return;
    
    const textArea = textAreaRef.current;
    const text = textArea.value;
    const cursorPos = textArea.selectionStart;
    
    // Find the last # before the cursor
    let hashPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '#') {
        hashPos = i;
        break;
      }
      
      // Stop if we hit a space or newline
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }
    
    // If we found a # and it's not at the cursor position
    if (hashPos >= 0 && hashPos < cursorPos) {
      // Extract type marker (r or c) if it exists
      let type = null;
      let queryStart = hashPos + 1;
      
      if (hashPos + 1 < text.length) {
        const typeChar = text[hashPos + 1];
        if (typeChar === 'r' || typeChar === 'c') {
          type = typeChar;
          queryStart = hashPos + 2;
        }
      }
      
      // Extract query text (everything from after # or after type char until cursor)
      const extractedQuery = text.substring(queryStart, cursorPos);
      console.log('Found reference pattern:', { 
        hash: hashPos, 
        type, 
        query: extractedQuery, 
        cursorPos 
      });
      
      // Activate if we have a hash and either a type marker or some query text
      if (type || extractedQuery) {
        setQuery(extractedQuery);
        setCursorPosition(cursorPos);
        setHashPosition(hashPos);
        setIsActive(true);
        return true;
      }
    }
    
    setIsActive(false);
    return false;
  };

  // Handle input in the textarea
  const handleTextAreaInput = () => {
    checkForReference();
  };

  // Fetch search results when query changes
  useEffect(() => {
    if (!isActive) return;

    const searchReferences = async () => {
      setLoading(true);
      try {
        // Determine type filter based on what follows the # character
        const textArea = textAreaRef.current;
        const text = textArea.value;
        let typeFilter = '';
        
        if (hashPosition !== null && hashPosition + 1 < text.length) {
          const typeChar = text[hashPosition + 1];
          if (typeChar === 'r' || typeChar === 'c') {
            typeFilter = typeChar;
          }
        }
        
        // Construct URL with query parameters
        const params = new URLSearchParams();
        params.append('query', query);
        if (typeFilter) {
          params.append('type', typeFilter);
        }
        
        console.log(`Searching references: ${typeFilter ? typeFilter + ':' : ''}${query}`);
        
        const response = await fetch(`/api/references/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Search results:', data);
          setResults(data);
          setSelectedIndex(0);
        } else {
          console.error('API error:', response.status);
          setResults([]);
        }
      } catch (error) {
        console.error('Error searching references:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      searchReferences();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, isActive, hashPosition]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isActive) return;
    
    switch (e.key) {
      case 'ArrowDown':
        if (results.length > 0) {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
        }
        break;
        
      case 'ArrowUp':
        if (results.length > 0) {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        }
        break;
        
      case 'Enter':
      case 'Tab':
        if (results.length > 0) {
          e.preventDefault();
          selectReference(results[selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsActive(false);
        break;
    }
  };

  // Select a reference and insert it into the textarea
  const selectReference = (reference) => {
    if (!textAreaRef.current || hashPosition === null || cursorPosition === null) return;
    
    const textArea = textAreaRef.current;
    const text = textArea.value;
    
    // Replace from # position to cursor with #refCode
    const newText = 
      text.substring(0, hashPosition) + 
      `#${reference.refCode}` + 
      text.substring(cursorPosition);
    
    // Update textarea
    textArea.value = newText;
    
    // Set cursor position after the inserted reference
    const newCursorPos = hashPosition + reference.refCode.length + 1; // +1 for the # character
    textArea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Notify parent component
    onSelectReference(reference);
    
    // Reset state
    setIsActive(false);
    setResults([]);
    
    // Focus back on textarea
    textArea.focus();
  };

  // Attach event listeners to textarea
  useEffect(() => {
    if (!textAreaRef.current) return;
    
    const textArea = textAreaRef.current;
    
    // Add event listeners
    textArea.addEventListener('input', handleTextAreaInput);
    textArea.addEventListener('click', handleTextAreaInput);
    textArea.addEventListener('keydown', handleKeyDown);
    
    // Initial check
    handleTextAreaInput();
    
    // Cleanup
    return () => {
      textArea.removeEventListener('input', handleTextAreaInput);
      textArea.removeEventListener('click', handleTextAreaInput);
      textArea.removeEventListener('keydown', handleKeyDown);
    };
  }, [results, selectedIndex]);

  // Debugging render information
  console.log('Render state:', { isActive, query, resultsCount: results.length, loading });

  // Don't render anything if not active
  if (!isActive) {
    return null;
  }

  // Position the dropdown at the bottom of the textarea
  const textAreaRect = textAreaRef.current?.getBoundingClientRect();
  const dropdownTop = textAreaRect ? textAreaRect.bottom + 5 : 0;
  const dropdownLeft = textAreaRect ? textAreaRect.left : 0;

  return (
    <div 
      ref={popoverRef}
      className={styles.autocompletePopover}
      style={{ 
        top: `${dropdownTop}px`, 
        left: `${dropdownLeft}px` 
      }}
    >
      <div className={styles.autocompleteHeader}>
        {loading ? 'Searching references...' : `References for: ${query || ''}`}
      </div>
      
      {loading ? (
        <div className={styles.autocompleteLoading}>Loading...</div>
      ) : results.length === 0 ? (
        <div className={styles.autocompleteEmpty}>No matching references found</div>
      ) : (
        <ul className={styles.autocompleteResults}>
          {results.map((result, index) => (
            <li 
              key={`${result.entityType}-${result.id}`}
              className={`${styles.autocompleteItem} ${index === selectedIndex ? styles.selected : ''}`}
              onClick={() => selectReference(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={styles.referenceName}>{result.name}</div>
              <div className={styles.referenceType}>
                {result.entityType === 'rule' 
                  ? `Rule (${result.type})` 
                  : `Card (${result.side}/${result.type})`
                }
              </div>
              <div className={styles.referenceCode}>#{result.refCode}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReferenceAutocompleteSimple;