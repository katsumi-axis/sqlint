import { ASTNode } from './sql-parser';

export interface LintRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  check: (ast: ASTNode, context: LintContext) => LintIssue[];
}

export interface LintIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

export interface LintContext {
  filename: string;
  source: string;
  options?: Record<string, unknown>;
}

export interface LintResult {
  filename: string;
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
}

export interface Config {
  rules: {
    [ruleName: string]: boolean | ['error' | 'warning' | 'info', Record<string, unknown>?];
  };
  extends?: string[];
  ignorePatterns?: string[];
}

export * from './sql-parser';