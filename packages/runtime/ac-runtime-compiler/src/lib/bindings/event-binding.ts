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
      if(el && !el.hasAttribute('ac-event-${binding.bindingId}')){
        // console.log("[AcEventBinding] Registering ${binding.target} event");
        el.addEventListener('${binding.target.toLowerCase()}', (event: any) => {
        // console.log("[AcEventBinding] Received ${binding.target} event",event);
          let args:any = event;
          if(event instanceof AcRuntimeElementEvent){
            args = event.args;
          }
          // console.log("[AcEventBinding] Forwarding ${binding.target} event",args);
          renderer.evaluateExpression({expression:\`${binding.expression}\`,locals:{'$event':args}})
        });
        el.setAttribute('ac-event-${binding.bindingId}','true');
      }
    }
  }});\n`;
  return code;
}
