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
import { generateBindings } from './bindings/index.js';

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
export function generateWebComponent(
  className: string,
  selector: string,
  templateResult: TemplateCompileResult,
  styles: string[],
  reactiveProps: ReactiveProperty[],
  nonReactiveProps: ReactiveProperty[],
  inputs: string[],
  outputs: string[],
  viewChildren: ViewChildEntry[],
  membersCode: string[],
  topLevelVars: Set<string>,
  baseClassName: string | null,
  prefixFn: PrefixFn,
): string {
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
