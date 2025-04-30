import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/References.module.css';

const ReferenceAutocomplete = ({ 
  textAreaRef, 
  onSelectReference = () => {} 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const popoverRef = useRef(null);

  // Call this function to extract the query from the textarea
  const extractQueryFromTextArea = () => {
    if (!textAreaRef.current) return null;
    
    const textArea = textAreaRef.current;
    const text = textArea.value;
    const cursorPos = textArea.selectionStart;
    
    // Find the start of the potential reference (the position of the # character)
    let hashPos = cursorPos - 1;
    while (hashPos >= 0 && text[hashPos] !== '#' && text[hashPos] !== ' ' && text[hashPos] !== '\n') {
      hashPos--;
    }
    
    // If we didn't find a # or we found whitespace before finding #, then not a valid reference
    if (hashPos < 0 || text[hashPos] !== '#') {
      return null;
    }
    
    // Check if there's an r or c immediately after the #
    const typeChar = text[hashPos + 1];
    let searchType = null;
    let searchOffset = 1;
    
    if (typeChar === 'r' || typeChar === 'c') {
      // This is a typed reference like #r or #c
      searchType = typeChar;
      searchOffset = 2;
    }
    
    // Extract the query (everything from hashPos + searchOffset to cursorPos)
    const extractedQuery = text.substring(hashPos + searchOffset, cursorPos);
    
    // Only activate if there's a query or a type specified
    if (extractedQuery || searchType) {
      return {
        query: extractedQuery,
        type: searchType,
        hashPosition: hashPos,
        cursorPosition: cursorPos
      };
    }
    
    return null;
  };

  // Calculate position for the autocomplete dropdown
  const calculatePosition = () => {
    if (!textAreaRef.current || cursorPosition === null) return;
    
    const textArea = textAreaRef.current;
    const textAreaRect = textArea.getBoundingClientRect();
    
    // More straightforward positioning approach
    // Position below the textarea
    const top = textAreaRect.bottom + 5; // 5px below the textarea
    const left = textAreaRect.left;
    
    setPosition({
      top: top + window.scrollY,
      left: left + window.scrollX
    });
    
    // Log for debugging
    console.log('Dropdown position:', { top, left, rect: textAreaRect });
  };

  // Handle input in the textarea
  const handleTextAreaInput = () => {
    if (!textAreaRef.current) return;
    
    const queryInfo = extractQueryFromTextArea();
    console.log('handleTextAreaInput - queryInfo:', queryInfo);
    
    if (queryInfo) {
      setQuery(queryInfo.query);
      setCursorPosition(queryInfo.cursorPosition);
      setIsActive(true);
      calculatePosition();
      console.log('Activating autocomplete');
    } else {
      if (isActive) {
        console.log('Deactivating autocomplete');
        setIsActive(false);
      }
    }
  };

  // Fetch search results
  useEffect(() => {
    if (!isActive) return;
    
    console.log('Autocomplete active, fetching results for query:', query);
    
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('query', query);
        
        // Get the queryInfo again to check for type
        const queryInfo = extractQueryFromTextArea();
        if (queryInfo && queryInfo.type) {
          params.append('type', queryInfo.type);
        }
        
        const url = `/api/references/search?${params.toString()}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('Results received:', data);
          setResults(data);
          setSelectedIndex(0);
        } else {
          console.error('Error response:', response.status);
          setResults([]);
        }
      } catch (error) {
        console.error('Error fetching reference results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the search
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, isActive]);

  // Update position when results change
  useEffect(() => {
    if (isActive) {
      calculatePosition();
    }
  }, [results, isActive]);

  // Attach event listeners to textarea
  useEffect(() => {
    if (!textAreaRef.current) return;
    
    const textArea = textAreaRef.current;
    
    // Function to handle input events
    const handleInput = () => {
      handleTextAreaInput();
    };
    
    // Function to handle keydown events
    const handleKeys = (e) => {
      handleKeyDown(e);
    };
    
    // Add event listeners
    textArea.addEventListener('input', handleInput);
    textArea.addEventListener('click', handleInput);
    textArea.addEventListener('keydown', handleKeys);
    
    // Initial check
    handleTextAreaInput();
    
    // Cleanup function
    return () => {
      textArea.removeEventListener('input', handleInput);
      textArea.removeEventListener('click', handleInput);
      textArea.removeEventListener('keydown', handleKeys);
    };
  }, [results, selectedIndex, isActive]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isActive || results.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        if (isActive && results.length > 0) {
          e.preventDefault();
          selectReference(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsActive(false);
        break;
      case 'Tab':
        if (isActive && results.length > 0) {
          e.preventDefault();
          selectReference(results[selectedIndex]);
        }
        break;
    }
  };

  // Handle selecting a reference
  const selectReference = (reference) => {
    if (!textAreaRef.current || cursorPosition === null) return;
    
    const textArea = textAreaRef.current;
    const text = textArea.value;
    
    // Find the start of the current reference
    const queryInfo = extractQueryFromTextArea();
    if (!queryInfo) return;
    
    const { hashPosition } = queryInfo;
    
    // Replace from # to cursor with the new reference
    const newText = 
      text.substring(0, hashPosition) + 
      `#${reference.refCode}` + 
      text.substring(cursorPosition);
    
    textArea.value = newText;
    
    // Set cursor position after the inserted reference
    const newCursorPos = hashPosition + reference.refCode.length + 1;
    textArea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Call the onSelectReference callback
    onSelectReference(reference);
    
    // Close the autocomplete
    setIsActive(false);
    textArea.focus();
  };

  console.log('Render state:', { isActive, resultsLength: results.length, loading });

  if (!isActive) {
    return null;
  }

  return (
    <div 
      ref={popoverRef}
      className={styles.autocompletePopover}
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`
      }}
    >
      {loading ? (
        <div className={styles.autocompleteLoading}>Loading references...</div>
      ) : results.length === 0 ? (
        <div className={styles.autocompleteLoading}>No matching references found</div>
      ) : (
        <ul className={styles.autocompleteResults}>
          {results.map((result, index) => (
            <li 
              key={`${result.entityType}-${result.id}`}
              className={`${styles.autocompleteItem} ${index === selectedIndex ? styles.selected : ''}`}
              onClick={() => selectReference(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={styles.referenceName}>
                {result.name}
              </div>
              <div className={styles.referenceType}>
                {result.entityType === 'rule' 
                  ? `Rule (${result.type})` 
                  : `Card (${result.side}/${result.type})`}
              </div>
              <div className={styles.referenceCode}>#{result.refCode}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReferenceAutocomplete;