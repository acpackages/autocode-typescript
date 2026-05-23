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
import { acGenerateTextBinding, generateTextBinding } from './text-binding.js';
import { acGeneratePropertyBinding, generatePropertyBinding } from './property-binding.js';
import { acGenerateEventBinding, generateEventBinding } from './event-binding.js';
import { acGenerateClassBinding, generateClassBinding } from './class-binding.js';
import { acGenerateStyleBinding, generateStyleBinding } from './style-binding.js';
import { acGenerateModelBinding, generateModelBinding } from './model-binding.js';
import { acGenerateAttributeBinding, generateAttributeBinding } from './attribute-binding.js';
import { acGenerateIfBinding, generateIfBinding } from './if-binding.js';
import { acGenerateForBinding, generateForBinding } from './for-binding.js';
import { generateTemplateOutletBinding } from './template-outlet-binding.js';

/**
 * Binding types that use querySelector to find their target DOM element.
 * These bindings operate on a specific element identified by `ac-ref`.
 *
 * Structural directives (if, for) and template-outlet use comment nodes
 * or different lookup strategies, so they're NOT in this list.
 */
const QUERYABLE_TYPES = new Set([
  'text', 'property', 'event', 'class', 'model', 'style', 'attribute',
]);

/**
 * Generate code strings for an array of template bindings.
 *
 * This is the main entry point called by the code generator. It processes
 * each binding and returns an array of JavaScript code strings that will
 * be inserted into the component's `render()` method.
 *
 * @param bindings       - Array of binding descriptors from the template compiler
 * @param localVars      - Variables in local scope (e.g., loop vars from ac:for)
 * @param rootContainer  - Expression for the root DOM container
 *                          (e.g., `'this.element'` for top-level, `'container'` for nested)
 * @param prefixFn       - Function to rewrite identifiers with `this.` prefix
 * @param topLevelVars   - Top-level file-scope identifiers (imports, consts)
 * @returns Array of JavaScript code strings, one per binding
 */
export function generateBindings(
  bindings: Binding[],
  localVars: Set<string>,
  rootContainer: string,
  prefixFn: PrefixFn,
  topLevelVars: Set<string>,
): string[] {
  return bindings.map(b => {
    // ── Step 1: Prefix the expression ──
    // Convert bare identifiers to `this.` prefixed form
    // e.g., "count > 5" → "this.count > 5"
    const prefExpr = prefixFn(b.expression, localVars, topLevelVars);

    // ── Step 2: Build the querySelector expression (for queryable types) ──
    // e.g., `this.element.querySelector('[ac-ref="ac-3f8a1b2c"]')`
    const targetNodeExpr = QUERYABLE_TYPES.has(b.type)
      ? `${rootContainer}.querySelector('[ac-ref="${b.targetId}"]')`
      : null;

    // ── Step 3: Create a recursive binding generator for structural directives ──
    // ac:if and ac:for need to generate code for their nested child bindings,
    // so they receive this function as a callback
    const recursiveGenerate = (childBindings: Binding[], childLocals: Set<string>, childContainer: string) =>
      generateBindings(childBindings, childLocals, childContainer, prefixFn, topLevelVars);

    // ── Step 4: Dispatch to the appropriate binding generator ──
    switch (b.type) {
      case 'text':
        return generateTextBinding(b, prefExpr, targetNodeExpr!);

      case 'property':
        return generatePropertyBinding(b, prefExpr, targetNodeExpr!);

      case 'event':
        return generateEventBinding(b, prefExpr, targetNodeExpr!);

      case 'class':
        return generateClassBinding(b, prefExpr, targetNodeExpr!);

      case 'style':
        return generateStyleBinding(b, prefExpr, targetNodeExpr!);

      case 'model':
        return generateModelBinding(b, prefExpr, targetNodeExpr!, localVars);

      case 'attribute':
        return generateAttributeBinding(b, prefExpr, targetNodeExpr!);

      case 'if':
        return generateIfBinding(b, prefExpr, rootContainer, recursiveGenerate, localVars);

      case 'for':
        return generateForBinding(b, prefExpr, rootContainer, recursiveGenerate, localVars);

      case 'template-outlet':
        return generateTemplateOutletBinding(b, rootContainer, prefixFn, localVars, topLevelVars);

      default:
        return '';
    }
  });
}

export function acGenerateBindingCallbacks({bindings,localVars,rootContainer,topLevelVars}:{
  bindings: Binding[],
  localVars?: Set<string>,
  rootContainer?: string,
  topLevelVars?: Set<string>}
): string[] {
  let bindingsCode:string[] = [];
  for(const binding of bindings){
    if(!rootContainer){
      rootContainer = 'this';
    }
    const querySelector = QUERYABLE_TYPES.has(binding.type)? `${rootContainer}.querySelector('[ac-ref="${binding.targetId}"]')`: null;

    // ── Step 3: Create a recursive binding generator for structural directives ──
    // ac:if and ac:for need to generate code for their nested child bindings,
    // so they receive this function as a callback
    const recursiveGenerate = (childBindings: Binding[], childLocals: Set<string>, childContainer: string) => acGenerateBindingCallbacks({bindings:childBindings,localVars:childLocals, rootContainer:childContainer, topLevelVars});

    // ── Step 4: Dispatch to the appropriate binding generator ──
    switch (binding.type) {
      case 'text':
        bindingsCode.push(acGenerateTextBinding({binding,querySelector}));
        break;
      case 'property':
        bindingsCode.push(acGeneratePropertyBinding({binding,querySelector}));
        break;
      case 'event':
        // bindingsCode.push(acGenerateEventBinding({binding,querySelector}));
        break;
      case 'class':
        bindingsCode.push(acGenerateClassBinding({binding,querySelector}));
        break;
      case 'style':
        bindingsCode.push(acGenerateStyleBinding({binding,querySelector}));
        break;
      case 'model':
        bindingsCode.push(acGenerateModelBinding({binding,querySelector,localVars}));
        break;
      case 'attribute':
        bindingsCode.push(acGenerateAttributeBinding({binding,querySelector}));
        break;
      case 'if':
        bindingsCode.push(acGenerateIfBinding({binding,localVars,rootContainer,recursiveGenerate}));
        break;
      case 'for':
        bindingsCode.push(acGenerateForBinding({binding,localVars,rootContainer,recursiveGenerate}));
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
