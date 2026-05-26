/* eslint-disable no-useless-escape */
/**
 * @module code-generator
 *
 * Generates the complete IIFE-wrapped Web Component code string.
 *
 * This is the final stage of compilation. It takes all the analyzed
 * component data (properties, template, bindings, styles) and assembles
 * them into a self-contained Immediately Invoked Function Expression (IIFE).
 *
 * **What the generated IIFE contains:**
 *
 * 1. **Signal system** — `createSignal()` and `createEffect()` scoped
 *    inside the IIFE to avoid global pollution
 * 2. **Inner component class** — mirrors the original class with:
 *    - Signal-backed reactive properties (via Object.defineProperty)
 *    - `render()` method that sets innerHTML and wires up bindings
 *    - All original methods, getters, and setters copied verbatim
 * 3. **HTMLElement wrapper** — `${Class}Element extends HTMLElement`:
 *    - Creates the inner class instance in constructor
 *    - Forwards observedAttributes / attributeChangedCallback for inputs
 *    - Calls render() + acOnInit() on connectedCallback
 *    - Calls acOnDestroy() on disconnectedCallback
 *    - Manages scoped style injection with reference counting
 * 4. **Custom element registration** — `customElements.define(selector, Element)`
 */
import type {
  TemplateCompileResult,
  ReactiveProperty,
  ViewChildEntry,
  Binding,
  PrefixFn,
} from './types.js';
import { acGenerateBindingCallbacks } from './bindings/index.js';


function stripAcElementDecorator(source: string): string {
  const decoratorName = '@AcElement';
  const index = source.indexOf(decoratorName);
  if (index === -1) return source;

  // Find the opening parenthesis
  const openParenIndex = source.indexOf('(', index + decoratorName.length);
  if (openParenIndex === -1) return source;

  // Parse from openParenIndex to match the closing parenthesis
  let parenCount = 1;
  let inString: string | null = null;
  let isEscaped = false;
  let i = openParenIndex + 1;

  while (i < source.length && parenCount > 0) {
    const char = source[i];

    if (isEscaped) {
      isEscaped = false;
      i++;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      i++;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null; // String closed
      }
      i++;
      continue;
    }

    // We are not in a string
    if (char === '"' || char === "'" || char === '`') {
      inString = char;
    } else if (char === '(') {
      parenCount++;
    } else if (char === ')') {
      parenCount--;
    }
    i++;
  }

  const before = source.slice(0, index);
  let after = source.slice(i);
  after = after.replace(/^\s*/, '');

  return before + after;
}

export function acGenerateViewChildObject(
  viewChildren: ViewChildEntry[],
  templateResult: TemplateCompileResult,
): string {
  const definedProps = new Set<string>();
  const assignments: string[] = [];
  const viewChildrenDetails:any = {};

  // ── Explicit @AcViewChild declarations ──
  for (const vc of viewChildren) {
    definedProps.add(vc.propName);
    // htmlparser2 lowercases attributes, so do case-insensitive lookup
    const selectorLower = vc.selector.toLowerCase();
    const internalId = templateResult.idMap[selectorLower] || templateResult.idMap[vc.selector];
    if (internalId) {
      viewChildrenDetails[vc.propName] = internalId;
    } else {
      assignments.push(
        `console.warn('@AcViewChild: Could not find template ref #${vc.selector}');`,
      );
    }
  }

  return viewChildrenDetails;
}

export interface AcGenerateCustomElementOptions {
  className: string;
  selector: string;
  templateResult: TemplateCompileResult;
  templateHtml: string;
  styles: string[];
  reactiveProps: ReactiveProperty[];
  nonReactiveProps: ReactiveProperty[];
  inputs: string[];
  outputs: string[];
  viewChildren: ViewChildEntry[];
  membersCode: string[];
  topLevelVars: Set<string>;
  baseClassName: string | null;
  prefixFn: PrefixFn;
  classSourceCode: string;
}

export function acGenerateCustomElement(options: AcGenerateCustomElementOptions): string {
  const {
    className,
    selector,
    templateResult,
    templateHtml,
    styles,
    reactiveProps,
    nonReactiveProps,
    inputs,
    outputs,
    viewChildren,
    membersCode,
    topLevelVars,
    baseClassName,
    prefixFn,
    classSourceCode
  } = options;
  const htmlElementClassName = `\$\$\$${className}`;
  const bindingProperties:string[] = [];
  const propertyChangeListeners:string[] = [];
  const changeListenerProperties:string[] = [...options.templateResult.inputs];
  const setPropertyListeners = (bindings:Binding[])=>{
    for(const binding of bindings){
      for(const property of binding.properties){
        if(!bindingProperties.includes(property)){
          bindingProperties.push(property);
          propertyChangeListeners.push(`'${property}':{}`);
        }
      }
      if(binding.childBindings && binding.childBindings.length > 0){
        setPropertyListeners(binding.childBindings);
      }
    }
  }
  setPropertyListeners(templateResult.bindings);


  const cleanClassSourceCode = stripAcElementDecorator(classSourceCode || '').replace(/\bexport\s+(?:default\s+)?class\s+/, 'class ');
  let code = `
  /** Generated by AC Runtime Compiler */
  `;
  if(styles.length > 0){
    code+=` const styleElement = document.createElement('style');
    styleElement.setAttribute('ac-style-for','${selector}');
    styleElement.innerHTML = \`${selector}{\n${styles.join('\n').replaceAll(':host','&')}\n}\`;
    document.querySelector('head').append(styleElement);
    `;
  }

  code+=`export const ${className} = (function() {


  const templateResult = ${JSON.stringify(templateResult)};

  // Original class declaration copied as is (stripped of AcElement decorator and export keyword)
  ${cleanClassSourceCode}

  class ${htmlElementClassName} extends AcRuntimeElement {

    constructor() {
      super();

      this.acRuntimeInstance = this.makeReactive(new ${className}());
      this.acRuntimeInstance.element = this;
      this.propertyToListenForChanges = ${JSON.stringify(changeListenerProperties)};
      this.instanceInputs = ${JSON.stringify(options.templateResult.inputs)};
      this.instanceOutputs = ${JSON.stringify(options.templateResult.outputs)};
      this.instanceViewChildren = ${JSON.stringify( acGenerateViewChildObject(viewChildren,templateResult) )};

      this.elementHtml = \`${templateResult.html}\`;

      this.propertyListeners = {${propertyChangeListeners.join(",")}};

      `;
      code += `

      ${acGenerateBindingCallbacks({bindings:templateResult.bindings}).join("\n")};
    }
  }

  if (!customElements.get('${selector}')) customElements.define('${selector}', ${htmlElementClassName});
  return ${className};
})();`;
return code;
}

