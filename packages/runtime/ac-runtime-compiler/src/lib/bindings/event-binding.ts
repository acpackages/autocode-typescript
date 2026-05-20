/**
 * @module event-binding
 *
 * Generates code for event bindings: `(event)="expression"`.
 *
 * Event bindings attach DOM event listeners that execute a template
 * expression when the event fires. The special `$event` variable is
 * available in the expression to access the raw DOM event object.
 *
 * **Template syntax examples:**
 * - `(click)="handleClick()"` → calls the component's handleClick method
 * - `(click)="count = count + 1"` → inline expression
 * - `(input)="onInput($event)"` → passes the DOM event object
 * - `(keydown.enter)="submit()"` → (handled by the template compiler)
 *
 * **Generated code example:**
 * ```js
 * this.element.querySelector('[ac-ref="ac-xxx"]')
 *   ?.addEventListener('click', ($event: any) => {
 *     this.handleClick();
 *   });
 * ```
 *
 * **Why events are NOT wrapped in createEffect:**
 * Unlike property/text/class bindings, event listeners are set up once
 * and never change. The expression inside runs imperatively when the
 * event fires, not reactively when data changes.
 */
import type { Binding } from '../types.js';

/**
 * Generate code that attaches a DOM event listener to a target element.
 *
 * @param binding        - The binding descriptor containing `target` (event name)
 * @param prefExpr       - The expression, already prefixed with `this.`
 *                          (e.g., `"this.handleClick()"`)
 * @param targetNodeExpr - The querySelector expression to find the DOM element
 * @returns A string of JavaScript code to be inserted into the render() method
 */
export function generateEventBinding(
  binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
): string {
  // Use optional chaining `?.` in case the element isn't found
  // `$event` parameter gives the handler access to the raw DOM event
  return `${targetNodeExpr}?.addEventListener('${binding.target}', ($event: any) => { ${prefExpr} });`;
}


export function acGenerateEventBinding({ binding, querySelector }: {
  binding: Binding,
  querySelector: string
}
): string {
  let code = `this.changeListeners['${binding.targetId}'] = {
    binding:{expression:\`${binding.expression}\`,type:'event'},
    currentValue:undefined,
    callback: async ({oldValue,newValue}:{oldValue:any,newValue:any})=>{
      const binding:any = ${JSON.stringify(binding)};
      ${querySelector}?.addEventListener('${binding.target}', ($event: any) => { newValue });
    }
  };\n`;
  for (const property of binding.properties) {
    code += `this.propertyListeners['${property}']['${binding.targetId}'] = '${binding.targetId}';\n`;
  }
  return code;
}
