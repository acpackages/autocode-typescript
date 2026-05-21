/**
 * @module if-binding
 *
 * Generates code for conditional rendering: `ac:if="expression"`.
 *
 * When the expression is truthy, the template content is inserted into
 * the DOM. When falsy, it is removed. Uses a comment placeholder to
 * mark where the content should be inserted.
 *
 * **How it works at runtime:**
 * 1. A comment node `<!--ac-if-xxx-->` marks the insertion point
 * 2. When condition becomes truthy: create DOM nodes from template,
 *    insert them after the comment, then wire up child bindings
 * 3. When condition becomes falsy: remove all inserted nodes
 */
import { Properties } from 'grapesjs';
import type { Binding, GenerateBindingsFn } from '../types.js';

/**
 * Generate conditional rendering code for ac:if directive.
 *
 * @param binding           - Binding with template and childBindings
 * @param prefExpr          - The condition expression, prefixed with `this.`
 * @param rootContainer     - The parent container expression
 * @param generateBindingsFn - Recursive function for child bindings
 * @param localVars         - Current local variable scope
 */
export function generateIfBinding(
  binding: Binding,
  prefExpr: string,
  rootContainer: string,
  generateBindingsFn: GenerateBindingsFn,
  localVars: Set<string>,
): string {
  // Clone local vars for the nested scope (ac:if doesn't add new vars)
  const nextLocals = new Set(localVars);

  // Generate code for the child bindings inside the ac:if block
  const childBindingsCode = generateBindingsFn(
    binding.childBindings || [],
    nextLocals,
    '__parentNode',
  ).join('\n');

  return `(function(this: any) {
      let currentNodes: any[] = [];
      const placeholder = findComment(${rootContainer}, '${binding.targetId}');
      createEffect(() => {
          const condition = ${prefExpr};
          if (condition) {
              if (currentNodes.length === 0) {
                  const container = document.createElement('div');
                  container.innerHTML = ${JSON.stringify(binding.template)};
                  currentNodes = Array.from(container.childNodes);
                  if (placeholder && placeholder.parentNode) {
                    let lastInserted: any = placeholder;
                    currentNodes.forEach((node: any) => { lastInserted.parentNode?.insertBefore(node, lastInserted.nextSibling); lastInserted = node; });
                  }
                  const __parentNode = placeholder?.parentNode || ${rootContainer};
                  ${childBindingsCode}
              }
          } else {
              currentNodes.forEach((node: any) => node.remove());
              currentNodes = [];
          }
      });
  }).call(this);`;
}

export function acGenerateIfBinding({
  binding,
  localVars,
  rootContainer,
  recursiveGenerate
}: {
  binding: Binding,
  rootContainer: string,
  recursiveGenerate: GenerateBindingsFn,
  localVars: Set<string>
}): string {
  let code = `this.changeListeners['${binding.targetId}'] = {
    binding:{expression:\`${binding.expression}\`,type:'if'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      renderer.removeElementsBetweenCommentsByName('${binding.targetId}-start','${binding.targetId}-end');
      if(newValue){
        const newElements = renderer.createElementsFromHtml(binding.template);
        renderer.appendElementsBetweenComments('${binding.targetId}-start','${binding.targetId}-end',newElements);
        const childRefs = renderer.getRefTargetIdsFromNodes(newElements);
        renderer.executeChangeListener({keys:childRefs.all, force:true});
      }
    }
  };\n`;
  for (const property of binding.properties) {
    code += `this.propertyListeners['${property}']['${binding.targetId}'] = '${binding.targetId}';\n`;
  }
  return code;
}
