import { PrismaClient } from "@prisma/client";
import { formatCard } from "./cards";
import { formatRule } from "./rules";

const prisma = new PrismaClient();

// Regex pattern to match references: #r123 for rules, #c123 for cards
const referencePattern = /#([rc])(\d+)/g;

// Extract all references from a text
export function extractReferences(text) {
  if (!text) return [];
  
  const matches = [...text.matchAll(referencePattern)];
  const uniqueRefs = [];
  const seen = new Set();
  
  for (const match of matches) {
    const [fullMatch, type, id] = match;
    const key = `${type}${id}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRefs.push({
        type, 
        id: parseInt(id, 10),
        fullMatch
      });
    }
  }
  
  return uniqueRefs;
}

// Load partial data for all references in a text
export async function loadAllReferences(text) {
  const references = extractReferences(text);
  if (references.length === 0) return {};
  
  const referenceData = {};
  
  // Process in batches to avoid too many concurrent DB queries
  const cardRefs = references.filter(ref => ref.type === 'c').map(ref => ref.id);
  const ruleRefs = references.filter(ref => ref.type === 'r').map(ref => ref.id);
  
  // Fetch card references
  if (cardRefs.length > 0) {
    const cards = await prisma.card.findMany({
      where: {
        id: {
          in: cardRefs
        }
      },
      select: {
        id: true,
        name: true,
        side: true,
        type: true
      }
    });
    
    for (const card of cards) {
      referenceData[`c${card.id}`] = {
        id: card.id,
        name: card.name,
        side: card.side,
        type: card.type,
        entityType: 'card'
      };
    }
  }
  
  // Fetch rule references
  if (ruleRefs.length > 0) {
    const rules = await prisma.rule.findMany({
      where: {
        id: {
          in: ruleRefs
        }
      },
      select: {
        id: true,
        name: true,
        type: true
      }
    });
    
    for (const rule of rules) {
      referenceData[`r${rule.id}`] = {
        id: rule.id,
        name: rule.name,
        type: rule.type,
        entityType: 'rule'
      };
    }
  }
  
  return referenceData;
}

// Fetch full details for a specific reference
export async function getFullReference(type, id) {
  try {
    if (type === 'c') {
      const card = await prisma.card.findUnique({
        where: { id }
      });
      
      if (!card) return null;
      return formatCard(card);
    } 
    else if (type === 'r') {
      const rule = await prisma.rule.findUnique({
        where: { id }
      });
      
      if (!rule) return null;
      return formatRule(rule);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching reference:', error);
    return null;
  }
}