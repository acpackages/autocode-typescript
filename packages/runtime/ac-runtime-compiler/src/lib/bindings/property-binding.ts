/**
 * @module property-binding
 *
 * Generates code for property bindings: `[prop]="expression"`.
 *
 * Property bindings set a DOM element's JavaScript property (not HTML attribute)
 * reactively. This is important for custom elements and complex data types.
 *
 * **Attribute vs Property:**
 * - `attribute` = HTML text value: `<div title="hello">` → `el.setAttribute('title', 'hello')`
 * - `property`  = JS object value: `[items]="myArray"` → `el.items = myArray`
 *   Properties can hold objects, arrays, booleans — not just strings.
 *
 * **Nested property access:**
 * Supports dotted paths like `[config.theme]="darkMode"` which compiles to
 * `el['config']['theme'] = this.darkMode`.
 *
 * **Custom element integration:**
 * When targeting a custom element (Web Component), the binding sets the
 * property on the inner `acRuntimeInstance` if available, ensuring the
 * value reaches the component's signal-backed property instead of just
 * the outer HTMLElement wrapper.
 *
 * **Generated code example:**
 * ```js
 * (() => {
 *   const el = this.element.querySelector('[ac-ref="ac-xxx"]');
 *   createEffect(() => {
 *     if (el) {
 *       const __t = el.acRuntimeInstance || el;
 *       __t['items'] = this.myArray;
 *     }
 *   });
 * })();
 * ```
 */
import type { Binding } from '../types.js';

/**
 * Generate code that reactively sets a DOM property on a target element.
 *
 * @param binding        - The binding descriptor containing `target` (property name/path)
 * @param prefExpr       - The expression, already prefixed with `this.`
 * @param targetNodeExpr - The querySelector expression to find the DOM element
 * @returns A string of JavaScript code to be inserted into the render() method
 */
export function generatePropertyBinding(
  binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
): string {
  // ── Handle dotted property paths ──
  // `config.theme` → `['config']['theme']`
  // `value`        → `['value']`
  const target = binding.target!.includes('.')
    ? `['${binding.target!.split('.').join("']['")}']`
    : `['${binding.target}']`;

  return `(() => {
    const el = ${targetNodeExpr};
    createEffect(() => {
      if (el) {
        // Try the inner acRuntimeInstance first (for custom elements),
        // fall back to the raw DOM element
        const __t = (el as any).acRuntimeInstance || el;
        (__t as any)${target} = ${prefExpr};
      }
    });
  })();`;
}

export function acGeneratePropertyBinding({binding,querySelector}:{
  binding: Binding,
  querySelector: string
}
): string {
  const funVarName = "callProperty_"+binding.targetId.replaceAll("-","");
  const target = binding.target.includes('.')
    ? `['${binding.target.split('.').join("']['")}']`
    : `['${binding.target}']`;

  let code = `this.changeListeners['${funVarName}'] = {
    binding:{expression:\`${binding.expression}\`},
    currentValue:undefined,
    callback:async ({oldValue,newValue}:{oldValue:any,newValue:any})=>{
      const binding:any = ${JSON.stringify(binding)};
      const el = ${querySelector};
      const __t = (el as any).acRuntimeInstance || el;
      (__t as any)${target} = newValue;
    }
  };\n`;
  for(const property of binding.properties){
    code += `this.propertyListeners['${property}']['${binding.targetId}'] = '${funVarName}';\n`;
  }
  return code;
}
