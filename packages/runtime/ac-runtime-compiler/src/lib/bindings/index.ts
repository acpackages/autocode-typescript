/**
 * @module bindings/index
 *
 * Binding code generation orchestrator.
 *
 * This module dispatches each binding to its specialized generator
 * based on the binding type. It also handles the recursive nature of
 * structural directives (ac:if, ac:for) which contain nested bindings.
 *
 * **Flow:**
 * 1. Receive an array of Binding descriptors from the template compiler
 * 2. For each binding, prefix the expression with `this.`
 * 3. Dispatch to the appropriate generator (text, property, event, etc.)
 * 4. Return an array of generated code strings
 */
import type { Binding, PrefixFn } from '../types.js';
import { acGenerateTextBinding } from './text-binding.js';
import { acGeneratePropertyBinding } from './property-binding.js';
import { acGenerateEventBinding } from './event-binding.js';
import { acGenerateClassBinding } from './class-binding.js';
import { acGenerateStyleBinding } from './style-binding.js';
import { acGenerateModelBinding } from './model-binding.js';
import { acGenerateAttributeBinding } from './attribute-binding.js';
import { acGenerateIfBinding } from './if-binding.js';
import { acGenerateForBinding } from './for-binding.js';
import { generateTemplateOutletBinding } from './template-outlet-binding.js';


export function acGenerateBindingCallbacks({bindings}:{bindings: Binding[]}
): string[] {
  let bindingsCode:string[] = [];
  for(const binding of bindings){
    switch (binding.type) {
      case 'text':
        bindingsCode.push(acGenerateTextBinding({binding}));
        break;
      case 'property':
        bindingsCode.push(acGeneratePropertyBinding({binding}));
        break;
      case 'event':
        bindingsCode.push(acGenerateEventBinding({binding}));
        break;
      case 'class':
        bindingsCode.push(acGenerateClassBinding({binding}));
        break;
      case 'style':
        bindingsCode.push(acGenerateStyleBinding({binding}));
        break;
      case 'model':
        bindingsCode.push(acGenerateModelBinding({binding}));
        break;
      case 'attribute':
        bindingsCode.push(acGenerateAttributeBinding({binding}));
        break;
      case 'if':
        bindingsCode.push(acGenerateIfBinding({binding}));
        break;
      case 'for':
        bindingsCode.push(acGenerateForBinding({binding}));
        break;

      // case 'template-outlet':
        // return acGenerateTemplateOutletBinding({binding,localVars,rootContainer,recursiveGenerate,topLevelVars});
    }
    if(binding.childBindings && binding.childBindings.length > 0){
      bindingsCode = [...bindingsCode,...acGenerateBindingCallbacks({bindings:binding.childBindings})];
    }
  }
  return bindingsCode;
}
