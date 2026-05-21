/**
 * @module model-binding
 *
 * Generates code for two-way data bindings: `ac:model="expression"`.
 *
 * Two-way binding = Data→DOM (createEffect) + DOM→Data (addEventListener).
 * Supports deep paths with root re-assignment for signal notification.
 */
import type { Binding } from '../types.js';

/**
 * Generate two-way binding code between a form element and a component property.
 *
 * @param binding        - Binding descriptor (target format: `prop:event`)
 * @param prefExpr       - The expression, already prefixed with `this.`
 * @param targetNodeExpr - querySelector expression for the DOM element
 * @param localVars      - Local variables (for deep path detection)
 */
export function generateModelBinding(
  binding: Binding,
  prefExpr: string,
  targetNodeExpr: string,
  localVars: Set<string>,
): string {
  // Parse "prop:event" (e.g., "value:input", "checked:change")
  const [prop, event] = (binding.target || 'value:input').split(':');

  // Detect root property for deep path re-assignment
  const rootPropMatch = prefExpr.match(/this\.([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  const rootProp = rootPropMatch ? rootPropMatch[1] : null;
  const isLocal = rootProp && localVars.has(rootProp);

  // Deep path trigger: re-assign root to notify signals
  const triggerUpdate = (prefExpr.includes('.') || prefExpr.includes('[')) && rootProp && !isLocal
    ? `; (this as any).${rootProp} = (this as any).${rootProp};`
    : '';

  return `(() => {
            const el = ${targetNodeExpr} as any;
            if (!el) return;
            createEffect(() => { el.${prop} = ${prefExpr}; });
            el.addEventListener('${event}', ($event: any) => { ${prefExpr} = el.${prop}${triggerUpdate} });
          })();`;
}

export function acGenerateModelBinding({ binding, querySelector, localVars }: {
  binding: Binding,
  querySelector: string,
  localVars: Set<string>
}
): string {
  let code = `this.changeListeners['${binding.targetId}'] = {
    binding:{expression:\`${binding.expression}\`,type:'model'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if (el) {
        (el as any).value = newValue;
      }
    }
  };\n`;
  for (const property of binding.properties) {
    code += `this.propertyListeners['${property}']['${binding.targetId}'] = '${binding.targetId}';\n`;
  }
  return code;
}
