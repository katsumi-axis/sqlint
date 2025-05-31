#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { SQLLinter } from './linter';
import { Config, LintResult } from './types';
import { loadConfig } from './config';

const program = new Command();

program
  .name('sqlint')
  .description('SQL Linter - Check SQL files for syntax and style issues')
  .version('1.0.0');

program
  .argument('[files...]', 'SQL files to lint (supports glob patterns)')
  .option('-c, --config <path>', 'path to configuration file')
  .option('--init', 'create a default configuration file')
  .option('--fix', 'automatically fix fixable issues (not implemented yet)')
  .option('--format <format>', 'output format (stylish, json)', 'stylish')
  .action(async (files: string[], options) => {
    if (options.init) {
      createDefaultConfig();
      return;
    }

    if (files.length === 0) {
      console.error(chalk.red('Error: No files specified'));
      program.help();
      return;
    }

    const config = await loadConfig(options.config);
    const linter = new SQLLinter(config);
    const results: LintResult[] = [];

    for (const pattern of files) {
      const matchedFiles = await glob(pattern);
      
      for (const file of matchedFiles) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const result = linter.lint(content, file);
          results.push(result);
        } catch (error) {
          const err = error as Error;
          console.error(chalk.red(`Error reading file ${file}: ${err.message}`));
        }
      }
    }

    displayResults(results, options.format);
    
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    
    if (totalErrors > 0) {
      process.exit(1);
    }
  });

function createDefaultConfig() {
  const configContent = `rules:
  no-select-star: warning
  keyword-case: warning
  table-alias: info

# extends:
#   - recommended

# ignorePatterns:
#   - "migrations/*.sql"
#   - "temp/*.sql"
`;

  fs.writeFileSync('.sqlintrc.yml', configContent);
  console.log(chalk.green('Created .sqlintrc.yml configuration file'));
}

function displayResults(results: LintResult[], format: string) {
  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    if (result.issues.length === 0) continue;

    console.log(chalk.underline(result.filename));
    
    for (const issue of result.issues) {
      const position = issue.line ? `${issue.line}:${issue.column || 1}` : '0:0';
      const severity = issue.severity === 'error' ? chalk.red('error') :
                      issue.severity === 'warning' ? chalk.yellow('warning') :
                      chalk.blue('info');
      
      console.log(`  ${position}  ${severity}  ${issue.message}  ${chalk.gray(issue.rule)}`);
    }
    
    console.log('');
    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;
  }

  if (totalErrors > 0 || totalWarnings > 0) {
    const summary = [];
    if (totalErrors > 0) summary.push(chalk.red(`${totalErrors} error${totalErrors > 1 ? 's' : ''}`));
    if (totalWarnings > 0) summary.push(chalk.yellow(`${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}`));
    
    console.log(`✖ ${summary.join(', ')}`);
  } else if (results.length > 0) {
    console.log(chalk.green('✓ All files passed linting'));
  }
}

program.parse();