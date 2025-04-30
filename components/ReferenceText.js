import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { extractReferences } from '../lib/references';
import styles from '../styles/References.module.css';
import CardDisplay from './CardDisplay';
import RuleDisplay from './RuleDisplay';

const ReferenceLink = ({ reference, referenceData, children }) => {
  const [showHoverPanel, setShowHoverPanel] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const [fullReference, setFullReference] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const linkRef = useRef(null);
  const hoverPanelRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  
  // Function to fetch full reference data for hover panel
  const fetchFullReference = async () => {
    if (fullReference || isLoading) return;
    
    setIsLoading(true);
    try {
      // Use the appropriate API endpoint based on reference type
      const endpoint = reference.type === 'r' 
        ? `/api/rules/${reference.id}` 
        : `/api/cards/${reference.id}`;
        
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setFullReference(data);
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate panel position based on link position
  const calculatePanelPosition = () => {
    if (!linkRef.current) return;
    
    const rect = linkRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Default position is to the right of the link
    let left = rect.right + 10;
    let top = rect.top - 5; // Less offset to stay closer to the link
    
    // For initial positioning, we don't know the panel size yet
    // so just ensure it's within reasonable bounds
    left = Math.min(left, windowWidth - 350);
    top = Math.min(top, windowHeight - 300);
    
    // Make sure top is not above the top of the screen
    top = Math.max(10, top);
    left = Math.max(10, left);
    
    setPanelPosition({ top, left });
    
    // Refine position after render when we know actual dimensions
    if (hoverPanelRef.current) {
      setTimeout(() => {
        if (hoverPanelRef.current && fullReference) {
          const panelRect = hoverPanelRef.current.getBoundingClientRect();
          
          // Final adjustments if needed
          let adjustedLeft = left;
          let adjustedTop = top;
          
          // Determine if we should show to the left or right based on space available
          if (rect.left > windowWidth / 2) {
            // More space on left, position left of the link
            adjustedLeft = Math.max(10, rect.left - panelRect.width - 10);
          } else if (panelRect.right > windowWidth - 10) {
            // Not enough space on right, adjust horizontally
            adjustedLeft = Math.max(10, windowWidth - panelRect.width - 10);
          }
          
          // Vertical positioning
          if (panelRect.bottom > windowHeight - 10) {
            // Not enough space below, try to position above
            if (rect.top > panelRect.height + 20) {
              // Enough space above, position above the link
              adjustedTop = Math.max(10, rect.top - panelRect.height - 10);
            } else {
              // Not enough space above either, position as high as possible
              adjustedTop = Math.max(10, windowHeight - panelRect.height - 10);
            }
          }
          
          if (adjustedLeft !== left || adjustedTop !== top) {
            setPanelPosition({ top: adjustedTop, left: adjustedLeft });
          }
        }
      }, 100); // Slightly longer timeout to ensure content is rendered
    }
  };
  
  // Handle mouse enter
  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set a small delay before showing the panel
    hoverTimeoutRef.current = setTimeout(() => {
      fetchFullReference();
      calculatePanelPosition();
      
      // Get current highest z-index
      const allPanels = document.querySelectorAll(`.${styles.hoverPanel}`);
      let highestZIndex = 1000;
      
      allPanels.forEach(panel => {
        const zIndex = parseInt(window.getComputedStyle(panel).zIndex, 10);
        if (!isNaN(zIndex) && zIndex > highestZIndex) {
          highestZIndex = zIndex;
        }
      });
      
      // Set panel z-index to be higher than any existing panels
      if (hoverPanelRef.current) {
        hoverPanelRef.current.style.zIndex = (highestZIndex + 1).toString();
      }
      
      setShowHoverPanel(true);
    }, 300);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set a small delay before hiding the panel
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverPanel(false);
    }, 300);
  };
  
  // Handle clicks on hover panel
  const handlePanelMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };
  
  const handlePanelMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverPanel(false);
    }, 300);
  };
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  // Update panel position when fullReference changes
  useEffect(() => {
    if (showHoverPanel) {
      calculatePanelPosition();
    }
  }, [fullReference, showHoverPanel]);
  
  // Render reference link with hover panel
  return (
    <span className={styles.referenceWrapper}>
      <Link href={`/${reference.type === 'r' ? 'rules' : 'cards'}/${reference.id}`}>
        <span 
          ref={linkRef}
          className={styles.referenceLink}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </span>
      </Link>
      
      {/* Hover Panel */}
      {showHoverPanel && (
        <div 
          ref={hoverPanelRef}
          className={styles.hoverPanel}
          style={{ top: `${panelPosition.top}px`, left: `${panelPosition.left}px` }}
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
        >
          {isLoading ? (
            <div className={styles.hoverPanelLoading}>Loading...</div>
          ) : fullReference ? (
            <div className={`${styles.hoverPanelContent} ${styles.cardDetailContainer}` }>
              {reference.type === 'c' ? (
                  <CardDisplay card={fullReference} />
              ) : (
                  <RuleDisplay rule={fullReference} />
              )}
            </div>
          ) : (
            <div className={styles.hoverPanelError}>Reference data not available</div>
          )}
        </div>
      )}
    </span>
  );
};

const ReferenceText = ({ text, references = {} }) => {
  if (!text) return null;
  
  // Extract references from text
  const extractedRefs = extractReferences(text);
  
  // If no references, return plain text
  if (extractedRefs.length === 0) {
    return <span>{text}</span>;
  }
  
  // Split text by references and render
  const parts = [];
  let lastIndex = 0;
  
  // Clone the regex to reset lastIndex
  const regex = new RegExp(/<([#$])(\d+)(?:\|[^<>]*)?([#$])>/g);
  
  // Parse text and replace references
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, openChar, id, closeChar] = match;
    
    // Make sure the opening and closing characters match
    if (openChar !== closeChar) continue;
    
    // Determine type based on character
    const type = openChar === '$' ? 'r' : 'c';
    const refKey = `${type}${id}`;
    const reference = { type, id: parseInt(id, 10) };
    const referenceData = references[refKey];
    
    // Add text before the reference
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the reference as a link
    parts.push(
      <ReferenceLink
        key={`${refKey}-${match.index}`}
        reference={reference}
        referenceData={referenceData}
      >
        {referenceData ? referenceData.name : fullMatch}
      </ReferenceLink>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // Return text with references
  return <span>{parts}</span>;
};

export default ReferenceText;