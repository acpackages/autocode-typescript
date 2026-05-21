/**
 * @module for-binding
 *
 * Generates code for list rendering: `ac:for="item of items"`.
 *
 * Renders a template once for each item in a list. Uses a Map to track
 * which items already have DOM nodes, enabling efficient updates:
 * - New items → create new DOM nodes
 * - Existing items → reuse existing DOM nodes
 * - Removed items → remove their DOM nodes
 *
 * **How it works at runtime:**
 * 1. A comment node `<!--ac-for-xxx-->` marks the insertion point
 * 2. On each reactive update, build a new Map of item→nodes
 * 3. Reuse nodes for items that still exist, create new ones for additions
 * 4. Remove nodes for items no longer in the list
 * 5. Re-order all nodes after the comment placeholder
 */
import type { Binding, GenerateBindingsFn } from '../types.js';

/**
 * Generate list rendering code for ac:for directive.
 *
 * @param binding           - Binding with template, childBindings, itemVar, indexVar
 * @param prefExpr          - The list expression, prefixed with `this.`
 * @param rootContainer     - The parent container expression
 * @param generateBindingsFn - Recursive function for child bindings
 * @param localVars         - Current local variable scope
 */
export function generateForBinding(
  binding: Binding,
  prefExpr: string,
  rootContainer: string,
  generateBindingsFn: GenerateBindingsFn,
  localVars: Set<string>,
): string {
  // Clone local vars and add the loop variables to the nested scope
  const nextLocals = new Set(localVars);
  const itemVar = binding.itemVar!;
  const indexVar = binding.indexVar || '__index';
  nextLocals.add(itemVar);   // e.g., 'item'
  nextLocals.add(indexVar);  // e.g., 'i' or '__index'

  // Generate code for child bindings inside the loop template
  const childBindingsCode = generateBindingsFn(
    binding.childBindings || [],
    nextLocals,
    'container',
  ).join('\n');

  return `(function(this: any) {
      let currentMap = new Map<any, any[]>();
      const placeholder = findComment(${rootContainer}, '${binding.targetId}');
      createEffect(() => {
          const list = (${prefExpr} as any[]) || [];
          const newMap = new Map<any, any[]>();
          list.forEach((${itemVar}, ${indexVar}) => {
              if (currentMap.has(${itemVar})) {
                  newMap.set(${itemVar}, currentMap.get(${itemVar})!);
                  currentMap.delete(${itemVar});
              } else {
                  const container = document.createElement('div');
                  container.innerHTML = ${JSON.stringify(binding.template)};
                  const nodes = Array.from(container.childNodes);
                  ${childBindingsCode}
                  newMap.set(${itemVar}, nodes);
              }
          });
          currentMap.forEach(nodes => nodes.forEach(n => n.remove()));
          currentMap = newMap;
          if (placeholder && placeholder.parentNode) {
              let lastNode: any = placeholder;
              list.forEach(item => {
                  const nodes = newMap.get(item)!;
                  nodes.forEach(n => { lastNode.parentNode?.insertBefore(n, lastNode.nextSibling); lastNode = n; });
              });
          }
      });
  }).call(this);`;
}

export function acGenerateForBinding(
  {
    binding,
    localVars,
    rootContainer,
    recursiveGenerate
  }: {
    binding: Binding,
    rootContainer: string,
    recursiveGenerate: GenerateBindingsFn,
    localVars: Set<string>
  }
): string {
  const itemVar = binding.itemVar;
  const indexVar = binding.indexVar || '__index';

  let code = `this.changeListeners['${binding.targetId}'] = {
    binding:{expression:\`${binding.expression}\`,type:'for'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};

      console.log('[ac-for] Executing for '+binding.targetId);
      renderer.removeElementsBetweenCommentsByName('${binding.targetId}-start','${binding.targetId}-end');
      const list = newValue ?? [];
      const newMap = new Map<any, any[]>();
      list.forEach((${itemVar}, ${indexVar}) => {
        const loopItemId = this.generateHexId();
        const startCommentHtml = \`${binding.targetId}-\${loopItemId}-start\`;
        const endCommentHtml = \`${binding.targetId}-\${loopItemId}-end\`;
        renderer.appendElementsBetweenComments('${binding.targetId}-start','${binding.targetId}-end',renderer.createElementsFromHtml(\`<!--\${startCommentHtml}--><!--\${endCommentHtml}-->\`));
        renderer.createChildRenderer({html:binding.template,startComment:startCommentHtml,endComment:endCommentHtml,context:{${itemVar}, ${indexVar}}});
      });
    }
  };\n`;
  for (const property of binding.properties) {
    code += `this.propertyListeners['${property}']['${binding.targetId}'] = '${binding.targetId}';\n`;
  }
  return code;
}
