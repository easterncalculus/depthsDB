import { getRuleById, updateRule, deleteRule } from '../../../lib/rules';
import { loadAllReferences } from '../../../lib/references';

export default async function handler(req, res) {
  const { id } = req.query;
  const ruleId = parseInt(id, 10);
  
  if (isNaN(ruleId)) {
    return res.status(400).json({ message: 'Invalid rule ID' });
  }
  
  try {
    if (req.method === 'GET') {
      const rule = await getRuleById(ruleId);
      
      if (!rule) {
        return res.status(404).json({ message: 'Rule not found' });
      }
      
      // Load all references data
      if (rule.description) {
        rule.references = await loadAllReferences(rule.description);
      }
      
      return res.status(200).json(rule);
    }
    
    if (req.method === 'PUT') {
      const rule = await updateRule(ruleId, req.body);
      return res.status(200).json(rule);
    }
    
    if (req.method === 'DELETE') {
      await deleteRule(ruleId);
      return res.status(204).end();
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}