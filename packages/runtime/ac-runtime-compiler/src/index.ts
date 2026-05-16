/**
 * @module ac-runtime-compiler
 *
 * Public API for the AC Runtime compiler package.
 *
 * Exports:
 * - {@link ComponentCompiler} — Main compiler class that transforms
 *   `@AcElement`-decorated TypeScript classes into Web Component IIFEs.
 * - {@link TemplateCompiler} — HTML template parser that extracts
 *   reactive bindings from AC template syntax.
 * - {@link Binding} — Describes a single reactive binding.
 * - {@link TemplateCompileResult} — Output of template compilation.
 *
 * @example
 * ```ts
 * import { ComponentCompiler } from '@autocode-ts/ac-runtime-compiler';
 *
 * const compiler = new ComponentCompiler();
 * const results = compiler.compile(sourceCode, filePath);
 * console.log(results[0].code); // Generated Web Component TypeScript
 * ```
 */
export * from './lib/component-compiler.js';
export * from './lib/template-compiler.js';
