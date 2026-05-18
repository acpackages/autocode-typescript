/**
 * @module text-binding
 *
 * Generates code for text interpolation bindings: `{{expression}}`.
 *
 * When the template contains `<span>Hello {{name}}!</span>`, the template
 * compiler creates a `<span ac-ref="ac-xxx"></span>` placeholder and a
 * text binding. This module generates the runtime code that:
 *
 * 1. Finds the placeholder span via `querySelector('[ac-ref="ac-xxx"]')`
 * 2. Creates a reactive effect that updates `el.textContent` whenever
 *    the expression value changes
 *
 * **Generated code example:**
 * ```js
 * (() => {
 *   const el = this.element.querySelector('[ac-ref="ac-xxx"]');
 *   createEffect(() => {
 *     if (el) el.textContent = String(this.name ?? '');
 *   });
 * })();
 * ```
 */
import type { Binding } from '../types.js';

/**
 * Generate code that reactively updates a text node's content.
 *
 * @param _binding       - The binding descriptor (unused here, but kept for consistency)
 * @param prefExpr       - The expression, already prefixed with `this.`
 *                          (e.g., `` `Hello ${this.name}!` ``)
 * @param targetNodeExpr - The querySelector expression to find the DOM element
 *                          (e.g., `this.element.querySelector('[ac-ref="ac-xxx"]')`)
 * @returns A string of JavaScript code to be inserted into the render() method
 */
export function generateTextBinding(
  _binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
): string {
  // Wrap in an IIFE to scope the `el` variable and avoid name collisions
  // when multiple text bindings exist in the same render() method
  return `(() => {
    const el = ${targetNodeExpr};
    createEffect(() => {
      if (el) el.textContent = String(${prefExpr} ?? '');
    });
  })();`;
  // ↑ String() converts any value to a string for display
  // ↑ `?? ''` falls back to empty string if the expression is null/undefined
}
