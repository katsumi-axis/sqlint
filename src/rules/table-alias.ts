import { LintRule, LintIssue, LintContext } from '../types';
import { ASTNode } from '../types/sql-parser';

export const tableAlias: LintRule = {
  name: 'table-alias',
  description: 'Enforce meaningful table aliases',
  severity: 'info',
  enabled: true,
  check: (ast: ASTNode, _context: LintContext): LintIssue[] => {
    const issues: LintIssue[] = [];

    function traverse(node: unknown): void {
      if (node && typeof node === 'object') {
        const obj = node as Record<string, unknown>;
        
        // Check if this is a from clause with tables
        if (Array.isArray(obj.from)) {
          obj.from.forEach((table: unknown) => {
            if (table && typeof table === 'object') {
              const tableObj = table as Record<string, unknown>;
              if (tableObj.as && typeof tableObj.as === 'string') {
                const alias = tableObj.as;
                
                if (alias.length === 1 || alias.length > 30) {
                  issues.push({
                    rule: 'table-alias',
                    severity: 'info',
                    message: `Table alias "${alias}" should be meaningful and between 2-30 characters`,
                    line: undefined,
                    column: undefined
                  });
                }
              }
            }
          });
        }

        if (Array.isArray(node)) {
          (node as unknown[]).forEach(traverse);
        } else {
          Object.values(node as Record<string, unknown>).forEach(traverse);
        }
      }
    }

    traverse(ast);
    return issues;
  }
};