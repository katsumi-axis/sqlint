# SQLint - SQL Linter

A fast and extensible SQL linter for checking SQL query syntax and enforcing coding standards.

## Features

- **Syntax Validation**: Detects SQL syntax errors before execution
- **Style Enforcement**: Ensures consistent SQL coding style across your project
- **Extensible Rules**: Easy to add custom linting rules
- **Multiple SQL Dialects**: Supports MySQL, PostgreSQL, and more (via node-sql-parser)
- **Configuration Files**: Customize rules per project with `.sqlintrc.yml`
- **CLI Integration**: Easy to integrate into CI/CD pipelines
- **Detailed Error Reports**: Clear error messages with line and column information

## Installation

```bash
npm install -g sqlint
```

Or install locally in your project:

```bash
npm install --save-dev sqlint
```

## Usage

### Command Line

```bash
# Lint a single file
sqlint query.sql

# Lint multiple files
sqlint queries/*.sql

# Use a custom config file
sqlint --config custom-config.yml queries/*.sql

# Initialize a default configuration
sqlint --init
```

### Programmatic API

```javascript
const { SQLLinter } = require('sqlint');

const linter = new SQLLinter({
  rules: {
    'no-select-star': 'error',
    'keyword-case': 'warning'
  }
});

const result = linter.lint('SELECT * FROM users', 'query.sql');
console.log(result.issues);
```

## Configuration

Create a `.sqlintrc.yml` file in your project root:

```yaml
rules:
  no-select-star: warning
  keyword-case: error
  table-alias: info

# Extend from predefined configs (future feature)
# extends:
#   - recommended

# Ignore specific files
# ignorePatterns:
#   - "migrations/*.sql"
#   - "temp/*.sql"
```

## Available Rules

### no-select-star
Disallows the use of `SELECT *` in queries. Encourages explicit column selection for better performance and maintainability.

```sql
# Bad
SELECT * FROM users;

# Good
SELECT id, name, email FROM users;
```

### keyword-case
Enforces uppercase SQL keywords for consistency.

```sql
# Bad
select id from users where active = 1;

# Good
SELECT id FROM users WHERE active = 1;
```

### table-alias
Ensures table aliases are meaningful (2-30 characters).

```sql
# Bad
SELECT * FROM users u;

# Good
SELECT * FROM users usr;
```

## Exit Codes

- `0`: Linting passed without errors
- `1`: Linting failed with one or more errors

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Test specific files
npm test parser.test.ts
```

## Examples

See the `examples/` directory for sample SQL files:
- `good.sql`: Well-formatted SQL that passes all rules
- `bad.sql`: SQL with various linting issues
- `syntax-error.sql`: SQL with syntax errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-rule`)
3. Add tests for your changes
4. Make your changes
5. Run tests (`npm test`)
6. Commit your changes (`git commit -am 'Add new rule'`)
7. Push to the branch (`git push origin feature/new-rule`)
8. Create a Pull Request

## License

MIT