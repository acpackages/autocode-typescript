/**
 * @module constants
 *
 * Shared constant values used by multiple compiler modules.
 *
 * Centralizing constants avoids duplication and makes it easy to update
 * the list of global identifiers or void elements in one place.
 */

// ─── Global Identifiers ─────────────────────────────────────────────────────

/**
 * Identifiers that should NEVER be prefixed with `this.` during
 * template expression rewriting.
 *
 * **Why this exists:**
 * When the compiler sees `count > 5` in a template, it rewrites it to
 * `this.count > 5` so the generated code reads from the component instance.
 * But `Math.round(count)` should become `Math.round(this.count)`, NOT
 * `this.Math.round(this.count)` — because `Math` is a browser global.
 *
 * This Set contains:
 * - JavaScript keywords (`if`, `else`, `for`, `while`, etc.)
 * - Language literals (`true`, `false`, `null`, `undefined`)
 * - Built-in objects (`Math`, `JSON`, `Array`, `Object`, etc.)
 * - Built-in functions (`parseInt`, `parseFloat`, `setTimeout`, etc.)
 * - Special template variable (`$event` — the event object in handlers)
 * - AC Runtime internals (`__acPipe` — the pipe transform helper)
 *
 * Uses a `Set` for O(1) lookup since this check runs once per identifier
 * per binding expression.
 */
export const GLOBAL_IDENTIFIERS = new Set([
  // ── Language Literals ──
  'true', 'false', 'null', 'undefined',

  // ── Context References ──
  'this',           // The component instance itself
  'window',         // Browser window object
  'document',       // DOM document object
  'console',        // Logging utilities

  // ── Built-in Objects ──
  'Math',           // Math.round(), Math.PI, etc.
  'Array',          // Array.from(), Array.isArray(), etc.
  'Object',         // Object.keys(), Object.assign(), etc.
  'String',         // String.fromCharCode(), etc.
  'JSON',           // JSON.parse(), JSON.stringify()
  'Number',         // Number.parseInt(), etc.
  'Boolean',        // Boolean() constructor
  'Date',           // Date.now(), new Date()
  'RegExp',         // Regular expressions
  'Error',          // Error objects
  'Map',            // Map collections
  'Set',            // Set collections
  'Promise',        // Async operations

  // ── Special Values ──
  'NaN',            // Not-a-Number
  'Infinity',       // Infinite number value

  // ── Built-in Functions ──
  'parseInt',       // Parse integer from string
  'parseFloat',     // Parse float from string
  'isNaN',          // Check if value is NaN
  'isFinite',       // Check if value is finite
  'setTimeout',     // Delayed execution
  'setInterval',    // Repeated execution
  'clearTimeout',   // Cancel setTimeout
  'clearInterval',  // Cancel setInterval

  // ── JavaScript Keywords ──
  'let', 'const', 'var',                       // Variable declarations
  'typeof', 'instanceof', 'void', 'delete',    // Operators
  'new', 'return',                              // Object creation & flow
  'if', 'else',                                 // Conditionals
  'for', 'while', 'do',                         // Loops
  'switch', 'case', 'break', 'continue',        // Switch statements
  'throw', 'try', 'catch', 'finally',           // Error handling
  'in', 'of',                                   // Iteration keywords
  'class', 'function', 'async', 'await',        // Declarations
  'yield', 'super',                             // Generator & inheritance
  'import', 'export', 'default', 'from', 'as',  // Module system
  'with', 'debugger',                           // Misc

  // ── Template-specific ──
  '$event',         // The DOM event object in event handlers (e.g., (click)="handler($event)")
  '__acPipe',       // Pipe helper function injected by the compiler into every IIFE
]);

/**
 * HTML void elements — elements that must NOT have a closing tag.
 *
 * When serializing the DOM back to HTML, void elements are rendered as
 * `<br>` or `<img src="...">` without `</br>` or `</img>`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Void_element
 */
export const VOID_ELEMENTS = new Set([
  'area',     // Image map clickable areas
  'base',     // Document base URL
  'br',       // Line break
  'col',      // Table column properties
  'embed',    // External content (plugins)
  'hr',       // Horizontal rule
  'img',      // Images
  'input',    // Form inputs
  'link',     // External resource links (CSS, etc.)
  'meta',     // Document metadata
  'param',    // Object parameters (deprecated)
  'source',   // Media source alternatives
  'track',    // Text tracks for media (subtitles)
  'wbr',      // Word break opportunity
]);
