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

  it('should detect various mixed-case keywords with specific locations', () => {
    const sql = 'SeLeCt Id, NaMe FrOm UsErS WhErE AcTiVe = 1;';
    const context = { filename: 'test.sql', source: sql };
    const issues = keywordCase.check({}, context);

    expect(issues).toHaveLength(3); // SELECT, FROM, WHERE

    // Check for 'SeLeCt'
    expect(issues).toContainEqual(
      expect.objectContaining({
        rule: 'keyword-case',
        severity: 'warning',
        message: 'Keyword "SeLeCt" should be uppercase "SELECT"',
        line: 1,
        column: 1,
      })
    );

    // Check for 'FrOm'
    expect(issues).toContainEqual(
      expect.objectContaining({
        rule: 'keyword-case',
        severity: 'warning',
        message: 'Keyword "FrOm" should be uppercase "FROM"',
        line: 1,
        column: 17,
      })
    );

    // Check for 'WhErE'
    expect(issues).toContainEqual(
      expect.objectContaining({
        rule: 'keyword-case',
        severity: 'warning',
        message: 'Keyword "WhErE" should be uppercase "WHERE"',
        line: 1,
        column: 28,
      })
    );
    // 'AcTiVe' is an identifier, not a keyword, so it should not be flagged.
    // 'NaMe' is an identifier, not a keyword, so it should not be flagged.
  });

  it('should detect lowercase/mixed-case keywords in DDL (CREATE TABLE)', () => {
    const sql = 'CrEaTe TaBlE MyTable (Id InTeGeR, DaTa TeXt);';
    // Keywords: CREATE, TABLE, INTEGER, TEXT
    // Note: INTEGER and TEXT are keywords in some SQL dialects, let's check the rule's list.
    // Rule keywords: ['SELECT', ..., 'AS']. 'INTEGER' and 'TEXT' are NOT in the list.
    // So, only CrEaTe and TaBlE should be flagged.
    const context = { filename: 'test.sql', source: sql };
    const issues = keywordCase.check({}, context);

    expect(issues).toHaveLength(2);

    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "CrEaTe" should be uppercase "CREATE"',
        line: 1,
        column: 1,
      })
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "TaBlE" should be uppercase "TABLE"',
        line: 1,
        column: 8,
      })
    );
  });

  it('should correctly handle potential keywords like INDEX, VIEW, ON, AS used as keywords or parts of identifiers', () => {
    const sql = 'CREATE InDeX idx_name oN table_name (column_key); sElEcT VIEW_FIELD aS aliased_field FrOm some_view;';
    // Keywords from the query: CREATE, INDEX, ON, SELECT, AS, FROM
    // Mixed/lowercase ones: InDeX, oN, sElEcT, aS, FrOm
    // CREATE is fine.
    // idx_name, table_name, column_key, VIEW_FIELD, aliased_field, some_view are identifiers.

    const context = { filename: 'test.sql', source: sql };
    const issues = keywordCase.check({}, context);

    // Expected issues for: InDeX, oN, sElEcT, aS, FrOm (5 issues)
    expect(issues).toHaveLength(5);

    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "InDeX" should be uppercase "INDEX"',
        line: 1,
        column: 8, // "CREATE " is 7 chars
      })
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "oN" should be uppercase "ON"',
        line: 1,
        column: 23,
      })
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "sElEcT" should be uppercase "SELECT"',
        line: 1,
        column: 51,
      })
    );
     expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "aS" should be uppercase "AS"',
        line: 1,
        column: 69,
      })
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "FrOm" should be uppercase "FROM"',
        line: 1,
        column: 86,
      })
    );
  });

  it('should detect lowercase/mixed-case keywords in DML (INSERT INTO, VALUES)', () => {
    const sql = 'InSeRt InTo MyTable (Col1, Col2) VaLuEs (1, \'test\');';
    // Keywords: INSERT, INTO, VALUES
    const context = { filename: 'test.sql', source: sql };
    const issues = keywordCase.check({}, context);

    expect(issues).toHaveLength(3);

    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "InSeRt" should be uppercase "INSERT"',
        line: 1,
        column: 1,
      })
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "InTo" should be uppercase "INTO"',
        line: 1,
        column: 8,
      })
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        message: 'Keyword "VaLuEs" should be uppercase "VALUES"',
        line: 1,
        column: 34,
      })
    );
  });
});