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

  it('should handle multiple JOINs with mixed alias validity (valid, too short, too long)', () => {
    const sql = 'SELECT u.id FROM users u JOIN orders ord ON u.id = ord.user_id JOIN products p_too_long_alias_for_this_table ON ord.product_id = p_too_long_alias_for_this_table.id;';
    // 'u' is too short.
    // 'ord' is valid.
    // 'p_too_long_alias_for_this_table' is too long (34 chars).
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);

    expect(issues).toHaveLength(2);
    expect(issues.some(i => i.message.includes('"u"') && i.message.includes('should be meaningful'))).toBe(true);
    expect(issues.some(i => i.message.includes('"p_too_long_alias_for_this_table"') && i.message.includes('should be meaningful'))).toBe(true);
    issues.forEach(issue => {
      expect(issue.rule).toBe('table-alias');
      expect(issue.severity).toBe('info');
      expect(issue.line).toBeUndefined();
      expect(issue.column).toBeUndefined();
    });
  });

  it('should correctly handle different alias styles (with/without AS) and lengths', () => {
    const sql = 'SELECT t1.c1, t.c2, t3good.c3 FROM table1 t1 JOIN table2 AS t ON t1.id = t.id JOIN table3 AS t3good ON t1.id = t3good.id;';
    // 't1' is valid (length 2).
    // 't' (for table2) is too short (length 1).
    // 't3good' (for table3) is valid.
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);

    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('"t"');
    expect(issues[0].message).toContain('should be meaningful and between 2-30 characters');
    expect(issues[0].rule).toBe('table-alias');
    expect(issues[0].severity).toBe('info');
    expect(issues[0].line).toBeUndefined();
    expect(issues[0].column).toBeUndefined();
  });

  it('should check alias lengths in self-joins', () => {
    const sql = 'SELECT e.name, m_too_long_for_an_alias.name FROM employees e JOIN employees m_too_long_for_an_alias ON e.manager_id = m_too_long_for_an_alias.id;';
    // 'e' is too short.
    // 'm_too_long_for_an_alias' is too long (26 chars for the problematic part, but the full alias is longer).
    // The alias is "m_too_long_for_an_alias" (25 chars) - this is actually valid.
    // Let's make it longer: "m_too_long_for_an_alias_indeed_very_long" (38 chars)
    const sql_corrected = 'SELECT e.name, m.name FROM employees e JOIN employees m_too_long_for_an_alias_indeed_very_long ON e.manager_id = m_too_long_for_an_alias_indeed_very_long.id;';
    // 'e' is too short.
    // 'm_too_long_for_an_alias_indeed_very_long' (38 chars) is too long.
    const context = { filename: 'test.sql', source: sql_corrected };
    const { ast } = parser.parse(sql_corrected, context);

    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);

    expect(issues).toHaveLength(2);
    expect(issues.some(i => i.message.includes('"e"') && i.message.includes('should be meaningful'))).toBe(true);
    expect(issues.some(i => i.message.includes('"m_too_long_for_an_alias_indeed_very_long"') && i.message.includes('should be meaningful'))).toBe(true);
    issues.forEach(issue => { // Add checks for common properties
      expect(issue.rule).toBe('table-alias');
      expect(issue.severity).toBe('info');
      expect(issue.line).toBeUndefined();
      expect(issue.column).toBeUndefined();
    });
  });

  it('should check alias lengths for tables in subqueries used in JOINs and for the subquery itself', () => {
    const sql = 'SELECT * FROM (SELECT id, name AS n FROM old_users o) AS sub_good JOIN details d ON sub_good.id = d.detail_id;';
    // 'o' (for old_users inside subquery) is too short.
    // 'n' is a column alias, should be ignored by this rule.
    // 'sub_good' (alias for the subquery result) is valid.
    // 'd' (for details table) is too short.
    const context = { filename: 'test.sql', source: sql };
    const { ast } = parser.parse(sql, context);

    expect(ast).not.toBeNull();
    const issues = tableAlias.check(ast!, context);

    // Expecting issues for 'o' and 'd'.
    expect(issues).toHaveLength(2);
    expect(issues.some(i => i.message.includes('"o"') && i.message.includes('should be meaningful'))).toBe(true);
    expect(issues.some(i => i.message.includes('"d"') && i.message.includes('should be meaningful'))).toBe(true);

    // Ensure 'n' (column alias) and 'sub_good' (valid subquery alias) are not flagged.
    expect(issues.some(i => i.message.includes('"n"'))).toBe(false);
    expect(issues.some(i => i.message.includes('"sub_good"'))).toBe(false);

    issues.forEach(issue => {
      expect(issue.rule).toBe('table-alias');
      expect(issue.severity).toBe('info');
      expect(issue.line).toBeUndefined();
      expect(issue.column).toBeUndefined();
    });
  });
});