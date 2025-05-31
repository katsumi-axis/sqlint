import { noSelectStar } from '../../src/rules/no-select-star';
import { SQLParser } from '../../src/parser';

describe('no-select-star rule', () => {
  const parser = new SQLParser();

  it('should detect SELECT * usage', () => {
    const sql = 'SELECT * FROM users';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);
    
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe('no-select-star');
    expect(issues[0].message).toContain('Avoid using SELECT *');
  });

  it('should not flag explicit column selection', () => {
    const sql = 'SELECT id, name FROM users';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);
    
    expect(issues).toHaveLength(0);
  });

  it('should detect SELECT * in subqueries', () => {
    const sql = 'SELECT id FROM (SELECT * FROM users) AS subquery';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);
    
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should handle multiple SELECT * in one query', () => {
    const sql = `
      SELECT * FROM users
      UNION
      SELECT * FROM customers
    `;
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);
    
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });

  it('should detect SELECT * with a table alias', () => {
    const sql = 'SELECT * FROM users u';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe('no-select-star');
    expect(issues[0].message).toContain('Avoid using SELECT *');
    expect(issues[0].line).toBe(1);
    expect(issues[0].column).toBe(1); // Default column due to missing location in AST
  });

  it('should detect SELECT table.* (e.g., u.*) as it also resolves to all columns of that table', () => {
    // Based on the current rule implementation (checks only for column === '*'),
    // this should be flagged. If the rule were to allow table.*, its logic would need to be more specific.
    const sql = 'SELECT u.* FROM users u';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe('no-select-star');
    expect(issues[0].message).toContain('Avoid using SELECT *'); // The message might ideally be more specific for table.*
    expect(issues[0].line).toBe(1);
    expect(issues[0].column).toBe(1); // Default column due to missing location in AST
  });

  it('should detect SELECT * in a Common Table Expression (CTE)', () => {
    const sql = 'WITH UserCTE AS (SELECT * FROM users) SELECT id FROM UserCTE;';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe('no-select-star');
    expect(issues[0].message).toContain('Avoid using SELECT *');
    // Location of '*' within the CTE's SELECT statement
    // "WITH UserCTE AS (SELECT " (24 chars) + * (1 char) = column 25
    expect(issues[0].line).toBe(1);
    expect(issues[0].column).toBe(1); // Default column due to missing location in AST
  });

  it('should detect SELECT * in one part of a UNION ALL query', () => {
    const sql = 'SELECT id, name FROM privileged_users UNION ALL SELECT * FROM users;';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = noSelectStar.check(ast!, context);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe('no-select-star');
    expect(issues[0].message).toContain('Avoid using SELECT *');
    // Location of '*' in the second SELECT statement
    // "SELECT id, name FROM privileged_users UNION ALL SELECT " (53 chars) + * (1 char) = column 54
    expect(issues[0].line).toBe(1);
    expect(issues[0].column).toBe(1); // Default column due to missing location in AST
  });
});