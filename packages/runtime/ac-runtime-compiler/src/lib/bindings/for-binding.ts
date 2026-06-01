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

  let code  = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'for'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      if(renderer.loopRenderers[binding.bindingId] == undefined){
        renderer.loopRenderers[binding.bindingId] = new AcElementLoopRenderer({
          targetId:binding.targetId,
          html:binding.template,
          startComment:'${binding.targetId}-start',
          endComment:'${binding.targetId}-end',
          parentRenderer:renderer,
          context:{...renderer.context},
          rootElement:renderer.rootElement
        });
        renderer.loopRenderers[binding.bindingId].ownedTargetIds = JSON.stringify(binding.ownedElementIds);
        renderer.loopRenderers[binding.bindingId].init({itemVar:'${itemVar}',indexVar:'${indexVar}',expression:'${binding.expression}',bindingId:'${binding.bindingId}',items:newValue});
      }
      else{
        renderer.loopRenderers[binding.bindingId].refresh({items:newValue});
      }
    }
  }});\n`
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
