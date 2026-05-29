import type { Binding } from '../types.js';

export function acGenerateForBinding(
  {
    binding,
  }: {
    binding: Binding,
  }
): string {
  const itemVar = binding.itemVar;
  const indexVar = binding.indexVar || '__index';
  const arrayProperty = binding.properties[0] || '';

  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'for'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      const arrayProp = '${arrayProperty}';

      // 1. Unregister loop change listener to avoid duplicate registrations
      this.unregisterLoopChangeListener({ targetId: binding.targetId, bindingId: binding.bindingId, property: arrayProp });

      // 2. Register the loop change listener
      this.registerLoopChangeListener({
        targetId: binding.targetId,
        bindingId: binding.bindingId,
        property: arrayProp,
        callback: async (change) => {
          console.log(\`[ForBindingCallback <\${binding.targetId}>] Loop callback change:\`, change);
          
          if (change.type === 'array-insert') {
            const { index, items } = change.newValue;
            console.log(\`[ForBindingCallback] Inserting \${items.length} items at index \${index}\`);

            // Shift existing child renderers down
            const allChildKeys = Object.keys(renderer.getChildRenderers()).sort((a, b) => {
              const idxA = parseInt(a.substring(binding.targetId.length + 1), 10);
              const idxB = parseInt(b.substring(binding.targetId.length + 1), 10);
              return idxB - idxA; // Shift starting from the end
            });

            for (const childKey of allChildKeys) {
              const childIndex = parseInt(childKey.substring(binding.targetId.length + 1), 10);
              if (childIndex >= index) {
                const newIndex = childIndex + items.length;
                const childRenderer = renderer.getChildRenderer(childKey);
                if (childRenderer) {
                  renderer.updateChildRendererContext(childKey, { ['${indexVar}']: newIndex });
                  const childRenderers = renderer.getChildRenderers();
                  delete childRenderers[childKey];
                  childRenderers[\`\${binding.targetId}-\${newIndex}\`] = childRenderer;
                }
              }
            }

            // Append new items
            items.forEach((item: any, i: number) => {
              const targetIndex = index + i;
              const startCommentHtml = \`\${binding.targetId}-\${targetIndex}-start\`;
              const endCommentHtml = \`\${binding.targetId}-\${targetIndex}-end\`;
              const prevEndComment = targetIndex > 0 ? \`\${binding.targetId}-\${targetIndex - 1}-end\` : \`\${binding.targetId}-start\`;
              
              renderer.appendNodesBetweenComments({
                startComment: prevEndComment,
                endComment: \`\${binding.targetId}-end\`,
                nodes: renderer.createNodesFromHtml(\`<!--\${startCommentHtml}--><!--\${endCommentHtml}-->\`),
                processNodes: false
              });

              renderer.createChildRenderer({
                targetId: \`\${binding.targetId}-\${targetIndex}\`,
                html: binding.template,
                startComment: startCommentHtml,
                endComment: endCommentHtml,
                context: { ...renderer.context, ['${itemVar}']: item, ['${indexVar}']: targetIndex }
              });
            });
          }
          else if (change.type === 'array-delete') {
            const { index, items } = change.oldValue;
            console.log(\`[ForBindingCallback] Deleting \${items.length} items from index \${index}\`);

            items.forEach((_: any, i: number) => {
              const targetIndex = index + i;
              renderer.removeChildRenderer(
                \`\${binding.targetId}-\${targetIndex}\`,
                \`\${binding.targetId}-\${targetIndex}-start\`,
                \`\${binding.targetId}-\${targetIndex}-end\`
              );
            });

            // Shift subsequent renderers up
            const allChildKeys = Object.keys(renderer.getChildRenderers()).sort((a, b) => {
              const idxA = parseInt(a.substring(binding.targetId.length + 1), 10);
              const idxB = parseInt(b.substring(binding.targetId.length + 1), 10);
              return idxA - idxB; // Shift starting from the beginning
            });

            for (const childKey of allChildKeys) {
              const childIndex = parseInt(childKey.substring(binding.targetId.length + 1), 10);
              if (childIndex >= index + items.length) {
                const newIndex = childIndex - items.length;
                const childRenderer = renderer.getChildRenderer(childKey);
                if (childRenderer) {
                  renderer.updateChildRendererContext(childKey, { ['${indexVar}']: newIndex });
                  const childRenderers = renderer.getChildRenderers();
                  delete childRenderers[childKey];
                  childRenderers[\`\${binding.targetId}-\${newIndex}\`] = childRenderer;
                }
              }
            }
          }
          else if (change.type === 'array-update') {
            const { index, items } = change.newValue;
            console.log(\`[ForBindingCallback] Updating items from index \${index}\`);

            items.forEach((item: any, i: number) => {
              const targetIndex = index + i;
              renderer.updateChildRendererContext(\`\${binding.targetId}-\${targetIndex}\`, { ['${itemVar}']: item });
            });
          }
          else if (change.type === 'set' && change.path.startsWith(arrayProp + '.')) {
            const rest = change.path.substring(arrayProp.length + 1);
            const indexStr = rest.split('.')[0];
            const index = parseInt(indexStr, 10);
            if (!isNaN(index)) {
              console.log(\`[ForBindingCallback] Granular update of property in row index \${index}\`);
              const list = (await renderer.evaluateExpression({ expression: binding.expression })) || [];
              const item = list[index];
              renderer.updateChildRendererContext(\`\${binding.targetId}-\${index}\`, { ['${itemVar}']: item });
            }
          }
          else {
            console.log(\`[ForBindingCallback] Fallback to full re-render\`);
            renderAll(await renderer.evaluateExpression({ expression: binding.expression }));
          }
        }
      });

      const renderAll = (list: any) => {
        renderer.removeNodesBetweenCommentsByName('${binding.targetId}-start','${binding.targetId}-end');
        const items = list ?? [];
        items.forEach((${itemVar}, ${indexVar}) => {
          const startCommentHtml = \`${binding.targetId}-\${${indexVar}}-start\`;
          const endCommentHtml = \`${binding.targetId}-\${${indexVar}}-end\`;
          renderer.appendNodesBetweenComments({startComment:'${binding.targetId}-start',endComment:'${binding.targetId}-end',nodes:renderer.createNodesFromHtml(\`<!--\${startCommentHtml}--><!--\${endCommentHtml}-->\`),processNodes:false});
          renderer.createChildRenderer({targetId:\`${binding.targetId}-\${${indexVar}}\`,html:binding.template,startComment:startCommentHtml,endComment:endCommentHtml,context:{...renderer.context, ${itemVar}, ${indexVar}}});
        });
      };

      renderAll(newValue);
    }
  }});\n`;

  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
