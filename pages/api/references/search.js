import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    if (type === 'r' || type === 'rule') {
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

      results = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        entityType: 'rule',
        refCode: `r${rule.id}`,
      }));
    } 
    else if (type === 'c' || type === 'card') {
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

      results = cards.map(card => ({
        id: card.id,
        name: card.name,
        side: card.side,
        type: card.type,
        entityType: 'card',
        refCode: `c${card.id}`,
      }));
    } 
    else {
      // Search both rules and cards
      const [rules, cards] = await Promise.all([
        prisma.rule.findMany({
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
          take: 5,
        }),
        prisma.card.findMany({
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
          take: 5,
        }),
      ]);

      // Format rule results
      const ruleResults = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type, 
        entityType: 'rule',
        refCode: `r${rule.id}`,
      }));

      // Format card results
      const cardResults = cards.map(card => ({
        id: card.id,
        name: card.name,
        side: card.side,
        type: card.type,
        entityType: 'card',
        refCode: `c${card.id}`,
      }));

      // Combine results
      results = [...ruleResults, ...cardResults];
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching references:', error);
    return res.status(500).json({ error: 'Failed to search references' });
  }
}