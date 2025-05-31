import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('CLI', () => {
  const testDir = path.join(__dirname, 'cli-test-files');
  const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
  
  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Build the project
    execSync('pnpm run build', { cwd: path.join(__dirname, '..') });
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should lint a valid SQL file without errors', () => {
    const sqlFile = path.join(testDir, 'valid.sql');
    fs.writeFileSync(sqlFile, 'SELECT id, name FROM users WHERE active = 1;');

    const result = execSync(`node ${cliPath} ${sqlFile}`, { encoding: 'utf-8' });
    expect(result).toContain('All files passed linting');
  });

  it('should detect linting warnings', () => {
    const sqlFile = path.join(testDir, 'invalid.sql');
    fs.writeFileSync(sqlFile, 'select * from users;');

    const result = execSync(`node ${cliPath} ${sqlFile}`, { encoding: 'utf-8' });
    expect(result).toContain('warning');
    expect(result).toContain('select');
    expect(result).toContain('SELECT');
  });

  it('should handle syntax errors', () => {
    const sqlFile = path.join(testDir, 'syntax-error.sql');
    fs.writeFileSync(sqlFile, 'SELECT FROM WHERE;');

    try {
      execSync(`node ${cliPath} ${sqlFile}`, { encoding: 'utf-8', stdio: 'pipe' });
      fail('Expected command to exit with error');
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stdout.toString()).toContain('SQL Parse Error');
    }
  });

  it('should output JSON format when requested', () => {
    const sqlFile = path.join(testDir, 'test.sql');
    fs.writeFileSync(sqlFile, 'SELECT * FROM users;');

    const result = execSync(`node ${cliPath} --format json ${sqlFile}`, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    }).toString();

    const json = JSON.parse(result);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0]).toHaveProperty('filename');
    expect(json[0]).toHaveProperty('issues');
  });

  it('should create default config with --init', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      execSync(`node ${cliPath} --init`, { encoding: 'utf-8' });
      expect(fs.existsSync(path.join(testDir, '.sqlintrc.yml'))).toBe(true);
      
      const config = fs.readFileSync(path.join(testDir, '.sqlintrc.yml'), 'utf-8');
      expect(config).toContain('no-select-star');
      expect(config).toContain('keyword-case');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should handle multiple files', () => {
    const file1 = path.join(testDir, 'file1.sql');
    const file2 = path.join(testDir, 'file2.sql');
    fs.writeFileSync(file1, 'SELECT id FROM users;');
    fs.writeFileSync(file2, 'SELECT name FROM users;');

    const result = execSync(`node ${cliPath} ${file1} ${file2}`, { encoding: 'utf-8' });
    expect(result).toContain('All files passed linting');
  });
});