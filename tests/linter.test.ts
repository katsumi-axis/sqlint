import { SQLLinter } from '../src/linter';
import { Config } from '../src/types';

describe('SQLLinter', () => {
  let linter: SQLLinter;

  beforeEach(() => {
    linter = new SQLLinter();
  });

  it('should lint valid SQL without issues', () => {
    const sql = 'SELECT id, name FROM users WHERE active = 1';
    const result = linter.lint(sql, 'test.sql');
    
    expect(result.filename).toBe('test.sql');
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
  });

  it('should detect SELECT * usage', () => {
    const sql = 'SELECT * FROM users';
    const result = linter.lint(sql, 'test.sql');
    
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some(i => i.rule === 'no-select-star')).toBe(true);
  });

  it('should detect lowercase keywords', () => {
    const sql = 'select id, name from users where active = 1';
    const result = linter.lint(sql, 'test.sql');
    
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some(i => i.rule === 'keyword-case')).toBe(true);
  });

  it('should handle parse errors', () => {
    const sql = 'SELECT FROM WHERE';
    const result = linter.lint(sql, 'test.sql');
    
    expect(result.errorCount).toBe(1);
    expect(result.issues[0].rule).toBe('parse-error');
    expect(result.issues[0].severity).toBe('error');
  });

  it('should respect custom configuration', () => {
    const config: Config = {
      rules: {
        'no-select-star': false,
        'keyword-case': ['error']
      }
    };
    
    linter = new SQLLinter(config);
    const sql = 'select * from users';
    const result = linter.lint(sql, 'test.sql');
    
    expect(result.issues.some(i => i.rule === 'no-select-star')).toBe(false);
    expect(result.issues.some(i => i.rule === 'keyword-case' && i.severity === 'error')).toBe(true);
  });

  it('should handle multiple issues in one query', () => {
    const sql = `
      select * from users u
      where u.active = 1
      and u.created_at > '2023-01-01'
      order by u.created_at desc
    `;
    const result = linter.lint(sql, 'test.sql');
    
    expect(result.issues.length).toBeGreaterThan(2);
    expect(result.warningCount).toBeGreaterThan(0);
  });
});