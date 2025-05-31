const { Parser } = require('node-sql-parser');

const parser = new Parser();

// Test different SQL queries to understand AST structure
const queries = [
  'SELECT u.id FROM users u',
  'SELECT * FROM users usr JOIN orders ord ON usr.id = ord.user_id',
  'SELECT t.id FROM users this_is_a_very_long_alias_that_exceeds_limit AS t'
];

queries.forEach(sql => {
  console.log('\n=== SQL:', sql);
  try {
    const ast = parser.astify(sql);
    console.log('AST:', JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
});