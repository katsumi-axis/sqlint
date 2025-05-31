import { SQLParser } from './parser';
import { getAllRules, getRuleByName } from './rules';
import { LintResult, LintContext, Config, LintIssue } from './types';

export class SQLLinter {
  private parser: SQLParser;
  private config: Config;

  constructor(config?: Config) {
    this.parser = new SQLParser();
    this.config = config || this.getDefaultConfig();
  }

  private getDefaultConfig(): Config {
    return {
      rules: {
        'no-select-star': ['warning'],
        'keyword-case': ['warning'],
        'table-alias': ['info']
      }
    };
  }

  lint(source: string, filename: string = 'input.sql'): LintResult {
    const context: LintContext = { filename, source };
    const issues: LintIssue[] = [];
    
    const { ast, error } = this.parser.parse(source, context);
    
    if (error) {
      issues.push({
        rule: 'parse-error',
        severity: 'error',
        message: `SQL Parse Error: ${error.message}`,
        line: error.location?.start?.line,
        column: error.location?.start?.column
      });
    } else if (ast) {
      const enabledRules = this.getEnabledRules();
      
      for (const rule of enabledRules) {
        const ruleIssues = rule.check(ast, context);
        // Update severity based on configuration
        const configuredSeverity = this.getRuleSeverity(rule.name);
        ruleIssues.forEach(issue => {
          issue.severity = configuredSeverity || issue.severity;
        });
        issues.push(...ruleIssues);
      }
    }

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    return {
      filename,
      issues,
      errorCount,
      warningCount
    };
  }

  private getEnabledRules() {
    const rules = [];
    
    for (const [ruleName, ruleConfig] of Object.entries(this.config.rules)) {
      if (ruleConfig === false) continue;
      
      const rule = getRuleByName(ruleName);
      if (!rule) continue;
      
      const severity = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;
      if (typeof severity === 'string') {
        rules.push({
          ...rule,
          severity: severity as 'error' | 'warning' | 'info'
        });
      }
    }
    
    return rules;
  }

  private getRuleSeverity(ruleName: string): 'error' | 'warning' | 'info' | undefined {
    const ruleConfig = this.config.rules[ruleName];
    if (!ruleConfig) return undefined;
    if (typeof ruleConfig === 'boolean') {
      return ruleConfig ? undefined : undefined;
    }
    
    if (Array.isArray(ruleConfig)) {
      return ruleConfig[0];
    }
    
    return undefined;
  }
}