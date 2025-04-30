import prisma from '../../../lib/prisma';
import { formatCard, prepareCardForDB } from '../../../lib/cards';
import { loadAllReferences } from '../../../lib/references';

export default async function handler(req, res) {
  const { id } = req.query;
  const cardId = parseInt(id);

  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const card = await prisma.card.findUnique({
          where: { id: cardId },
        });
        
        if (!card) {
          return res.status(404).json({ error: 'Card not found' });
        }
        
        const formattedCard = formatCard(card);
        
        // Load all references data
        if (formattedCard.description) {
          formattedCard.references = await loadAllReferences(formattedCard.description);
        }
        
        res.status(200).json(formattedCard);
      } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({ error: 'Failed to fetch card' });
      }
      break;
      
    case 'PUT':
      try {
        const data = prepareCardForDB(req.body);
        const updatedCard = await prisma.card.update({
          where: { id: cardId },
          data,
        });
        
        res.status(200).json(formatCard(updatedCard));
      } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Failed to update card' });
      }
      break;
      
    case 'DELETE':
      try {
        await prisma.card.delete({
          where: { id: cardId },
        });
        
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete card' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}