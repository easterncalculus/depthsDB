import { getAllRules, createRule, getRulesByType } from '../../../lib/rules';
import { RuleType } from '../../../types/rule';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const type = req.query.type ? req.query.type : null;
      let rules;
      
      if (type && Object.values(RuleType).includes(type)) {
        rules = await getRulesByType(type);
      } else {
        rules = await getAllRules();
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