import type { Binding } from '../types.js';

export function acGenerateEventBinding({ binding }: {
  binding: Binding,
}
): string {
  const code = `this.registerEventDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'event'},
    callback:async ({renderer}:{renderer:AcElementRenderer})=>{
      const binding:any = ${JSON.stringify(binding)};
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if(el && !el.hasAttribute('ac-event-${binding.targetId}')){
        el.addEventListener('${binding.target}', ($event: any) => {
          renderer.evaluateExpression({expression:\`${binding.expression}\`,locals:{'$event':$event}})
        });
        el.setAttribute('ac-event-${binding.targetId}','true');
      }
    }
  }});\n`;
  return code;
}
