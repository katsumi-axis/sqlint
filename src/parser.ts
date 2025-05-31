import { Parser } from 'node-sql-parser';
import { LintContext } from './types';
import { ASTNode, ParseError } from './types/sql-parser';

export class SQLParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  parse(sql: string, context: LintContext): { ast: ASTNode | null; error: ParseError | null } {
    try {
      const ast = this.parser.astify(sql, {
        database: 'MySQL'
      }) as unknown as ASTNode;
      return { ast, error: null };
    } catch (error) {
      const err = error as { message: string; location?: { start?: { line?: number; column?: number } } };
      return {
        ast: null,
        error: {
          message: err.message || 'Unknown parse error',
          location: err.location ? {
            start: {
              line: err.location.start?.line || 1,
              column: err.location.start?.column || 1
            },
            end: {
              line: err.location.start?.line || 1,
              column: err.location.start?.column || 1
            }
          } : undefined
        }
      };
    }
  }

  formatSQL(ast: ASTNode): string {
    try {
      return this.parser.sqlify(ast as never);
    } catch (error) {
      return '';
    }
  }
}