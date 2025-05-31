# SQLint Design Document

## Overview

SQLint is a SQL linter designed to help developers maintain consistent SQL code quality by detecting syntax errors and enforcing coding standards. The tool is built with TypeScript and uses the node-sql-parser library for SQL parsing.

## Architecture

### Core Components

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│      CLI        │────▶│    Linter    │────▶│   Parser    │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      │                     │
         ▼                      ▼                     ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Config Loader  │     │    Rules     │     │     AST     │
└─────────────────┘     └──────────────┘     └─────────────┘
```

### Component Descriptions

#### 1. CLI (cli.ts)
- Entry point for command-line usage
- Handles file globbing and argument parsing
- Formats and displays linting results
- Manages process exit codes

#### 2. Linter (linter.ts)
- Core linting engine
- Orchestrates parsing and rule execution
- Aggregates issues from all rules
- Manages configuration

#### 3. Parser (parser.ts)
- Wrapper around node-sql-parser
- Converts SQL text to AST
- Handles parse errors gracefully
- Supports multiple SQL dialects

#### 4. Rules Engine (rules/)
- Individual rule implementations
- Each rule is self-contained
- Rules traverse the AST and report issues
- Extensible architecture for custom rules

#### 5. Configuration (config.ts)
- Loads configuration from multiple sources
- Supports YAML, JSON, and JS configs
- Merges configurations with defaults

## Data Flow

1. **Input**: SQL files or content
2. **Parsing**: SQL → AST transformation
3. **Analysis**: Rules analyze AST
4. **Output**: Formatted lint results

## Rule Architecture

### Rule Interface

```typescript
interface LintRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  check: (ast: any, context: LintContext) => LintIssue[];
}
```

### Rule Implementation Pattern

```typescript
export const ruleName: LintRule = {
  name: 'rule-name',
  description: 'Rule description',
  severity: 'warning',
  enabled: true,
  check: (ast, context) => {
    const issues = [];
    // AST traversal and analysis
    return issues;
  }
};
```

## Configuration System

### Configuration Priority (highest to lowest)

1. Command-line flags
2. Project configuration file
3. Default configuration

### Configuration File Formats

- `.sqlintrc.yml` / `.sqlintrc.yaml`
- `.sqlintrc.json`
- `sqlint.config.js`

## Error Handling

### Parse Errors
- Captured and reported as lint issues
- Include line/column information
- Non-blocking for other files

### Rule Errors
- Isolated per rule
- Logged but don't stop linting
- Graceful degradation

## Performance Considerations

### Optimizations
- Lazy rule loading
- Single AST pass for all rules
- Minimal dependencies
- Efficient file I/O with glob patterns

### Scalability
- Stateless rule execution
- Parallel file processing capability
- Memory-efficient AST traversal

## Testing Strategy

### Unit Tests
- Parser functionality
- Individual rule logic
- Configuration loading
- Core linter behavior

### Integration Tests
- CLI functionality
- End-to-end workflows
- Configuration precedence

### Test Coverage Goals
- Minimum 80% code coverage
- 100% coverage for core functionality
- Edge case coverage for all rules

## Future Enhancements

### Planned Features
1. **Auto-fix capability**: Automatically fix certain issues
2. **Custom rule plugins**: Load rules from npm packages
3. **IDE integrations**: VSCode, IntelliJ extensions
4. **More SQL dialects**: Oracle, SQL Server specific rules
5. **Performance rules**: Detect potential performance issues
6. **Security rules**: SQL injection prevention patterns

### Extension Points
- Rule API for third-party rules
- Custom formatters for output
- Preprocessor hooks
- AST transformation API

## Dependencies

### Production Dependencies
- `node-sql-parser`: SQL parsing
- `commander`: CLI framework
- `chalk`: Terminal styling
- `glob`: File pattern matching
- `js-yaml`: YAML configuration parsing

### Development Dependencies
- `typescript`: Type safety
- `jest`: Testing framework
- `eslint`: Code quality
- `ts-jest`: TypeScript testing

## Build and Release Process

### Development Workflow
1. Write code with TypeScript
2. Run tests with Jest
3. Build with TypeScript compiler
4. Package for distribution

### Release Checklist
- [ ] Update version in package.json
- [ ] Run full test suite
- [ ] Build production bundle
- [ ] Update CHANGELOG
- [ ] Tag release in git
- [ ] Publish to npm

## Security Considerations

### Input Validation
- File path sanitization
- Configuration validation
- Safe AST traversal

### Output Safety
- No code execution
- Safe error messages
- Sanitized file paths in output