import { LintRule, LintIssue, LintContext } from '../types';
import { ASTNode, SelectStatement, ColumnRef } from '../types/sql-parser';

export const noSelectStar: LintRule = {
  name: 'no-select-star',
  description: 'Disallow SELECT * in queries',
  severity: 'warning',
  enabled: true,
  check: (ast: ASTNode, _context: LintContext): LintIssue[] => {
    const issues: LintIssue[] = [];

    function traverse(node: unknown): void {
      if (node && typeof node === 'object') {
        const astNode = node as ASTNode;
        
        // Check if this is a SELECT node with columns
        if ('type' in astNode && astNode.type === 'select') {
          const selectNode = astNode as SelectStatement;
          if (Array.isArray(selectNode.columns)) {
            // Check each column for SELECT *
            selectNode.columns.forEach(col => {
              if (col.expr && 
                  'type' in col.expr &&
                  col.expr.type === 'column_ref') {
                const columnRef = col.expr as ColumnRef;
                if (columnRef.column === '*') {
                  issues.push({
                    rule: 'no-select-star',
                    severity: 'warning',
                    message: 'Avoid using SELECT *. Specify column names explicitly.',
                    line: columnRef._location?.start?.line || selectNode._location?.start?.line,
                    column: columnRef._location?.start?.column || selectNode._location?.start?.column
                  });
                }
              }
            });
          }
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