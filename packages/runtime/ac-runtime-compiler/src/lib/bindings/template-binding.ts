import type { Binding } from '../types.js';

export function acGenerateTemplateBinding({binding}:{binding: Binding}): string {
  const code = `this.templates['${binding.expression}'] = {
    targetId:'${binding.targetId}',
    bindingId:'${binding.bindingId}',
    html:\`${binding.template}\`,
    rootElement:this
  };\n`;

  return code;
}
