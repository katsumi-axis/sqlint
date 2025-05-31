import { LintRule } from '../types';
import { noSelectStar } from './no-select-star';
import { keywordCase } from './keyword-case';
import { tableAlias } from './table-alias';

export const defaultRules: Map<string, LintRule> = new Map([
  ['no-select-star', noSelectStar],
  ['keyword-case', keywordCase],
  ['table-alias', tableAlias]
]);

export function getRuleByName(name: string): LintRule | undefined {
  return defaultRules.get(name);
}

export function getAllRules(): LintRule[] {
  return Array.from(defaultRules.values());
}