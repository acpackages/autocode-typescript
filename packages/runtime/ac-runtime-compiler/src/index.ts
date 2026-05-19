/**
 * @module ac-runtime-compiler
 *
 * Public API for the AC Runtime compiler package.
 *
 * **Main classes:**
 * - {@link ComponentCompiler} — Transforms `@AcElement`-decorated TypeScript
 *   classes into self-contained Web Component IIFEs
 * - {@link TemplateCompiler} — Parses AC template HTML syntax and extracts
 *   reactive binding descriptors
 *
 * **Key types:**
 * - {@link Binding} — Describes a single reactive binding (text, property, event, etc.)
 * - {@link TemplateCompileResult} — Output of template compilation (HTML + bindings)
 * - {@link CompileResult} — Output of component compilation (selector + code)
 *
 * **Internal modules (for advanced use):**
 * - `expression-prefixer` — Rewrites template expressions with `this.` prefix
 * - `code-generator` — Assembles the IIFE Web Component code
 * - `bindings/*` — Individual binding code generators
 * - `ast-helpers` — TypeScript AST utility functions
 * - `pipes` — Pipe expression parsing
 * - `constants` — Shared constants (global identifiers, void elements)
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
export { ComponentCompiler } from './lib/component-compiler.js';
export { TemplateCompiler } from './lib/template-compiler.js';
export { acGenerateCustomElement, AcGenerateCustomElementOptions } from './lib/code-generator.js';

// Re-export types from centralized types module
export type {
  Binding,
  TemplateCompileResult,
  CompileResult,
  ComponentMetadata,
  ReactiveProperty,
  ViewChildEntry,
  ComponentInfo,
  PrefixFn,
  GenerateBindingsFn,
} from './lib/types.js';
