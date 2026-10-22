/**
 * config.ts — Load and validate ac-runtime.json
 *
 * One function: loadConfig(). Finds ac-runtime.json,
 * validates required fields, returns a plain object.
 */
import * as fs from 'fs';
import * as path from 'path';

/**
 * Thrown by loadConfig() when ac-runtime.json is missing or invalid.
 * Callers can catch this error instead of the process being terminated by process.exit.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export type AssetMapping = {
  /** Directory path relative to project root. Must exist. */
  directory: string;
  /** URL prefix to serve this directory at. Must start with /. */
  url: string;
};

export type StaticResourceMapping = {
  /** Source file or directory path relative to project root or node_modules. */
  path: string;
  /** Target build output path relative to build directory (e.g. assets/third-party/foo). */
  buildPath: string;
};

export type AcRuntimeConfig = {
  /** Absolute path to the directory containing ac-runtime.json. */
  projectRoot: string;
  /** Project name (required). */
  name: string;
  /** Project version (required). */
  version: string;
  /** Optional description. */
  description?: string;
  /** Absolute path to the entry file. */
  entryFile: string;
  /** Project type — 'app' or 'library'. */
  type: 'app' | 'library';
  /** Name of the output file when building as library. */
  buildFile?: string;
  /** Build output directory, relative to project root. Default: 'dist'. */
  buildDirectory: string;
  /** Cache directory for generated files, relative to project root. Default: '.ac-runtime-cache'. */
  cacheDirectory: string;
  /** Asset directory mappings. Default: []. */
  assets: AssetMapping[];
  /** Static copy/serve resource mappings. Default: []. */
  staticResources: StaticResourceMapping[];
  /** Library build formats. E.g. ['es', 'umd']. Default: ['es']. */
  buildFormats?: ('es' | 'cjs' | 'umd' | 'iife')[];
  /** Optional mapping of external package names to global variables. */
  externalGlobals?: Record<string, string>;
  /**
   * Additional directories to watch for changes during development.
   *
   * Each path is resolved relative to the project root (where `ac-runtime.json` lives)
   * and de-duplicated against the project root itself. Non-existent directories are
   * silently skipped so that optional feature directories do not break startup.
   *
   * **Alias:** `watchDirs` may be used as a shorthand key in `ac-runtime.json` —
   * both `watchDirectories` and `watchDirs` are accepted and produce the same result.
   *
   * Default: `[]`
   */
  watchDirectories: string[];
};

/**
 * Find ac-runtime.json starting from `startDir`, walking up.
 * Validate all required fields. Return config or exit with error.
 */
