import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/References.module.css';

const EnhancedReferenceAutocomplete = ({ 
  textAreaRef, 
  onSelectReference = () => {} 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [triggerChar, setTriggerChar] = useState(null);
  const popoverRef = useRef(null);

  // Extract query when user types # or $ 
  const checkForReference = () => {
    if (!textAreaRef.current) return;
    
    const textArea = textAreaRef.current;
    const text = textArea.value;
    const cursorPos = textArea.selectionStart;
    
    // Find the last # or $ before the cursor
    let triggerPos = -1;
    let trigger = null;
    
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '#' || text[i] === '$') {
        triggerPos = i;
        trigger = text[i];
        break;
      }
      
      // Stop if we hit a space or newline or brackets
      if (text[i] === ' ' || text[i] === '\n' || text[i] === '>' || text[i] === '<') {
        break;
      }
    }
    
    // If we found a trigger character and it's not part of a closing tag
    if (triggerPos >= 0 && triggerPos < cursorPos) {
      // Make sure it's not part of a closing tag (e.g., <#123#>)
      let isClosingTag = false;
      
      // Check if there's an opening bracket before the trigger
      for (let i = triggerPos - 1; i >= 0; i--) {
        if (text[i] === '<') {
          isClosingTag = true;
          break;
        }
        
        if (text[i] === ' ' || text[i] === '\n') {
          break;
        }
      }
      
      if (!isClosingTag) {
        // Extract query text (everything from after trigger char until cursor)
        const extractedQuery = text.substring(triggerPos + 1, cursorPos);
        console.log('Found reference pattern:', { 
          triggerPos, 
          trigger, 
          query: extractedQuery, 
          cursorPos 
        });
        
        // Activate if we have a trigger character
        setQuery(extractedQuery);
        setCursorPosition(cursorPos);
        setTriggerChar(trigger);
        setIsActive(true);
        return true;
      }
    }
    
    if (isActive) {
      setIsActive(false);
    }
    return false;
  };

  // Handle input in the textarea
  const handleTextAreaInput = () => {
    checkForReference();
  };

  // Fetch search results when query or trigger character changes
  useEffect(() => {
    if (!isActive || !triggerChar) return;

    const searchReferences = async () => {
      setLoading(true);
      try {
        // Construct URL with query parameters
        const params = new URLSearchParams();
        params.append('search', query);
        // Name-only search is now the default behavior
        params.append('limit', '10');      // Limit to 10 results for better performance
        
        let endpoint;
        if (triggerChar === '#') {
          // For cards, use the cards API
          endpoint = '/api/cards';
          console.log(`Searching cards: ${query}`);
        } else {
          // For rules, use the rules API
          endpoint = '/api/rules';
          console.log(`Searching rules: ${query}`);
        }
        
        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Search results:', data);
          
          // Format the results for the autocomplete dropdown
          const formattedResults = data.map(item => {
            const isCard = 'side' in item;
            return {
              id: item.id,
              name: item.name,
              type: item.type,
              side: isCard ? item.side : undefined,
              entityType: isCard ? 'card' : 'rule',
              refCode: `${item.id}`,
              refChar: isCard ? '#' : '$',
            };
          });
          
          setResults(formattedResults);
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
  }, [query, triggerChar, isActive]);

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
    if (!textAreaRef.current || !triggerChar || cursorPosition === null) return;
    
    const textArea = textAreaRef.current;
    const text = textArea.value;
    
    // Find the trigger character position
    let triggerPos = -1;
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (text[i] === triggerChar) {
        triggerPos = i;
        break;
      }
      
      if (text[i] === ' ' || text[i] === '\n' || text[i] === '>' || text[i] === '<') {
        break;
      }
    }
    
    if (triggerPos < 0) return;
    
    // Format the reference with the enhanced syntax: <#123|Name#> or <$456|Name$>
    const formattedRef = `<${reference.refChar}${reference.refCode}|${reference.name}${reference.refChar}>`;
    
    // Replace from trigger position to cursor with the formatted reference
    const newText = 
      text.substring(0, triggerPos) + 
      formattedRef + 
      text.substring(cursorPosition);
    
    // Update textarea
    textArea.value = newText;
    
    // Set cursor position after the inserted reference
    const newCursorPos = triggerPos + formattedRef.length;
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
    const handleInput = () => handleTextAreaInput();
    const handleKeys = (e) => handleKeyDown(e);
    
    textArea.addEventListener('input', handleInput);
    textArea.addEventListener('click', handleInput);
    textArea.addEventListener('keydown', handleKeys);
    
    // Initial check
    handleTextAreaInput();
    
    // Cleanup
    return () => {
      textArea.removeEventListener('input', handleInput);
      textArea.removeEventListener('click', handleInput);
      textArea.removeEventListener('keydown', handleKeys);
    };
  }, [results, selectedIndex]);

  // Debugging render information
  console.log('Render state:', { 
    isActive, 
    triggerChar, 
    query, 
    resultsCount: results.length, 
    loading 
  });

  // Don't render anything if not active
  if (!isActive) {
    return null;
  }

  // Position the dropdown below the textarea
  const textAreaRect = textAreaRef.current?.getBoundingClientRect();
  const dropdownTop = textAreaRect ? textAreaRect.bottom + 5 : 0;
  const dropdownLeft = textAreaRect ? textAreaRect.left : 0;
  
  // Title for the dropdown
  const dropdownTitle = triggerChar === '#' 
    ? `Card References for: ${query || '[type to search]'}`
    : `Rule References for: ${query || '[type to search]'}`;

  return (
    <div 
      ref={popoverRef}
      className={styles.autocompletePopover}
      style={{ 
        top: `${dropdownTop}px`, 
        left: `${dropdownLeft}px`,
        borderColor: triggerChar === '#' ? '#0070f3' : '#f44336'
      }}
    >
      <div 
        className={styles.autocompleteHeader}
        style={{
          backgroundColor: triggerChar === '#' ? '#e6f0ff' : '#ffebe6',
          color: triggerChar === '#' ? '#0070f3' : '#f44336'
        }}
      >
        {dropdownTitle}
      </div>
      
      {loading ? (
        <div className={styles.autocompleteLoading}>Loading...</div>
      ) : results.length === 0 ? (
        <div className={styles.autocompleteEmpty}>
          No matching {triggerChar === '#' ? 'cards' : 'rules'} found
        </div>
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
              <div 
                className={styles.referenceCode}
                style={{ color: triggerChar === '#' ? '#0070f3' : '#f44336' }}
              >
                &lt;{result.refChar}{result.refCode}|{result.name}{result.refChar}&gt;
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnhancedReferenceAutocomplete;