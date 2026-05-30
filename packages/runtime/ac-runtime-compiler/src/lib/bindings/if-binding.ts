import { Binding } from "../types";

export function acGenerateIfBinding({
  binding,
}: {
  binding: Binding,
}): string {
  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'if'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      renderer.removeNodesBetweenComments({startComment:'${binding.targetId}-start',endComment:'${binding.targetId}-end'});
      if(newValue){
        const newElements = renderer.createNodesFromHtml(binding.template);
        renderer.appendNodesBetweenComments({startComment:'${binding.targetId}-start',endComment:'${binding.targetId}-end',nodes:newElements});

      }
    }
  }});\n`;
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
