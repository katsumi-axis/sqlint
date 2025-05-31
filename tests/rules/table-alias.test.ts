import { tableAlias } from '../../src/rules/table-alias';
import { SQLParser } from '../../src/parser';

describe('table-alias rule', () => {
  const parser = new SQLParser();

  it('should flag single character aliases', () => {
    const sql = 'SELECT u.id FROM users u';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);
    
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe('table-alias');
    expect(issues[0].message).toContain('should be meaningful and between 2-30 characters');
    expect(issues[0].message).toContain('"u"');
  });

  it('should flag aliases longer than 30 characters', () => {
    const sql = 'SELECT t.id FROM users AS this_is_a_very_long_alias_that_exceeds_limit';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain('should be meaningful and between 2-30 characters');
  });

  it('should accept aliases between 2-30 characters', () => {
    const sql = 'SELECT usr.id, ord.total FROM users usr JOIN orders ord ON usr.id = ord.user_id';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);
    
    expect(issues).toHaveLength(0);
  });

  it('should not flag tables without aliases', () => {
    const sql = 'SELECT id FROM users';
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);
    
    expect(issues).toHaveLength(0);
  });

  it('should check aliases in JOINs', () => {
    const sql = `
      SELECT *
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      RIGHT JOIN products p ON o.product_id = p.id
    `;
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every(issue => issue.severity === 'info')).toBe(true);
  });

  it('should check aliases in subqueries', () => {
    const sql = `
      SELECT *
      FROM (
        SELECT id FROM users u
      ) AS subq
    `;
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);
    
    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);
    
    // Should flag the 'u' alias inside the subquery
    expect(issues.some(issue => issue.message.includes('"u"'))).toBe(true);
  });
});