import { useEffect, useState } from 'react';
import Link from 'next/link';

// Regex pattern to match references: #r123 for rules, #c123 for cards
const referencePattern = /#([rc])(\d+)/g;

// Function to fetch a referenced entity (rule or card)
const fetchReference = async (type, id) => {
  try {
    const endpoint = type === 'r' ? `/api/rules/${id}` : `/api/cards/${id}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${type === 'r' ? 'rule' : 'card'} with ID ${id}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching reference:', error);
    return null;
  }
};

// Custom hook to parse and load references in text
export const useReferences = (text) => {
  const [processedText, setProcessedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const [references, setReferences] = useState({});
  
  useEffect(() => {
    if (!text) {
      setProcessedText('');
      return;
    }
    
    // Find all references in the text
    const matches = [...text.matchAll(referencePattern)];
    
    if (matches.length === 0) {
      setProcessedText(text);
      return;
    }
    
    // Extract unique references
    const uniqueRefs = matches.reduce((refs, match) => {
      const [fullMatch, type, id] = match;
      const key = `${type}${id}`;
      if (!refs[key]) {
        refs[key] = { type, id: parseInt(id, 10), fullMatch };
      }
      return refs;
    }, {});
    
    // Fetch all referenced entities
    const fetchAllReferences = async () => {
      setIsLoading(true);
      
      const refPromises = Object.values(uniqueRefs).map(async ref => {
        const entity = await fetchReference(ref.type, ref.id);
        return { ...ref, entity };
      });
      
      const resolvedRefs = await Promise.all(refPromises);
      
      // Create a lookup object with the references
      const refLookup = resolvedRefs.reduce((lookup, ref) => {
        lookup[`${ref.type}${ref.id}`] = ref.entity;
        return lookup;
      }, {});
      
      setReferences(refLookup);
      setIsLoading(false);
    };
    
    fetchAllReferences();
  }, [text]);
  
  return { processedText, isLoading, references };
};

// Component to render text with references
export const ReferenceText = ({ text }) => {
  const { isLoading, references } = useReferences(text);
  
  if (!text) return null;
  
  if (isLoading) {
    return <p>{text}</p>;
  }
  
  // Replace references with linked content
  const parts = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(referencePattern);
  
  // Reset regex state
  regex.lastIndex = 0;
  
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, type, id] = match;
    const refKey = `${type}${id}`;
    const entity = references[refKey];
    
    // Add text before the reference
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the reference as a link if entity exists
    if (entity) {
      const href = type === 'r' ? `/rules/${id}` : `/cards/${id}`;
      parts.push(
        <Link key={`${refKey}-${match.index}`} href={href}>
          <span className="text-blue-600 hover:underline">
            {entity.name}
          </span>
        </Link>
      );
    } else {
      // If entity doesn't exist, keep the original reference text
      parts.push(fullMatch);
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <p>{parts}</p>;
};

export default ReferenceText;