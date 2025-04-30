import { getAllRules, createRule, getRulesByType } from '../../../lib/rules';
import { RuleType } from '../../../types/rule';
import { loadAllReferences } from '../../../lib/references';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { type, search, limit } = req.query;
      
      // Create search options object
      const searchOptions = {};
      if (type && Object.values(RuleType).includes(type)) {
        searchOptions.type = type;
      }
      if (search) {
        searchOptions.search = search;
      }
      
      // Apply limit if specified (convert to number)
      if (limit) searchOptions.limit = parseInt(limit, 10);
      
      // Get rules with search options
      const rules = await getAllRules(searchOptions);
      
      // Load references for each rule
      for (const rule of rules) {
        if (rule.description) {
          rule.references = await loadAllReferences(rule.description);
        }
      }
      
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