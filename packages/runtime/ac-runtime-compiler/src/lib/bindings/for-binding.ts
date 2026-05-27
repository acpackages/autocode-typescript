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

  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'for'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      renderer.removeNodesBetweenCommentsByName('${binding.targetId}-start','${binding.targetId}-end');
      const list = newValue ?? [];
      list.forEach((${itemVar}, ${indexVar}) => {
        const loopItemId = this.generateHexId();
        const startCommentHtml = \`${binding.targetId}-\${loopItemId}-start\`;
        const endCommentHtml = \`${binding.targetId}-\${loopItemId}-end\`;
        renderer.appendNodesBetweenComments({startComment:'${binding.targetId}-start',endComment:'${binding.targetId}-end',nodes:renderer.createNodesFromHtml(\`<!--\${startCommentHtml}--><!--\${endCommentHtml}-->\`),processNodes:false});
        renderer.createChildRenderer({targetId:'${binding.targetId}'+loopItemId,html:binding.template,startComment:startCommentHtml,endComment:endCommentHtml,context:{${itemVar}, ${indexVar}}});
      });
    }
  }});\n`;
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
