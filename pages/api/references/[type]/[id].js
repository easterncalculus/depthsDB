import { getFullReference } from '../../../../lib/references';
import { loadAllReferences } from '../../../../lib/references';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { type, id } = req.query;
  
  if (!type || !id || !(type === 'r' || type === 'c')) {
    return res.status(400).json({ message: 'Invalid reference parameters' });
  }
  
  const referenceId = parseInt(id, 10);
  
  if (isNaN(referenceId)) {
    return res.status(400).json({ message: 'Invalid reference ID' });
  }
  
  try {
    const reference = await getFullReference(type, referenceId);
    
    if (!reference) {
      return res.status(404).json({ message: 'Reference not found' });
    }
    
    // Also load any nested references
    if (reference.description) {
      reference.references = await loadAllReferences(reference.description);
    }
    
    return res.status(200).json(reference);
  } catch (error) {
    console.error('Error fetching reference:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}