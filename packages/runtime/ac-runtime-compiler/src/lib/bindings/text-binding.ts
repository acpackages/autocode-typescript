import type { Binding } from '../types.js';

export function acGenerateTextBinding({ binding }: {
  binding: Binding
}): string {
  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'text'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if(el){
        if (el) el.textContent = String(newValue ?? '');
      }
    }
  }});\n`;

  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
