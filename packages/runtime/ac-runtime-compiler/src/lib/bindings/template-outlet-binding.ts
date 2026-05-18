/**
 * @module template-outlet-binding
 *
 * Generates code for template outlet bindings: `ac:template:outlet="expr"`.
 *
 * Template outlets allow injecting one template's content into another
 * component's designated slot. This enables patterns like:
 * - Custom table column templates
 * - Configurable list item renderers
 * - Slot-like content projection
 */
import type { Binding, PrefixFn } from '../types.js';

/**
 * Generate code that injects a template's innerHTML into an outlet element.
 *
 * @param binding        - Binding with expression and optional contextExpression
 * @param rootContainer  - The parent container expression
 * @param prefixFn       - Function to prefix identifiers with `this.`
 * @param localVars      - Current local variable scope
 * @param topLevelVars   - Top-level file-scope identifiers
 */
export function generateTemplateOutletBinding(
  binding: Binding,
  rootContainer: string,
  prefixFn: PrefixFn,
  localVars: Set<string>,
  topLevelVars: Set<string>,
): string {
  const prefixed = prefixFn(binding.expression, localVars, topLevelVars);
  const contextExpr = binding.contextExpression
    ? prefixFn(binding.contextExpression, localVars, topLevelVars)
    : 'null';

  return `createEffect(() => {
    const __outlet = ${rootContainer}.querySelector('[ac-ref="${binding.targetId}"]');
    const __tmpl: any = ${prefixed};
    const __ctx: any = ${contextExpr};
    if (__outlet && __tmpl && __tmpl.innerHTML !== undefined) {
      if ((__outlet as any).__lastTmplSrc !== __tmpl.innerHTML) {
        (__outlet as any).__lastTmplSrc = __tmpl.innerHTML;
        __outlet.innerHTML = __tmpl.innerHTML;
        if (__ctx) (__outlet as any).__acContext = __ctx;
      }
    }
  });`;
}
