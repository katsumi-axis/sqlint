import { keywordCase } from '../../src/rules/keyword-case';

describe('keyword-case rule', () => {
  it('should detect lowercase keywords', () => {
    const sql = 'select id from users where active = 1';
    const context = { filename: 'test.sql', source: sql };
    
    const issues = keywordCase.check({}, context);
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.message.includes('"select" should be uppercase "SELECT"'))).toBe(true);
    expect(issues.some(i => i.message.includes('"from" should be uppercase "FROM"'))).toBe(true);
    expect(issues.some(i => i.message.includes('"where" should be uppercase "WHERE"'))).toBe(true);
  });

  it('should not flag uppercase keywords', () => {
    const sql = 'SELECT id FROM users WHERE active = 1';
    const context = { filename: 'test.sql', source: sql };
    
    const issues = keywordCase.check({}, context);
    
    expect(issues).toHaveLength(0);
  });

  it('should detect mixed case keywords', () => {
    const sql = 'Select id From users Where active = 1';
    const context = { filename: 'test.sql', source: sql };
    
    const issues = keywordCase.check({}, context);
    
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should handle keywords in different contexts', () => {
    const sql = `
      select u.id, u.name
      from users u
      left join orders o on u.id = o.user_id
      where u.active = 1
      and o.status in ('active', 'pending')
      order by u.created_at desc
      limit 10
    `;
    const context = { filename: 'test.sql', source: sql };
    
    const issues = keywordCase.check({}, context);
    
    expect(issues.length).toBeGreaterThan(5);
  });

  it('should not flag keywords within strings', () => {
    const sql = "SELECT 'select from where' AS test FROM users";
    const context = { filename: 'test.sql', source: sql };
    
    const issues = keywordCase.check({}, context);
    
    expect(issues).toHaveLength(0);
  });
});