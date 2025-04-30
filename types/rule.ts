// Rule Types
export enum RuleType {
  GENERAL = 'General',
  ARCHETYPE = 'Archetype',
  TYPE = 'Type',
  SUBTYPE = 'Subtype',
  KEYWORD = 'Keyword'
}

// Base Rule Interface
export interface Rule {
  id: number;
  name: string;
  description: string;
  type: RuleType;
  createdAt: Date;
  updatedAt: Date;
}

// Type Guards
export const isGeneralRule = (rule: Rule): boolean => {
  return rule.type === RuleType.GENERAL;
};

export const isArchetypeRule = (rule: Rule): boolean => {
  return rule.type === RuleType.ARCHETYPE;
};

export const isTypeRule = (rule: Rule): boolean => {
  return rule.type === RuleType.TYPE;
};

export const isSubtypeRule = (rule: Rule): boolean => {
  return rule.type === RuleType.SUBTYPE;
};

export const isKeywordRule = (rule: Rule): boolean => {
  return rule.type === RuleType.KEYWORD;
};