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

export function acGenerateAttributeBinding({ binding }: {
  binding: Binding
}
): string {
  const BOOLEAN_HTML_ATTRIBUTES:string[] = [
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
  'typemustmatch',
  'webkitdirectory',
] as const;
  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'attribute'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if(el){
        const __t = (el as any).acRuntimeInstance;
        if (__t) {
          const camelKey = '${binding.target}'.replace(/-([a-z])/g, (_: any, c: string) => c.toUpperCase());
          __t[camelKey] = newValue;
        }
        else{`;
          if(binding.target.toLowerCase() == 'innerhtml'){
            code += `el.innerHTML = newValue;`
          }
          else if(BOOLEAN_HTML_ATTRIBUTES.includes(binding.target.toLowerCase())){
            code += `
            if(newValue){
              el.setAttribute('${binding.target}',newValue);
            }
            else{
              el.removeAttribute('${binding.target}');
            }
            `;
          }
          else{
            code += `
            if(newValue != undefined && newValue!=null){
            el.setAttribute('${binding.target}',newValue);
          }
          else{
            el.removeAttribute('${binding.target}');
          }
            `;
          }


          code+=`
        }
      }
    }
  }});\n`;
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
