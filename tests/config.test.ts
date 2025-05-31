import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../src/config';

describe('Config Loading', () => {
  const testConfigDir = path.join(__dirname, 'test-configs');
  
  beforeAll(() => {
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir, { recursive: true });
    }
  });

  afterAll(() => {
    fs.rmSync(testConfigDir, { recursive: true, force: true });
  });

  it('should load YAML configuration', async () => {
    const yamlConfig = `
rules:
  no-select-star: error
  keyword-case: warning
  table-alias: false
`;
    const configPath = path.join(testConfigDir, 'test.yml');
    fs.writeFileSync(configPath, yamlConfig);

    const config = await loadConfig(configPath);
    expect(config).toBeDefined();
    expect(config?.rules['no-select-star']).toBe('error');
    expect(config?.rules['keyword-case']).toBe('warning');
    expect(config?.rules['table-alias']).toBe(false);
  });

  it('should load JSON configuration', async () => {
    const jsonConfig = {
      rules: {
        'no-select-star': ['error'],
        'keyword-case': ['warning', { uppercase: true }]
      }
    };
    const configPath = path.join(testConfigDir, 'test.json');
    fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2));

    const config = await loadConfig(configPath);
    expect(config).toBeDefined();
    expect(config?.rules['no-select-star']).toEqual(['error']);
    expect(config?.rules['keyword-case']).toEqual(['warning', { uppercase: true }]);
  });

  it('should return undefined when no config file exists', async () => {
    const originalCwd = process.cwd();
    process.chdir(testConfigDir);
    
    try {
      const config = await loadConfig();
      expect(config).toBeUndefined();
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should throw error for invalid config format', async () => {
    const configPath = path.join(testConfigDir, 'test.txt');
    fs.writeFileSync(configPath, 'invalid config');

    await expect(loadConfig(configPath)).rejects.toThrow('Unsupported config file format');
  });

  it('should throw error for malformed YAML', async () => {
    const configPath = path.join(testConfigDir, 'malformed.yml');
    fs.writeFileSync(configPath, 'rules:\n  no-select-star: [[[');

    await expect(loadConfig(configPath)).rejects.toThrow();
  });

  it('should validate config structure', async () => {
    const invalidConfig = path.join(testConfigDir, 'invalid.json');
    fs.writeFileSync(invalidConfig, JSON.stringify({ notRules: {} }));

    await expect(loadConfig(invalidConfig)).rejects.toThrow('Config must have a rules object');
  });
});