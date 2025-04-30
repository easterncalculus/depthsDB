import prisma from "./prisma";
import { Rule, RuleType } from "../types/rule";

// Convert the Prisma Rule model to our typed Rule
export const formatRule = (dbRule: any): Rule => {
  return {
    id: dbRule.id,
    name: dbRule.name,
    description: dbRule.description,
    type: dbRule.type as RuleType,
    createdAt: dbRule.createdAt,
    updatedAt: dbRule.updatedAt
  };
};

// Search options interface
export interface RuleSearchOptions {
  type?: string;
  search?: string;
}

// CRUD Operations
export async function getAllRules(options: RuleSearchOptions = {}): Promise<Rule[]> {
  // Build filter based on search options
  const filter: any = {};
  
  // Add type filter if provided
  if (options.type) {
    filter.type = options.type;
  }
  
  // Add search term if provided (searches in name and description)
  if (options.search) {
    filter.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } }
    ];
  }
  
  const rules = await prisma.rule.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
  });
  
  return rules.map(formatRule);
}

export async function getRulesByType(type: RuleType): Promise<Rule[]> {
  return getAllRules({ type });
}

export async function getRuleById(id: number): Promise<Rule | null> {
  const rule = await prisma.rule.findUnique({
    where: { id },
  });
  return rule ? formatRule(rule) : null;
}

export async function createRule(ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
  const createdRule = await prisma.rule.create({
    data: ruleData
  });
  return formatRule(createdRule);
}

export async function updateRule(id: number, ruleData: Partial<Rule>): Promise<Rule> {
  // Remove any properties that shouldn't be sent to the database
  const { id: _, createdAt, updatedAt, references, ...dataToUpdate } = ruleData as any;
  
  const updatedRule = await prisma.rule.update({
    where: { id: id },
    data: dataToUpdate
  });
  return formatRule(updatedRule);
}

export async function deleteRule(id: number): Promise<void> {
  await prisma.rule.delete({
    where: { id },
  });
}