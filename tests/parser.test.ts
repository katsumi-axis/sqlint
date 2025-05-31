import { SQLParser } from '../src/parser';

describe('SQLParser', () => {
  let parser: SQLParser;

  beforeEach(() => {
    parser = new SQLParser();
  });

  describe('parse', () => {
    it('should parse valid SELECT statement', () => {
      const sql = 'SELECT id, name FROM users WHERE id = 1';
      const context = { filename: 'test.sql', source: sql };
      
      const result = parser.parse(sql, context);
      
      expect(result.error).toBeNull();
      expect(result.ast).toBeDefined();
      expect(result.ast).toBeDefined();
      if (result.ast && !Array.isArray(result.ast)) {
        expect(result.ast.type).toBe('select');
      }
    });

    it('should parse SELECT with JOIN', () => {
      const sql = `
        SELECT u.id, u.name, o.total
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.active = 1
      `;
      const context = { filename: 'test.sql', source: sql };
      
      const result = parser.parse(sql, context);
      
      expect(result.error).toBeNull();
      expect(result.ast).toBeDefined();
    });

    it('should return error for invalid SQL', () => {
      const sql = 'SELECT FROM WHERE';
      const context = { filename: 'test.sql', source: sql };
      
      const result = parser.parse(sql, context);
      
      expect(result.error).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Expected');
      expect(result.ast).toBeNull();
    });

    it('should parse INSERT statement', () => {
      const sql = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')";
      const context = { filename: 'test.sql', source: sql };
      
      const result = parser.parse(sql, context);
      
      expect(result.error).toBeNull();
      expect(result.ast).toBeDefined();
      expect(result.ast).toBeDefined();
      if (result.ast && !Array.isArray(result.ast)) {
        expect(result.ast.type).toBe('insert');
      }
    });

    it('should parse UPDATE statement', () => {
      const sql = "UPDATE users SET name = 'Jane' WHERE id = 1";
      const context = { filename: 'test.sql', source: sql };
      
      const result = parser.parse(sql, context);
      
      expect(result.error).toBeNull();
      expect(result.ast).toBeDefined();
      expect(result.ast).toBeDefined();
      if (result.ast && !Array.isArray(result.ast)) {
        expect(result.ast.type).toBe('update');
      }
    });

    it('should parse DELETE statement', () => {
      const sql = 'DELETE FROM users WHERE id = 1';
      const context = { filename: 'test.sql', source: sql };
      
      const result = parser.parse(sql, context);
      
      expect(result.error).toBeNull();
      expect(result.ast).toBeDefined();
      expect(result.ast).toBeDefined();
      if (result.ast && !Array.isArray(result.ast)) {
        expect(result.ast.type).toBe('delete');
      }
    });
  });
});