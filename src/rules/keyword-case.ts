import { LintRule, LintIssue, LintContext } from '../types';
import { ASTNode } from '../types/sql-parser';

export const keywordCase: LintRule = {
  name: 'keyword-case',
  description: 'Enforce consistent keyword case (uppercase)',
  severity: 'warning',
  enabled: true,
  check: (_ast: ASTNode, context: LintContext): LintIssue[] => {
    const issues: LintIssue[] = [];
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 
                     'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 
                     'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
                     'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
                     'ALTER', 'DROP', 'INDEX', 'VIEW', 'AS'];

    const lines = context.source.split('\n');
    
    lines.forEach((line, lineIndex) => {
      // Skip lines that are within quotes
      const quotedRanges: Array<[number, number]> = [];
      const quoteRegex = /(['"])((?:\\\1|(?:(?!\1).))*)(\1)/g;
      let quoteMatch;
      
      while ((quoteMatch = quoteRegex.exec(line)) !== null) {
        quotedRanges.push([quoteMatch.index, quoteMatch.index + quoteMatch[0].length]);
      }
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        let match: RegExpExecArray | null;
        
        while ((match = regex.exec(line)) !== null) {
          const isInQuotes = quotedRanges.some(([start, end]) => 
            match!.index >= start && match!.index < end
          );
          
          if (!isInQuotes && match[0] !== keyword) {
            issues.push({
              rule: 'keyword-case',
              severity: 'warning',
              message: `Keyword "${match[0]}" should be uppercase "${keyword}"`,
              line: lineIndex + 1,
              column: match.index + 1
            });
          }
        }
      });
    });

    return issues;
  }
};