export function loadConfig(startDir: string): AcRuntimeConfig {
  const configPath = findConfigFile(startDir);
  if (!configPath) {
    throw new ConfigError(`ERROR: ac-runtime.json not found. Searched from: ${startDir}`);
  }

  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err: any) {
    throw new ConfigError(`ERROR: ac-runtime.json contains invalid JSON: ${err.message}`);
  }

  const projectRoot = path.dirname(configPath);

  // --- Required fields ---

  if (!raw.name || typeof raw.name !== 'string') {
    throw new ConfigError('ERROR: ac-runtime.json: "name" is required (non-empty string)');
  }
  if (!raw.version || typeof raw.version !== 'string') {
    throw new ConfigError('ERROR: ac-runtime.json: "version" is required (non-empty string)');
  }
  if (!raw.type || typeof raw.type !== 'string') {
    throw new ConfigError('ERROR: ac-runtime.json: "type" is required');
  }
  if (raw.type !== 'app' && raw.type !== 'library') {
    throw new ConfigError(`ERROR: ac-runtime.json: unsupported type "${raw.type}". Only "app" and "library" are supported.`);
  }
  const buildFile = raw.buildFile;
  if (raw.type === 'library' && !buildFile) {
    throw new ConfigError('ERROR: ac-runtime.json: "buildFile" is required when type is "library"');
  }
  if (!raw.entryFile || typeof raw.entryFile !== 'string') {
    throw new ConfigError('ERROR: ac-runtime.json: "entryFile" is required (relative path to entry file)');
  }

  const entryFile = path.resolve(projectRoot, raw.entryFile);
  if (!fs.existsSync(entryFile)) {
    throw new ConfigError(`ERROR: Entry file does not exist: ${entryFile}`);
  }

  // --- Optional fields with defaults ---

  const buildDirectory = raw.buildDirectory || 'dist';
  const cacheDirectory = raw.cacheDirectory || '.ac-runtime-cache';

  // Validate buildDirectory and cacheDirectory don't overlap
  if (buildDirectory === cacheDirectory) {
    throw new ConfigError(`ERROR: "buildDirectory" and "cacheDirectory" cannot be the same ("${buildDirectory}")`);
  }

  // Validate buildDirectory doesn't overlap source directories
  if (buildDirectory === 'src' || buildDirectory.startsWith('src/') || buildDirectory.startsWith('src\\')) {
    throw new ConfigError(`ERROR: "buildDirectory" cannot overlap source directory ("${buildDirectory}")`);
  }

  // --- Asset validation ---

  const assets: AssetMapping[] = [];

  if (raw.assets && Array.isArray(raw.assets)) {
    const seenUrls = new Set<string>();

    for (let i = 0; i < raw.assets.length; i++) {
      const entry = raw.assets[i];

      if (!entry.directory || typeof entry.directory !== 'string') {
        throw new ConfigError(`ERROR: ac-runtime.json: assets[${i}].directory is required`);
      }
      if (!entry.url || typeof entry.url !== 'string') {
        throw new ConfigError(`ERROR: ac-runtime.json: assets[${i}].url is required`);
      }
      if (!entry.url.startsWith('/')) {
        throw new ConfigError(`ERROR: ac-runtime.json: assets[${i}].url must start with / (got "${entry.url}")`);
      }

      // Check directory exists
      const absDir = path.resolve(projectRoot, entry.directory);
      if (!fs.existsSync(absDir)) {
        throw new ConfigError(`ERROR: ac-runtime.json: assets[${i}].directory does not exist: ${absDir}`);
      }

      // Check for duplicate URLs
      if (seenUrls.has(entry.url)) {
        throw new ConfigError(`ERROR: ac-runtime.json: duplicate asset url "${entry.url}"`);
      }

      // Check for overlapping URLs
      for (const existing of seenUrls) {
        if (entry.url.startsWith(existing + '/') || existing.startsWith(entry.url + '/')) {
          throw new ConfigError(`ERROR: ac-runtime.json: overlapping asset urls "${entry.url}" and "${existing}"`);
        }
      }

      seenUrls.add(entry.url);
      assets.push({ directory: entry.directory, url: entry.url });
    }
  }

  // --- Static resources validation ---
  const staticResources: StaticResourceMapping[] = [];
  if (raw.staticResources && Array.isArray(raw.staticResources)) {
    for (let i = 0; i < raw.staticResources.length; i++) {
      const entry = raw.staticResources[i];
      if (!entry.path || typeof entry.path !== 'string') {
        throw new ConfigError(`ERROR: ac-runtime.json: staticResources[${i}].path is required`);
      }
      if (!entry.buildPath || typeof entry.buildPath !== 'string') {
        throw new ConfigError(`ERROR: ac-runtime.json: staticResources[${i}].buildPath is required`);
      }
      // CFG-3: Validate source path exists at config-load time for early, clear errors
      const absStaticPath = path.resolve(projectRoot, entry.path);
      if (!fs.existsSync(absStaticPath)) {
        throw new ConfigError(`ac-runtime.json: staticResources[${i}].path does not exist: ${absStaticPath}`);
      }
      staticResources.push({ path: entry.path, buildPath: entry.buildPath });
    }
  }

  // --- Build formats validation ---
  let buildFormats: ('es' | 'cjs' | 'umd' | 'iife')[] | undefined = undefined;
  if (raw.buildFormats) {
    if (!Array.isArray(raw.buildFormats)) {
      throw new ConfigError('ERROR: ac-runtime.json: "buildFormats" must be an array of strings');
    }
    const validFormats = ['es', 'cjs', 'umd', 'iife'] as const;
    for (const fmt of raw.buildFormats) {
      if (!validFormats.includes(fmt)) {
        throw new ConfigError(`ERROR: ac-runtime.json: invalid format "${fmt}" in "buildFormats". Valid formats are: ${validFormats.join(', ')}`);
      }
    }
    buildFormats = raw.buildFormats;
  }

  // --- External globals validation ---
  let externalGlobals: Record<string, string> | undefined = undefined;
  if (raw.externalGlobals) {
    if (typeof raw.externalGlobals !== 'object' || Array.isArray(raw.externalGlobals)) {
      throw new ConfigError('ERROR: ac-runtime.json: "externalGlobals" must be a key-value object');
    }
    externalGlobals = {};
    for (const [key, val] of Object.entries(raw.externalGlobals)) {
      if (typeof val !== 'string') {
        throw new ConfigError(`ERROR: ac-runtime.json: externalGlobals["${key}"] must be a string`);
      }
      externalGlobals[key] = val;
    }
  }

  // --- Watch directories validation ---
  const watchDirectories: string[] = [];
  const rawWatchDirs = raw.watchDirectories ?? raw.watchDirs;
  if (rawWatchDirs !== undefined) {
    if (!Array.isArray(rawWatchDirs)) {
      throw new ConfigError('ERROR: ac-runtime.json: "watchDirectories" must be an array of directory paths');
    }
    for (let i = 0; i < rawWatchDirs.length; i++) {
      const entry = rawWatchDirs[i];
      if (!entry || typeof entry !== 'string') {
        throw new ConfigError(`ERROR: ac-runtime.json: watchDirectories[${i}] must be a non-empty string`);
      }
      const absDir = path.resolve(projectRoot, entry);
      if (!fs.existsSync(absDir)) {
        throw new ConfigError(`ERROR: ac-runtime.json: watch directory does not exist: ${absDir} (specified as "${entry}")`);
      }
      const stat = fs.statSync(absDir);
      if (!stat.isDirectory()) {
        throw new ConfigError(`ERROR: ac-runtime.json: watch path is not a directory: ${absDir} (specified as "${entry}")`);
      }
      if (!watchDirectories.includes(absDir) && absDir !== projectRoot) {
        watchDirectories.push(absDir);
      }
    }
  }

  return {
    projectRoot,
    name: raw.name,
    version: raw.version,
    description: raw.description,
    entryFile,
    type: raw.type,
    buildDirectory,
    cacheDirectory,
    assets,
    staticResources,
    buildFile,
    buildFormats,
    externalGlobals,
    watchDirectories,
  };
}

/** Walk up from startDir looking for ac-runtime.json, stopping at filesystem root or after maxDepth levels. */
function findConfigFile(startDir: string, maxDepth = 20): string | null {
  let dir = path.resolve(startDir);
  for (let depth = 0; depth < maxDepth; depth++) {
    const candidate = path.join(dir, 'ac-runtime.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null; // reached filesystem root
    dir = parent;
  }
  return null; // exceeded max depth
}