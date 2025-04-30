import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Create a case-insensitive search pattern (SQLite doesn't support mode: 'insensitive')
    const searchPattern = `%${query}%`;
    let results = [];

    // If type is specified, only search that type
    if (type === 'r' || type === 'rule' || type === '$') {
      // Search rules by name
      const rules = await prisma.rule.findMany({
        where: {
          name: {
            contains: searchPattern,
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 10,
      });

      // For rules, format with '$' for the new syntax
      results = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        entityType: 'rule',
        refCode: `${rule.id}`,
        refChar: '$',
      }));
    } 
    else if (type === 'c' || type === 'card' || type === '#') {
      // Search cards by name
      const cards = await prisma.card.findMany({
        where: {
          name: {
            contains: searchPattern,
          },
        },
        select: {
          id: true,
          name: true,
          side: true,
          type: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 10,
      });

      // For cards, format with '#' for the new syntax
      results = cards.map(card => ({
        id: card.id,
        name: card.name,
        side: card.side,
        type: card.type,
        entityType: 'card',
        refCode: `${card.id}`,
        refChar: '#',
      }));
    } 
    else {
      // Default to searching cards if no type is specified
      const cards = await prisma.card.findMany({
        where: {
          name: {
            contains: searchPattern,
          },
        },
        select: {
          id: true,
          name: true,
          side: true,
          type: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 10,
      });

      // For cards, format with '#' for the new syntax
      results = cards.map(card => ({
        id: card.id,
        name: card.name,
        side: card.side,
        type: card.type,
        entityType: 'card',
        refCode: `${card.id}`,
        refChar: '#',
      }));
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching references:', error);
    return res.status(500).json({ error: 'Failed to search references' });
  }
}