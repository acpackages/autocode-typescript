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
import { acGenerateBindingCallbacks, generateBindings } from './bindings/index.js';
import { acGenerateIfBinding } from './bindings/if-binding.js';
import { acGenerateForBinding } from './bindings/for-binding.js';

// ─── Helper: ViewChild Assignments ───────────────────────────────────────────

/**
 * Generate Object.defineProperty getters for @AcViewChild and #ref bindings.
 *
 * @param viewChildren    - Explicit @AcViewChild declarations
 * @param templateResult  - Contains idMap of all #ref → ac-ref mappings
 * @returns Combined code string for all viewChild assignments
 */
function generateViewChildAssignments(
  viewChildren: ViewChildEntry[],
  templateResult: TemplateCompileResult,
): string {
  const definedProps = new Set<string>();
  const assignments: string[] = [];

  // ── Explicit @AcViewChild declarations ──
  for (const vc of viewChildren) {
    definedProps.add(vc.propName);
    // htmlparser2 lowercases attributes, so do case-insensitive lookup
    const selectorLower = vc.selector.toLowerCase();
    const internalId = templateResult.idMap[selectorLower] || templateResult.idMap[vc.selector];
    if (internalId) {
      assignments.push(
        `Object.defineProperty(this, '${vc.propName}', { get: () => { const el = this.element.querySelector('[ac-ref="${internalId}"]'); return el ? ((el as any).acRuntimeInstance || el) : null; }, configurable: true });`,
      );
    } else {
      assignments.push(
        `console.warn('@AcViewChild: Could not find template ref #${vc.selector}');`,
      );
    }
  }

  // ── Auto-generated getters for all #refs in the template ──
  for (const [refName, id] of Object.entries(templateResult.idMap)) {
    if (!definedProps.has(refName)) {
      assignments.push(
        `Object.defineProperty(this, '${refName}', { get: () => { const el = this.element.querySelector('[ac-ref="${id}"]'); return el ? ((el as any).acRuntimeInstance || el) : null; }, configurable: true });`,
      );
      definedProps.add(refName);
    }
  }

  return assignments.join('\n');
}


/**
 * Generate the complete IIFE-wrapped Web Component code.
 *
 * @param className       - The component class name (e.g., 'AppHeader')
 * @param selector        - The custom element tag name (e.g., 'app-header')
 * @param templateResult  - Compiled template (HTML + bindings + idMap)
 * @param styles          - Array of CSS style strings
 * @param reactiveProps   - Properties that need signal backing
 * @param nonReactiveProps- Properties that stay as plain fields
 * @param inputs          - Names of @AcInput() properties
 * @param outputs         - Names of @AcOutput() properties
 * @param viewChildren    - @AcViewChild entries
 * @param membersCode     - Raw source of methods/getters/setters
 * @param topLevelVars    - File-scope identifiers (for expression prefixing)
 * @param baseClassName   - Parent class name if extends, or null
 * @param prefixFn        - The expression prefixer function
 * @returns Complete IIFE code string (valid TypeScript)
 */
