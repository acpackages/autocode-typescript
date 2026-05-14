import * as fs from 'fs';
import * as path from 'path';
import { ComponentCompiler } from './lib/component-compiler.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: ac-compiler <file-path>');
  process.exit(1);
}

const compiler = new ComponentCompiler();
const source = fs.readFileSync(filePath, 'utf-8');
const results = compiler.compile(source);

results.forEach(res => {
  const outPath = path.join(path.dirname(filePath), `${res.className.toLowerCase()}.compiled.js`);
  fs.writeFileSync(outPath, res.code);
  console.log(`Compiled ${res.className} to ${outPath}`);
});
