import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Config } from './types';
import { pathToFileURL } from 'url';

const CONFIG_FILES = ['.sqlintrc.yml', '.sqlintrc.yaml', '.sqlintrc.json', 'sqlint.config.js'];

export async function loadConfig(configPath?: string): Promise<Config | undefined> {
  try {
    if (configPath) {
      return await loadConfigFile(configPath);
    }

    for (const filename of CONFIG_FILES) {
      const filePath = path.resolve(process.cwd(), filename);
      if (fs.existsSync(filePath)) {
        return await loadConfigFile(filePath);
      }
    }

    return undefined;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to load configuration: ${err.message}`);
  }
}

async function loadConfigFile(filePath: string): Promise<Config> {
  const ext = path.extname(filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    switch (ext) {
      case '.yml':
      case '.yaml': {
        const config = yaml.load(content) as Config;
        validateConfig(config);
        return config;
      }
      case '.json': {
        const config = JSON.parse(content) as Config;
        validateConfig(config);
        return config;
      }
      case '.js': {
        // Use dynamic import for JS files
        const fileUrl = pathToFileURL(path.resolve(filePath)).href;
        const module = await import(fileUrl);
        const config = module.default || module;
        validateConfig(config);
        return config;
      }
      default:
        throw new Error(`Unsupported config file format: ${ext}`);
    }
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to load config file ${filePath}: ${err.message}`);
  }
}

function validateConfig(config: unknown): asserts config is Config {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object');
  }
  
  const cfg = config as Record<string, unknown>;
  
  if (!cfg.rules || typeof cfg.rules !== 'object') {
    throw new Error('Config must have a rules object');
  }
}