export function acGenerateCustomElementLegacy(options: AcGenerateCustomElementOptions): string {
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
  // ── 1. Property Initializers ──
  // Merge and sort all properties by original source order
  const allProps = [...reactiveProps, ...nonReactiveProps]
    .sort((a, b) => a.sourceIndex - b.sourceIndex);

  // Generate `(this as any).propName = initialValue;` for each property
  const propertyInits = allProps
    .map(p => `(this as any).${p.name} = ${p.init};`)
    .join('\n');

  // ── 2. Output Initializers ──
  // Generate EventEmitter-like objects for @AcOutput() properties
  const outputInits = outputs.map(o =>
    `(this as any).${o} = {
      emit: (data: any) => this.element.dispatchEvent(new CustomEvent('${o}', { detail: data, bubbles: true })),
      subscribe: (fn: (data: any) => void) => {
        const handler = (e: any) => fn(e.detail);
        this.element.addEventListener('${o}', handler);
        return { unsubscribe: () => this.element.removeEventListener('${o}', handler) };
      }
    };`,
  ).join('\n');

  // ── 3. ViewChild Assignments ──
  const viewChildCode = generateViewChildAssignments(
    viewChildren, templateResult,
  );

  // ── 4. Binding Code ──
  const bindingsCode = generateBindings(
    templateResult.bindings,
    new Set(),         // No local vars at the top level
    'this.element',    // Root container is the component's host element
    prefixFn,
    topLevelVars,
  ).join('\n');

  // ── 5. Scoped Styles ──
  const hasStyles = styles.length > 0;
  let scopedStyles = '';
  if (hasStyles) {
    // Replace :host with `&` (nesting) and wrap inside the tag selector
    const rawStyles = styles.join('\n').replace(/:host/g, '&');
    scopedStyles = `${selector} {\n${rawStyles}\n}`;
  }
  const stylesConstant = hasStyles
    ? `const __styles = ${JSON.stringify(scopedStyles)};`
    : '';

  // ── 6. Reactive Signal Setup ──
  const signalSetup = reactiveProps.map(p => {
    const isInput = inputs.includes(p.name);
    return `
      const [${p.name}Sig, set${p.name}Sig, cleanup${p.name}Sig] = createSignal((this as any).${p.name});
      __signalCleanups.push(cleanup${p.name}Sig);
      Object.defineProperty(this, '${p.name}', {
        get: () => ${p.name}Sig(),
        set: (v: any) => {
          const old = ${p.name}Sig();
          set${p.name}Sig(v);
          if (old !== v) {
            const changes = { key: '${p.name}', oldValue: old, newValue: v, firstChange: false };
            if ((this as any).acOnChange) (this as any).acOnChange(changes);
            if ((this as any).acOnPropertyChange) (this as any).acOnPropertyChange(changes);
          }
        },
        configurable: true
      });`;
  }).join('');

  // ── 7. Input Property Accessors on HTMLElement wrapper ──
  const inputAccessors = inputs.map(i => `
    get ${i}() { return (this.acRuntimeInstance as any).${i}; }
    set ${i}(val: any) { (this.acRuntimeInstance as any).${i} = val; }
  `).join('\n');

  // ── 8. Style Lifecycle Code ──
  const styleConnectCode = hasStyles ? `
      __styleRefCount++;
      if (!__styleElement) {
        __styleElement = document.createElement('style');
        __styleElement.setAttribute('data-ac-style', '${selector}');
        __styleElement.textContent = __styles;
        document.head.appendChild(__styleElement);
      }` : '';

  const styleDisconnectCode = hasStyles ? `
      __styleRefCount--;
      if (__styleRefCount <= 0 && __styleElement) {
        __styleElement.remove();
        __styleElement = null;
        __styleRefCount = 0;
      }` : '';

  // ── 9. Assemble the IIFE ──
  return `
/** Generated by AC Runtime Compiler */

export const ${className} = (function() {
  let activeEffect: (() => void) | null = null;
  const effectStack: (() => void)[] = [];
  const __allEffects: Set<{ fn: () => void; deps: Set<Set<() => void>> }> = new Set();

  /** Resolve and apply an ac-pipe transform: value | pipeName:arg1:arg2 */
  function __acPipe(value: any, pipeName: string, ...args: any[]): any {
    try {
      return (acPipeRegistry as any).getPipe({ name: pipeName }).transform(value, ...args);
    } catch {
      console.warn('[AC Runtime] Unknown pipe:', pipeName);
      return value;
    }
  }

  function createSignal<T>(value: T): [() => T, (newValue: T) => void, () => void] {
    const subscribers = new Set<() => void>();
    return [
      () => { if (activeEffect) subscribers.add(activeEffect); return value; },
      (newValue: T) => { if (value === newValue) return; value = newValue; const subs = Array.from(subscribers); for (let i = 0; i < subs.length; i++) subs[i](); },
      () => { subscribers.clear(); } // cleanup function
    ];
  }
  const __signalCleanups: (() => void)[] = [];

  function createEffect(fn: () => void) {
    const effect = () => {
      const prev = activeEffect;
      activeEffect = effect;
      effectStack.push(effect);
      try { fn(); } finally { effectStack.pop(); activeEffect = prev; }
    };
    effect();
  }

  function __destroyAllEffects() {
    __signalCleanups.length = 0;
    __allEffects.clear();
  }

  function findComment(root: any, text: string): Comment | null {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    while (walker.nextNode()) {
      if ((walker.currentNode as Comment).textContent === text) return walker.currentNode as Comment;
    }
    return null;
  }
  ${stylesConstant}
  let __styleRefCount = 0;
  let __styleElement: HTMLStyleElement | null = null;

  class ${className}${baseClassName ? ` extends ${baseClassName}` : ''} {
    static selector = '${selector}';
    element!: HTMLElement;

    constructor() {
      ${baseClassName ? 'super();' : ''}
      ${propertyInits}
      ${outputInits}

      // Map reactive properties to internal signals for bindings
      ${signalSetup}
    }

    render() {
      const self = this;
      this.element.innerHTML = ${JSON.stringify(templateResult.html)};
      ${viewChildCode}
      ${bindingsCode}
    }

    __destroy() {
      // Clean up all signal subscribers
      for (let i = 0; i < __signalCleanups.length; i++) __signalCleanups[i]();
      __destroyAllEffects();
    }

    ${membersCode.join('\n\n')}
  }

  class ${className}Element extends HTMLElement {
    acRuntimeInstance: ${className};

    constructor() {
      super();
      this.acRuntimeInstance = new ${className}();
      this.acRuntimeInstance.element = this;
    }

    static get observedAttributes() { return ${JSON.stringify(inputs.map(i => i.replace(/([A-Z])/g, '-$1').toLowerCase()))}; }
    attributeChangedCallback(name: string, old: string, val: string) { if (old !== val) { const camelKey = name.replace(/-([a-z])/g, (_: any, c: string) => c.toUpperCase()); (this.acRuntimeInstance as any)[camelKey] = val; } }

    ${inputAccessors}

    connectedCallback() {
      this.style.display = 'contents';
      const __lightNodes = Array.from(this.childNodes);
      ${styleConnectCode}
      this.acRuntimeInstance.render();
      const __slot = this.querySelector('slot');
      if (__slot) {
        __slot.replaceWith(...__lightNodes);
      }
      if ((this.acRuntimeInstance as any).acOnInit) (this.acRuntimeInstance as any).acOnInit();
    }
    disconnectedCallback() {
      ${styleDisconnectCode}
      if ((this.acRuntimeInstance as any).acOnDestroy) (this.acRuntimeInstance as any).acOnDestroy();
      (this.acRuntimeInstance as any).__destroy();
    }
  }

  if (!customElements.get('${selector}')) customElements.define('${selector}', ${className}Element);
  return ${className};
})();`;
}


