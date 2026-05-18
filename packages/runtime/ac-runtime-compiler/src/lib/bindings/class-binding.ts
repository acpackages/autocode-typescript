/**
 * @module class-binding
 *
 * Generates code for CSS class toggle bindings: `[class.name]="expression"`
 * or `ac:class:name="expression"`.
 *
 * Class bindings conditionally add or remove a CSS class based on whether
 * the expression evaluates to a truthy or falsy value.
 *
 * **Template syntax examples:**
 * - `[class.active]="isActive"`     → adds/removes 'active' class
 * - `ac:class:hidden="!isVisible"`  → adds/removes 'hidden' class
 * - `[class.btn-primary]="isPrimary"` → handles hyphenated class names
 *
 * **Generated code example:**
 * ```js
 * (() => {
 *   const el = this.element.querySelector('[ac-ref="ac-xxx"]');
 *   createEffect(() => {
 *     if (el) {
 *       if (this.isActive) {
 *         el.classList.add('active');
 *       } else {
 *         el.classList.remove('active');
 *       }
 *     }
 *   });
 * })();
 * ```
 */
import type { Binding } from '../types.js';

/**
 * Generate code that reactively toggles a CSS class on a target element.
 *
 * @param binding        - The binding descriptor containing `target` (CSS class name)
 * @param prefExpr       - The boolean expression, already prefixed with `this.`
 * @param targetNodeExpr - The querySelector expression to find the DOM element
 * @returns A string of JavaScript code to be inserted into the render() method
 */
export function generateClassBinding(
  binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
): string {
  return `(() => {
    const el = ${targetNodeExpr};
    createEffect(() => {
      if (el) {
        if (${prefExpr}) {
          el.classList.add('${binding.target}');
        } else {
          el.classList.remove('${binding.target}');
        }
      }
    });
  })();`;
}
