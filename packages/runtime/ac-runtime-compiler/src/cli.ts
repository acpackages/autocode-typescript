/**
 * @module cli
 *
 * Command-line interface for the AC Runtime compiler.
 *
 * Compiles a single TypeScript file containing `@AcElement`-decorated
 * components and writes the generated Web Component code to disk.
 *
 * **Usage:**
 * ```bash
 * npx ac-compiler src/components/my-component.ts
 * ```
 *
 * **Output:**
 * For each component found in the file, a `.compiled.js` file is created
 * in the same directory as the source file. The file is named after the
 * component's selector (e.g., `my-component.compiled.js`).
 *
 * If the file contains no `@AcElement` components, an `output.compiled.js`
 * fallback name is used.
 */
import * as fs from 'fs';
import * as path from 'path';
import { ComponentCompiler } from './lib/component-compiler.js';

// ─── Argument Parsing ────────────────────────────────────────────────────────

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: ac-compiler <file-path>');
  process.exit(1);
}

// ─── Compilation ─────────────────────────────────────────────────────────────

const compiler = new ComponentCompiler();
const source = fs.readFileSync(filePath, 'utf-8');
const results = compiler.compile(source);

for (const res of results) {
  // Use selector (or 'output' as fallback) since compile returns { selector, code }
  const baseName = res.selector || 'output';
  const outPath = path.join(path.dirname(filePath), `${baseName}.compiled.js`);
  fs.writeFileSync(outPath, res.code);
  console.log(`Compiled ${baseName} to ${outPath}`);
}
