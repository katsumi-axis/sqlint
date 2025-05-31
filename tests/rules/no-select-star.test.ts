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
});