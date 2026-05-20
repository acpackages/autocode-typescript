/**
 * @module style-binding
 *
 * Generates code for inline style bindings: `[style.prop]="expression"`
 * or `ac:style:prop="expression"`.
 *
 * Style bindings reactively set a single CSS property on the element's
 * `style` object.
 *
 * **Template syntax examples:**
 * - `[style.color]="textColor"`           → sets color dynamically
 * - `ac:style:backgroundColor="bgColor"`  → sets background-color
 * - `[style.fontSize]="size + 'px'"`      → computed expression
 *
 * **Generated code example:**
 * ```js
 * (() => {
 *   const el = this.element.querySelector('[ac-ref="ac-xxx"]');
 *   createEffect(() => {
 *     if (el) (el as HTMLElement).style['color'] = this.textColor ?? '';
 *   });
 * })();
 * ```
 */
import type { Binding } from '../types.js';

/**
 * Generate code that reactively sets a CSS style property on a target element.
 *
 * @param binding        - The binding descriptor containing `target` (CSS property name)
 * @param prefExpr       - The expression, already prefixed with `this.`
 * @param targetNodeExpr - The querySelector expression to find the DOM element
 * @returns A string of JavaScript code to be inserted into the render() method
 */
export function generateStyleBinding(
  binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
): string {
  // Set the style property directly on the element's style object
  // `?? ''` ensures null/undefined clears the style (resets to default)
  return `(() => {
    const el = ${targetNodeExpr};
    createEffect(() => {
      if (el) (el as HTMLElement).style['${binding.target}'] = ${prefExpr} ?? '';
    });
  })();`;
}


export function acGenerateStyleBinding({ binding, querySelector }: {
  binding: Binding,
  querySelector: string
}
): string {
  let code = `this.changeListeners['${binding.targetId}'] = {
    binding:{expression:\`${binding.expression}\`,type:'style'},
    currentValue:undefined,
    callback:async ({oldValue,newValue}:{oldValue:any,newValue:any})=>{
      const binding:any = ${JSON.stringify(binding)};
      const el = ${querySelector};
      if (el) {
        (el as HTMLElement).style['${binding.target}'] = newValue ?? '';
      }
    }
  };\n`;
  for (const property of binding.properties) {
    code += `this.propertyListeners['${property}']['${binding.targetId}'] = '${binding.targetId}';\n`;
  }
  return code;
}
