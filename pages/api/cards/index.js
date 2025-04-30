import prisma from '../../../lib/prisma';
import { formatCard, prepareCardForDB } from '../../../lib/cards';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        // Extract query parameters for filtering
        const { side, type } = req.query;
        
        // Build filter object based on query parameters
        const filter = {};
        if (side) filter.side = side;
        if (type) filter.type = type;
        
        const cards = await prisma.card.findMany({
          where: filter,
          orderBy: { createdAt: 'desc' },
        });
        
        res.status(200).json(cards.map(formatCard));
      } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Failed to fetch cards' });
      }
      break;
      
    case 'POST':
      try {
        const data = prepareCardForDB(req.body);
        const card = await prisma.card.create({ data });
        res.status(201).json(formatCard(card));
      } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ error: 'Failed to create card' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}