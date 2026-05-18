/**
 * @module attribute-binding
 *
 * Generates code for HTML attribute bindings: `ac:bind:attr="expression"`.
 *
 * Unlike property bindings (`[prop]`) which set JavaScript properties,
 * attribute bindings set/remove actual HTML attributes. This matters for:
 * - Accessibility attributes (`aria-label`, `role`)
 * - Data attributes (`data-id`, `data-status`)
 * - Standard HTML attributes (`title`, `disabled`, `href`)
 *
 * **Key behavior:**
 * - Truthy values → `setAttribute(name, String(value))`
 * - `null`, `undefined`, or `false` → `removeAttribute(name)` (removes it entirely)
 * - Also forwards the value to `acRuntimeInstance` for custom elements
 *
 * **Template syntax examples:**
 * - `ac:bind:title="tooltip"`          → sets title attribute
 * - `ac:bind:disabled="isDisabled"`    → adds/removes disabled attribute
 * - `ac:bind:aria-label="labelText"`   → sets ARIA label
 *
 * **Generated code example:**
 * ```js
 * (() => {
 *   const el = this.element.querySelector('[ac-ref="ac-xxx"]');
 *   createEffect(() => {
 *     if (el) {
 *       const v = this.tooltip;
 *       if (v != null && v !== false) {
 *         el.setAttribute('title', String(v));
 *         // Forward to custom element instance if applicable
 *       } else {
 *         el.removeAttribute('title');
 *       }
 *     }
 *   });
 * })();
 * ```
 */
import type { Binding } from '../types.js';

/**
 * Generate code that reactively sets or removes an HTML attribute on a target element.
 *
 * @param binding        - The binding descriptor containing `target` (attribute name)
 * @param prefExpr       - The expression, already prefixed with `this.`
 * @param targetNodeExpr - The querySelector expression to find the DOM element
 * @returns A string of JavaScript code to be inserted into the render() method
 */
export function generateAttributeBinding(
  binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
): string {
  return `(() => {
    const el = ${targetNodeExpr};
    createEffect(() => {
      if (el) {
        const v = ${prefExpr};
        if (v != null && v !== false) {
          // Set the HTML attribute to the string representation of the value
          el.setAttribute('${binding.target}', String(v));
          // If this is a custom element, also set the property on its internal instance
          // Convert kebab-case attribute names to camelCase property names
          // e.g., 'data-value' → 'dataValue'
          const __t = (el as any).acRuntimeInstance;
          if (__t) {
            const camelKey = '${binding.target}'.replace(/-([a-z])/g, (_: any, c: string) => c.toUpperCase());
            __t[camelKey] = v;
          }
        } else {
          // Falsy value → remove the attribute entirely
          // This is useful for boolean attributes like 'disabled'
          el.removeAttribute('${binding.target}');
        }
      }
    });
  })();`;
}
