import type { Binding } from '../types.js';

export function acGeneratePropertyBinding({ binding }: {
  binding: Binding
}
): string {
  const target = binding.target.includes('.')
    ? `['${binding.target.split('.').join("']['")}']`
    : `['${binding.target}']`;

  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'property'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if(el){
        const __t = (el as any).acRuntimeInstance || el;
        (__t as any)${target} = newValue;
      }
    }
  }});\n`;
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
