import { PrismaClient } from "@prisma/client";
import { Rule, RuleType } from "../types/rule";

const prisma = new PrismaClient();

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

// CRUD Operations
export async function getAllRules(): Promise<Rule[]> {
  const rules = await prisma.rule.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rules.map(formatRule);
}

export async function getRulesByType(type: RuleType): Promise<Rule[]> {
  const rules = await prisma.rule.findMany({
    where: { type },
    orderBy: { createdAt: 'desc' },
  });
  return rules.map(formatRule);
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
  const updatedRule = await prisma.rule.update({
    where: { id },
    data: ruleData
  });
  return formatRule(updatedRule);
}

export async function deleteRule(id: number): Promise<void> {
  await prisma.rule.delete({
    where: { id },
  });
}