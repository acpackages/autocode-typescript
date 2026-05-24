import { Binding } from "../types";

export function acGenerateStyleBinding({ binding }: {
  binding: Binding
}
): string {
  let code = `this.registerChangeListenerDefinition({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',definition:{
    binding:{expression:\`${binding.expression}\`,type:'style'},
    callback:async ({oldValue,newValue,renderer}:{oldValue:any,newValue:any,renderer:AcElementRenderer})=>{
      const el:any = renderer.queryElement('[ac-ref="${binding.targetId}"]');
      if (el) {
        (el as HTMLElement).style['${binding.target}'] = newValue ?? '';
      }
    }
  }});\n`;
  for (const property of binding.properties) {
    code += `this.registerPropertyListenerKey({targetId:'${binding.targetId}',bindingId:'${binding.bindingId}',property:'${property}'});\n`;
  }
  return code;
}
