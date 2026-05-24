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
import type { Binding, GenerateBindingsFn, PrefixFn } from '../types.js';

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


export function acGenerateTemplateOutletBinding(
  {
  binding
}:{
  binding: Binding
}
): string {
  const code = "";
  // const nextLocals = new Set(localVars);
  // const itemVar = binding.itemVar!;
  // const indexVar = binding.indexVar || '__index';
  // nextLocals.add(itemVar);   // e.g., 'item'
  // nextLocals.add(indexVar);  // e.g., 'i' or '__index'
  // const childBindingsCode = recursiveGenerate(
  //   binding.childBindings || [],
  //   nextLocals,
  //   'container',
  // ).join('\n');

  // let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
  //   binding:{expression:\`${binding.expression}\`,type:'template'},
  //   callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
  //     const binding:any = ${JSON.stringify(binding)};
  //     this.removeNodesBetweenCommentsByName('${binding.targetId}-start','${binding.targetId}-end');
  //     const placeholder = this.findComment(${rootContainer}, '${binding.targetId}-end');
  //     const list = newValue ?? [];
  //         const newMap = new Map<any, any[]>();
  //         list.forEach((${itemVar}, ${indexVar}) => {
  //             if (currentMap.has(${itemVar})) {
  //                 newMap.set(${itemVar}, currentMap.get(${itemVar})!);
  //                 currentMap.delete(${itemVar});
  //             } else {
  //                 const container = document.createElement('div');
  //                 container.innerHTML = ${JSON.stringify(binding.template)};
  //                 const nodes = Array.from(container.childNodes);
  //                 ${childBindingsCode}
  //                 newMap.set(${itemVar}, nodes);
  //             }
  //         });
  //     if (placeholder && placeholder.parentNode) {
  //             let lastNode: any = placeholder;
  //             list.forEach(item => {
  //                 const nodes = newMap.get(item)!;
  //                 nodes.forEach(n => { lastNode.parentNode?.insertBefore(n, lastNode.nextSibling); lastNode = n; });
  //             });
  //         }
  //     }
  //   }
  // }});\n`;
  // for(const property of binding.properties){
  //   code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  // }
  return code;
}
