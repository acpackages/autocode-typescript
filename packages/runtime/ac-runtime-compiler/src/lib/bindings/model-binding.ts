
import type { Binding } from '../types.js';

export function acGenerateModelBinding({ binding }: {
  binding: Binding
}
): string {
  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'model'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if (el) {
        (el as any).value = newValue;
      }
    }
  }});
  this.registerEventDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'event'},
    callback:async ({renderer}:{renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if(el && !el.hasAttribute('ac-event-${binding.targetId}')){
        el.addEventListener('change', ($event: any) => {
          renderer.evaluateExpression({expression:\`${binding.expression}\`,locals:{el}});
        });
        el.addEventListener('input', ($event: any) => {
          renderer.evaluateExpression({expression:\`${binding.expression}\`,locals:{el}});
        });
        el.setAttribute('ac-event-${binding.targetId}','true');
      }
    }
  }});
  \n`;
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
