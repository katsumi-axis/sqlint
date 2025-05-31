# SQL Linter - Execution Guide

## Overview
This document provides a comprehensive guide to execute and use the SQL Linter project.

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

## Running the Linter

### Command Line Interface

#### Basic Usage
```bash
# Lint a single file
node dist/cli.js query.sql

# Lint multiple files
node dist/cli.js queries/*.sql

# Lint all SQL files in a directory
node dist/cli.js **/*.sql
```

#### Initialize Configuration
```bash
node dist/cli.js --init
```
This creates a `.sqlintrc.yml` configuration file.

#### Specify Custom Configuration
```bash
node dist/cli.js --config custom-config.yml queries/*.sql
```

#### Output Formats
```bash
# Default (stylish) format
node dist/cli.js queries/*.sql

# JSON format
node dist/cli.js --format json queries/*.sql
```

### Global Installation (Optional)
```bash
# Install globally
npm install -g .

# Use anywhere
sqlint queries/*.sql
```

## Development Commands

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test parser.test.ts
```

### Development Mode
```bash
# Watch mode for TypeScript compilation
npm run dev
```

### Linting the Linter Code
```bash
# Run ESLint on the source code
npm run lint

# Type checking only
npm run typecheck
```

## Configuration

### Basic Configuration (.sqlintrc.yml)
```yaml
rules:
  no-select-star: warning
  keyword-case: error
  table-alias: info
```

### Advanced Configuration
```yaml
rules:
  no-select-star: [error]
  keyword-case: [warning]
  table-alias: false  # Disable this rule

ignorePatterns:
  - "migrations/*.sql"
  - "temp/*.sql"
```

## Testing Examples

### Test with Provided Examples
```bash
# Good SQL (should pass)
node dist/cli.js examples/good.sql

# Bad SQL (should show warnings)
node dist/cli.js examples/bad.sql

# Syntax errors (should show errors)
node dist/cli.js examples/syntax-error.sql
```

## Exit Codes
- `0`: Success, no errors found
- `1`: Errors were found

## Programmatic Usage

### Basic Example
```javascript
const { SQLLinter } = require('./dist/index');

const linter = new SQLLinter();
const result = linter.lint('SELECT * FROM users', 'query.sql');

console.log('Issues found:', result.issues);
console.log('Error count:', result.errorCount);
console.log('Warning count:', result.warningCount);
```

### Custom Configuration
```javascript
const { SQLLinter } = require('./dist/index');

const config = {
  rules: {
    'no-select-star': ['error'],
    'keyword-case': ['warning'],
    'table-alias': false
  }
};

const linter = new SQLLinter(config);
const sql = `
  SELECT id, name 
  FROM users u 
  WHERE u.active = 1
`;

const result = linter.lint(sql, 'query.sql');
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   ```bash
   npm install
   npm run build
   ```

2. **Permission denied when running CLI**
   ```bash
   chmod +x dist/cli.js
   ```

3. **TypeScript errors**
   ```bash
   npm run typecheck
   ```

## Project Structure
```
sqlint/
├── src/                # TypeScript source files
│   ├── cli.ts         # CLI implementation
│   ├── linter.ts      # Core linter logic
│   ├── parser.ts      # SQL parser wrapper
│   ├── config.ts      # Configuration loader
│   ├── rules/         # Linting rules
│   └── types/         # TypeScript type definitions
├── dist/              # Compiled JavaScript files
├── tests/             # Test files
├── examples/          # Example SQL files
├── package.json       # Project configuration
├── tsconfig.json      # TypeScript configuration
├── jest.config.js     # Jest test configuration
└── .eslintrc.js       # ESLint configuration
```

## Adding New Rules

1. Create a new rule file in `src/rules/`
2. Implement the `LintRule` interface
3. Add the rule to `src/rules/index.ts`
4. Write tests in `tests/rules/`
5. Update documentation

Example rule structure:
```typescript
import { LintRule, LintIssue, LintContext } from '../types';

export const myRule: LintRule = {
  name: 'my-rule',
  description: 'Description of what this rule checks',
  severity: 'warning',
  enabled: true,
  check: (ast: any, context: LintContext): LintIssue[] => {
    const issues: LintIssue[] = [];
    // Rule logic here
    return issues;
  }
};
```

## Performance Testing

For large SQL files or many files:
```bash
# Time the execution
time node dist/cli.js large-queries/*.sql

# Profile memory usage
node --max-old-space-size=4096 dist/cli.js huge-file.sql
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Lint SQL files
  run: |
    npm install
    npm run build
    node dist/cli.js queries/*.sql
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run build && node dist/cli.js $(git diff --cached --name-only --diff-filter=ACM | grep '\.sql$')
```