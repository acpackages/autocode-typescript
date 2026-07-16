/**
 * config.ts — Load and validate ac-runtime.json
 *
 * One function: loadConfig(). Finds ac-runtime.json,
 * validates required fields, returns a plain object.
 */
import * as fs from 'fs';
import * as path from 'path';

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
};

/**
 * Find ac-runtime.json starting from `startDir`, walking up.
 * Validate all required fields. Return config or exit with error.
 */
export function loadConfig(startDir: string): AcRuntimeConfig {
  const configPath = findConfigFile(startDir);
  if (!configPath) {
    console.error(`ERROR: ac-runtime.json not found. Searched from: ${startDir}`);
    process.exit(1);
  }

  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err: any) {
    console.error(`ERROR: ac-runtime.json contains invalid JSON: ${err.message}`);
    process.exit(1);
  }

  const projectRoot = path.dirname(configPath);

  // --- Required fields ---

  if (!raw.name || typeof raw.name !== 'string') {
    console.error('ERROR: ac-runtime.json: "name" is required (non-empty string)');
    process.exit(1);
  }
  if (!raw.version || typeof raw.version !== 'string') {
    console.error('ERROR: ac-runtime.json: "version" is required (non-empty string)');
    process.exit(1);
  }
  if (!raw.type || typeof raw.type !== 'string') {
    console.error('ERROR: ac-runtime.json: "type" is required');
    process.exit(1);
  }
  if (raw.type !== 'app' && raw.type !== 'library') {
    console.error(`ERROR: ac-runtime.json: unsupported type "${raw.type}". Only "app" and "library" are supported.`);
    process.exit(1);
  }
  const buildFile = raw.buildFile;
  if (raw.type === 'library' && !buildFile) {
    console.error('ERROR: ac-runtime.json: "buildFile" is required when type is "library"');
    process.exit(1);
  }
  if (!raw.entryFile || typeof raw.entryFile !== 'string') {
    console.error('ERROR: ac-runtime.json: "entryFile" is required (relative path to entry file)');
    process.exit(1);
  }

  const entryFile = path.resolve(projectRoot, raw.entryFile);
  if (!fs.existsSync(entryFile)) {
    console.error(`ERROR: Entry file does not exist: ${entryFile}`);
    process.exit(1);
  }

  // --- Optional fields with defaults ---

  const buildDirectory = raw.buildDirectory || 'dist';
  const cacheDirectory = raw.cacheDirectory || '.ac-runtime-cache';

  // Validate buildDirectory and cacheDirectory don't overlap
  if (buildDirectory === cacheDirectory) {
    console.error(`ERROR: "buildDirectory" and "cacheDirectory" cannot be the same ("${buildDirectory}")`);
    process.exit(1);
  }

  // Validate buildDirectory doesn't overlap source directories
  if (buildDirectory === 'src' || buildDirectory.startsWith('src/') || buildDirectory.startsWith('src\\')) {
    console.error(`ERROR: "buildDirectory" cannot overlap source directory ("${buildDirectory}")`);
    process.exit(1);
  }

  // --- Asset validation ---

  const assets: AssetMapping[] = [];

  if (raw.assets && Array.isArray(raw.assets)) {
    const seenUrls = new Set<string>();

    for (let i = 0; i < raw.assets.length; i++) {
      const entry = raw.assets[i];

      if (!entry.directory || typeof entry.directory !== 'string') {
        console.error(`ERROR: ac-runtime.json: assets[${i}].directory is required`);
        process.exit(1);
      }
      if (!entry.url || typeof entry.url !== 'string') {
        console.error(`ERROR: ac-runtime.json: assets[${i}].url is required`);
        process.exit(1);
      }
      if (!entry.url.startsWith('/')) {
        console.error(`ERROR: ac-runtime.json: assets[${i}].url must start with / (got "${entry.url}")`);
        process.exit(1);
      }

      // Check directory exists
      const absDir = path.resolve(projectRoot, entry.directory);
      if (!fs.existsSync(absDir)) {
        console.error(`ERROR: ac-runtime.json: assets[${i}].directory does not exist: ${absDir}`);
        process.exit(1);
      }

      // Check for duplicate URLs
      if (seenUrls.has(entry.url)) {
        console.error(`ERROR: ac-runtime.json: duplicate asset url "${entry.url}"`);
        process.exit(1);
      }

      // Check for overlapping URLs
      for (const existing of seenUrls) {
        if (entry.url.startsWith(existing + '/') || existing.startsWith(entry.url + '/')) {
          console.error(`ERROR: ac-runtime.json: overlapping asset urls "${entry.url}" and "${existing}"`);
          process.exit(1);
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
        console.error(`ERROR: ac-runtime.json: staticResources[${i}].path is required`);
        process.exit(1);
      }
      if (!entry.buildPath || typeof entry.buildPath !== 'string') {
        console.error(`ERROR: ac-runtime.json: staticResources[${i}].buildPath is required`);
        process.exit(1);
      }
      staticResources.push({ path: entry.path, buildPath: entry.buildPath });
    }
  }

  // --- Build formats validation ---
  let buildFormats: ('es' | 'cjs' | 'umd' | 'iife')[] | undefined = undefined;
  if (raw.buildFormats) {
    if (!Array.isArray(raw.buildFormats)) {
      console.error('ERROR: ac-runtime.json: "buildFormats" must be an array of strings');
      process.exit(1);
    }
    const validFormats = ['es', 'cjs', 'umd', 'iife'] as const;
    for (const fmt of raw.buildFormats) {
      if (!validFormats.includes(fmt)) {
        console.error(`ERROR: ac-runtime.json: invalid format "${fmt}" in "buildFormats". Valid formats are: ${validFormats.join(', ')}`);
        process.exit(1);
      }
    }
    buildFormats = raw.buildFormats;
  }

  // --- External globals validation ---
  let externalGlobals: Record<string, string> | undefined = undefined;
  if (raw.externalGlobals) {
    if (typeof raw.externalGlobals !== 'object' || Array.isArray(raw.externalGlobals)) {
      console.error('ERROR: ac-runtime.json: "externalGlobals" must be a key-value object');
      process.exit(1);
    }
    externalGlobals = {};
    for (const [key, val] of Object.entries(raw.externalGlobals)) {
      if (typeof val !== 'string') {
        console.error(`ERROR: ac-runtime.json: externalGlobals["${key}"] must be a string`);
        process.exit(1);
      }
      externalGlobals[key] = val;
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
  };
}

/** Walk up from startDir looking for ac-runtime.json. */
function findConfigFile(startDir: string): string | null {
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, 'ac-runtime.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