// New Implementation

function stripAcElementDecorator(source: string): string {
  const decoratorName = '@AcElement';
  const index = source.indexOf(decoratorName);
  if (index === -1) return source;

  // Find the opening parenthesis
  let openParenIndex = source.indexOf('(', index + decoratorName.length);
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

export function acGenerateViewChildAssignments(
  viewChildren: ViewChildEntry[],
  templateResult: TemplateCompileResult,
): string {
  const definedProps = new Set<string>();
  const assignments: string[] = [];

  // ── Explicit @AcViewChild declarations ──
  for (const vc of viewChildren) {
    definedProps.add(vc.propName);
    // htmlparser2 lowercases attributes, so do case-insensitive lookup
    const selectorLower = vc.selector.toLowerCase();
    const internalId = templateResult.idMap[selectorLower] || templateResult.idMap[vc.selector];
    if (internalId) {
      assignments.push(
        `Object.defineProperty(this.acRuntimeInstance, '${vc.propName}', { get: () => { const el = this.querySelector('[ac-ref="${internalId}"]'); return el ? ((el as any).acRuntimeInstance || el) : null; }, configurable: true });`,
      );
    } else {
      assignments.push(
        `console.warn('@AcViewChild: Could not find template ref #${vc.selector}');`,
      );
    }
  }

  // ── Auto-generated getters for all #refs in the template ──
  for (const [refName, id] of Object.entries(templateResult.idMap)) {
    if (!definedProps.has(refName)) {
      assignments.push(
        `Object.defineProperty(this.acRuntimeInstance, '${refName}', { get: () => { const el = this.querySelector('[ac-ref="${id}"]'); return el ? ((el as any).acRuntimeInstance || el) : null; }, configurable: true });`,
      );
      definedProps.add(refName);
    }
  }

  return assignments.join('\n');
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
  const propertyRegisterListener:string[] = [];
  for(const binding of templateResult.bindings){
    for(const property of binding.properties){
      if(!bindingProperties.includes(property)){
        bindingProperties.push(property);
        propertyChangeListeners.push(`'${property}':{}`);
        propertyRegisterListener.push(`this.registerPropertyListener('${property}');`);
      }
    }
  }

  const cleanClassSourceCode = stripAcElementDecorator(classSourceCode || '').replace(/\bexport\s+(?:default\s+)?class\s+/, 'class ');
  let code = `
  /** Generated by AC Runtime Compiler */

  const bindings = ${JSON.stringify(templateResult.bindings)};
  `;
  if(styles.length > 0){
    code+=` const styleElement = document.createElement('style');
    styleElement.setAttribute('ac-style-for','${selector}');
    styleElement.innerHTML = \`${selector}{\n${styles.join('\n').replaceAll(':host','&')}\n}\`;
    document.querySelector('head').append(styleElement);
    `;
  }

  code+=`export const ${className} = (function() {

  // Original class declaration copied as is (stripped of AcElement decorator and export keyword)
  ${cleanClassSourceCode}

  class ${htmlElementClassName} extends HTMLElement {
    acRuntimeInstance: ${className};
    private acReactiveProperties: Record<string,{ targetId: string; type: string, expression:string }[]> = ${JSON.stringify(templateResult.reactiveProperties)};
    private isInitialized:boolean = false;
    private changeListeners:Record<string,{callback:any,binding:{ expression:string },currentValue:any}> = {};
    private propertyListeners:any = {${propertyChangeListeners.join(",")}};

    constructor() {
      super();
      this.acRuntimeInstance = new ${className}();
      `;

      if(viewChildren.length > 0){
        code += acGenerateViewChildAssignments(viewChildren,templateResult);
      }
      code += `

      ${acGenerateBindingCallbacks({bindings:templateResult.bindings}).join("\n")};
      ${propertyRegisterListener.join("\n")}
      (this.acRuntimeInstance as any).element = this;
    }

    private appendElementsBetweenComments(
      startCommentName: string,
      endCommentName: string,
      nodes: Node[]
    ): void {
      const startComment = this.findComment(
        startCommentName
      );

      const endComment = this.findComment(
        endCommentName
      );

      if (!startComment || !endComment) {
        return;
      }

      const parent = startComment.parentNode;

      if (!parent) {
        return;
      }

      for (const node of nodes) {
        parent.insertBefore(node, endComment);
      }
    }

    connectedCallback() {
      if(!this.isInitialized){
        this.style.display = 'contents';
        this.render();
        if ((this.acRuntimeInstance as any).acOnInit) {
          (this.acRuntimeInstance as any).acOnInit();
        }
      }
    }

    createElementsFromHtml(
      html: string
    ): HTMLElement[] {
      const template = document.createElement('template');

      template.innerHTML = html.trim();

      return Array.from(
        template.content.children
      ).filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement
      );
    }


    disconnectedCallback() {
      if ((this.acRuntimeInstance as any).acOnDestroy) {
        (this.acRuntimeInstance as any).acOnDestroy();
      }
      if ((this.acRuntimeInstance as any).__destroy) {
        (this.acRuntimeInstance as any).__destroy();
      }
    }

    private evaluateExpression({expression,locals,isExpressionEval = false}:{expression: string, locals?: Record<string, any>, isExpressionEval?: boolean}): any {
      if (expression.includes('|') && !isExpressionEval) {
        const context = this.acRuntimeInstance;
        return evaluateAcPipeExpression({
          expression, context, evaluateFunction: ({ expression, context, }: { expression: string; context: any; }) => {
            return this.evaluateExpression({expression, locals, isExpressionEval:true});
          }
        });
      }
      try {
        const scope = this.getScope(locals);
        const normalizedExpr = this.normalizeExprForScope(expression);
        const fn = new Function('scope', 'context', \`with (context) { with (scope) { return \${normalizedExpr} } } \`);
        const result = fn.call(this.acRuntimeInstance, scope, this.acRuntimeInstance);
        return result;
      } catch (e) {
        console.error(\`Error evaluating expression: \${expression} \`, e);
        return undefined;
      }
    }

    private findComment(
      commentText: string,
    ): Comment | null {
      const walker = document.createTreeWalker(
        this,
        NodeFilter.SHOW_COMMENT
      );

      let current = walker.nextNode();

      while (current) {
        if (
          current.nodeType === Node.COMMENT_NODE &&
          current.nodeValue?.trim() === commentText
        ) {
          return current as Comment;
        }

        current = walker.nextNode();
      }

      return null;
    }

    private getElementsBetweenComments(
      startComment: Comment,
      endComment: Comment
    ): Node[] {
      const nodes: Node[] = [];

      let current = startComment.nextSibling;

      while (current && current !== endComment) {
        nodes.push(current);
        current = current.nextSibling;
      }

      return nodes;
    }

    private getScope(locals?: Record<string, any>): any {
      // const scope = Object.create(null);
      // if (locals) {
      //   Object.assign(scope, locals);
      // }

      // // Collect engine hierarchy from root to this
      // const engines: AcElementRenderer[] =  [];

      // let curr: AcElementRenderer | undefined = this;
      // while (curr) {
      //   engines.unshift(curr);
      //   curr = curr.parent;
      // }

      // // Merge templates and references into scope (local shadows parent)
      // for (const engine of engines) {
      //   engine.templates.forEach((tpl, name) => {
      //     scope[name] = tpl;
      //   });
      //   engine.references.forEach((ref, name) => {
      //     scope[name] = ref;
      //   });
      // }

      return this.acRuntimeInstance;
    }

    private async handlePropertyChange({key,oldValue,newValue}:{key:string,oldValue:any,newValue:any}) {
      // console.log(\`Property change : \${key}\`,oldValue,newValue,this.acRuntimeInstance);
      // console.log(this.acReactiveProperties[key]);
      if(this.propertyListeners[key]){
        for(const targetId of Object.keys(this.propertyListeners[key])){
        const callbackKey = this.propertyListeners[key][targetId];
          const callbackDef = this.changeListeners[callbackKey];
          if(callbackDef){
            const exprNewValue = await this.evaluateExpression({expression:callbackDef.binding.expression});
            if(callbackDef.currentValue != newValue){
              const exprOldValue = callbackDef.currentValue;
              callbackDef.currentValue = exprNewValue;
              callbackDef.callback({oldValue:exprOldValue,newValue:exprNewValue});
            }
          }
          // if(binding.type == 'if'){
          //   if(this.ifHandlers[binding.targetId]){
          //     this.ifHandlers[binding.targetId]();
          //   }
          // }
          // else{
          //   const expressionResult = await this.evaluateExpression({expression:binding.expression});
          //   const reflectingNodes = this.querySelectorAll(\`[ac-ref="\${binding.targetId}"]\`);
          //   if(binding.type == 'value'){
          //     for(const el of Array.from(reflectingNodes) as HTMLElement[]){
          //       el.textContent = String(expressionResult ?? '');
          //     }
          //   }
          //   else if(binding.type == 'bind' || binding.type == 'property'){
          //     if(binding.property){
          //       for(const el of Array.from(reflectingNodes) as HTMLElement[]){
          //         el.setAttribute(binding.property,String(expressionResult ?? ''));
          //       }
          //     }
          //   }
          //   else if(binding.type == 'class'){
          //     if(binding.property){
          //       if(expressionresult){
          //         for(const el of Array.from(reflectingNodes) as HTMLElement[]){
          //           el.classList.add(binding.property);
          //         }
          //       }
          //       else{
          //         for(const el of Array.from(reflectingNodes) as HTMLElement[]){
          //           el.classList.remove(binding.property);
          //         }
          //       }
          //     }
          //   }
          //   else{
          //     console.log(binding);
          //   }
          // }
        }
      }
    }

    private normalizeExprForScope(expression: string): string {
      // Collect all known scope names (templates + references) from hierarchy
      const knownNames = new Set<string>();
      // let engine: AcElementRenderer | undefined = this;

      // while (engine) {
      //   engine.templates.forEach((_, name) => knownNames.add(name));
      //   engine.references.forEach((_, name) => knownNames.add(name));
      //   engine = engine.parent;
      // }

      if (knownNames.size === 0) return expression;

      // Sort by length descending so longer names match first
      const sorted = Array.from(knownNames).sort((a, b) => b.length - a.length);
      const escaped = sorted.map(n => n.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'));
      const pattern = escaped.join('|');
      const regex = new RegExp(\`\\b(\${pattern})\\b\`, 'gi');

      let result = '';
      let i = 0;
      let inString: string | null = null; // ', ", or \`
      let buffer = '';

      while (i < expression.length) {
        const char = expression[i];

        // Handle string start/end
        if (inString) {
          buffer += char;

          // Handle escape
          if (char === '\\\\') {
            buffer += expression[i + 1] || '';
            i += 2;
            continue;
          }

          // End of string
          if (char === inString) {
            result += buffer; // append string as-is
            buffer = '';
            inString = null;
          }

          i++;
          continue;
        }

        // Enter string
        if (char === '"' || char === "'" || char === '\`') {
          // process buffer before entering string
          if (buffer) {
            result += buffer.replace(regex, (match) => match.toLowerCase());
            buffer = '';
          }

          inString = char;
          buffer += char;
          i++;
          continue;
        }

        buffer += char;
        i++;
      }

      // process remaining buffer
      if (buffer) {
        if (inString) {
          // unterminated string → keep as-is
          result += buffer;
        } else {
          result += buffer.replace(regex, (match) => match.toLowerCase());
        }
      }

      return result;
    }

    private registerPropertyListener(key: string) {
      let value = (this.acRuntimeInstance as any)[key];
      Object.defineProperty(this.acRuntimeInstance, key, {
        get: () => {
          return value;
        },
        set: (newValue) => {
          if (Object.is(value, newValue)) {
            return;
          }
          const oldValue = value;
          value = newValue;
          this.handlePropertyChange({key,oldValue,newValue});
          const changes = {
            key,
            oldValue,
            newValue,
            firstChange: false
          };
          if ((this.acRuntimeInstance as any).acOnChange) {
            (this.acRuntimeInstance as any).acOnChange(changes);
          }
          if ((this.acRuntimeInstance as any).acOnPropertyChange) {
            (this.acRuntimeInstance as any).acOnPropertyChange(changes);
          }
        },
        configurable: true,
        enumerable: true
      });
    }

    private removeElementsBetweenCommentsByName(
      startCommentName: string,
      endCommentName: string
    ): void {
      const startComment = this.findComment(startCommentName);
      const endComment = this.findComment(endCommentName);

      if (!startComment || !endComment) {
        return;
      }

      let current = startComment.nextSibling;

      while (current && current !== endComment) {
        const next = current.nextSibling;

        current.remove();

        current = next;
      }
    }

    private render(){
      this.innerHTML = \`${templateResult.html}\`;
    }
  }

  if (!customElements.get('${selector}')) customElements.define('${selector}', ${htmlElementClassName});
  return ${className};
})();`;
return code;
}

