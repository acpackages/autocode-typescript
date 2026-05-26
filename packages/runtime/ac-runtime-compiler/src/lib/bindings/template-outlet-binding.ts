import type { Binding } from '../types.js';


export function acGenerateTemplateOutletBinding(
  {
  binding
}:{
  binding: Binding
}
): string {
  const code = `this.templateOutlets['${binding.targetId}'] = {
    targetId:'${binding.targetId}',
    bindingId:'${binding.bindingId}',
    template:'${binding.expression}'
  };\n`;
  return code;
}
