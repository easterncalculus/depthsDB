import { getAllRules, createRule, getRulesByType } from '../../../lib/rules';
import { RuleType } from '../../../types/rule';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { type, search } = req.query;
      
      // Create search options object
      const searchOptions = {};
      if (type && Object.values(RuleType).includes(type)) {
        searchOptions.type = type;
      }
      if (search) {
        searchOptions.search = search;
      }
      
      // Get rules with search options
      const rules = await getAllRules(searchOptions);
      
      return res.status(200).json(rules);
    }
    
    if (req.method === 'POST') {
      const rule = await createRule(req.body);
      return res.status(201).json(rule);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}