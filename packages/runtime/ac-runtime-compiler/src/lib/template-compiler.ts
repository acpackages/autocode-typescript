/**
 * @module template-compiler
 *
 * Parses AC Runtime HTML templates and extracts reactive bindings.
 *
 * **Compilation pipeline:**
 * 1. Parse the HTML template string into a DOM tree using `htmlparser2`.
 * 2. Walk every node in the tree, identifying AC-specific syntax:
 *    - `{{expr}}` — Text interpolation → `type: 'text'`
 *    - `[prop]="expr"` — Property binding → `type: 'property'`
 *    - `(event)="expr"` — Event listener → `type: 'event'`
 *    - `[class.name]="expr"` / `ac:class:name` — Class toggle → `type: 'class'`
 *    - `[style.prop]="expr"` / `ac:style:prop` — Style binding → `type: 'style'`
 *    - `ac:model="expr"` — Two-way binding → `type: 'model'`
 *    - `ac:bind:attr="expr"` — Attribute binding → `type: 'attribute'`
 *    - `ac:if="expr"` — Conditional rendering → `type: 'if'`
 *    - `ac:for="item of list"` — List rendering → `type: 'for'`
 *    - `#refName` — Template ref for `@AcViewChild` → stored in `idMap`
 * 3. Replace dynamic attributes with stable `ac-ref` IDs.
 * 4. Return the sanitized HTML string + an array of {@link Binding} descriptors
 *    that the {@link ComponentCompiler} will transform into `createEffect()` calls.
 *
 * Structural directives (`ac:if`, `ac:for`) spawn sub-compilers to
 * recursively process their inner templates, producing nested
 * `childBindings` arrays.
 */
import * as htmlparser2 from 'htmlparser2';
import { DomHandler, Element, Node, Text, isTag } from 'domhandler';
import { randomBytes } from 'node:crypto';

/**
 * Describes a single reactive binding extracted from the template.
 *
 * Each binding tells the {@link ComponentCompiler} what kind of runtime
 * effect to generate and which DOM element (`targetId`) to operate on.
 */
export interface Binding {
  /**
   * The kind of binding. Determines what generated code is emitted:
   * - `'text'` — `el.textContent = String(expr)`
   * - `'property'` — `el[prop] = expr`
   * - `'event'` — `el.addEventListener(event, handler)`
   * - `'class'` — `el.classList.add/remove(name)`
   * - `'style'` — `el.style[prop] = expr`
   * - `'model'` — Two-way: sets value + listens for input
   * - `'attribute'` — `el.setAttribute/removeAttribute(name, expr)`
   * - `'if'` — Conditional DOM insertion/removal
   * - `'for'` — Repeated DOM rendering for each list item
   */
  type: 'text' | 'property' | 'event' | 'if' | 'for' | 'class' | 'model' | 'style' | 'attribute';

  /** The raw expression string from the template (e.g., `'count > 5'`). */
  expression: string;

  /** The target name — event name, CSS property, class name, etc. */
  target?: string;

  /** The unique `ac-ref` ID assigned to the target DOM element. */
  targetId: string;

  /** For structural directives: the inner HTML template string. */
  template?: string;

  /** For structural directives: recursively extracted child bindings. */
  childBindings?: Binding[];

  /** For `ac:for`: the loop iteration variable name (e.g., `'item'`). */
  itemVar?: string;

  /** Root element IDs (reserved for future multi-root support). */
  rootIds: string[];
}

/**
 * The output of {@link TemplateCompiler.compile}.
 *
 * Contains everything the {@link ComponentCompiler} needs to generate
 * the component's `render()` method and reactive effects.
 */
export interface TemplateCompileResult {
  /** The processed HTML string with all dynamic attributes removed and `ac-ref` IDs injected. */
  html: string;

  /** Flat array of bindings extracted from the template (including nested structural ones). */
  bindings: Binding[];

  /**
   * Maps template ref names (`#refName`) to their generated `ac-ref` IDs.
   * Used by the component compiler to wire up `@AcViewChild` properties.
   */
  idMap: Record<string, string>;
}

/** Void elements that must not have closing tags */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * Parses AC Runtime HTML templates and extracts reactive binding descriptors.
 *
 * This compiler is **stateless per invocation** — all mutable state is kept
 * local to the `compile()` call, making it safe to reuse a single instance
 * across multiple compilations (including concurrent ones).
 *
 * Structural directives (`ac:if`, `ac:for`) create new `TemplateCompiler`
 * instances internally to recursively process their inner templates.
 */
export class TemplateCompiler {
  /** Monotonic counter for ID uniqueness (not currently used — hex IDs used instead). */
  private idCounter = 0;

  /**
   * Generate a unique 8-character hex identifier for `ac-ref` attributes.
   * Uses `node:crypto.randomBytes` for Node.js compatibility.
   */
  private generateHexId(): string {
    return randomBytes(4).toString('hex');
  }

  /**
   * Parse an HTML template string and extract all reactive bindings.
   *
   * @param template - Raw HTML string with AC template syntax.
   * @returns A {@link TemplateCompileResult} containing the cleaned HTML,
   *          binding descriptors, and template ref → ID mappings.
   */
  compile(template: string): TemplateCompileResult {
    // Local state per compilation — makes the compiler reentrant
    const bindings: Binding[] = [];
    const idMap = new Map<string, string>();

    // Parse HTML into a DOM tree
    const handler = new DomHandler();
    const parser = new htmlparser2.Parser(handler);
    parser.write(template);
    parser.end();

    // Recursively walk the DOM tree, extracting bindings and rewriting HTML
    const processedHtml = this.processNodes(handler.dom, bindings, idMap);

    return {
      html: processedHtml,
      bindings,
      idMap: Object.fromEntries(idMap),
    };
  }

  /** Concatenate the HTML output of processing each child node. */
  private processNodes(nodes: Node[], bindings: Binding[], idMap: Map<string, string>): string {
    let html = '';
    for (const node of nodes) {
      html += this.processNode(node, bindings, idMap);
    }
    return html;
  }

  /** Dispatch to the appropriate handler based on node type. */
  private processNode(node: Node, bindings: Binding[], idMap: Map<string, string>): string {
    if (node instanceof Text) {
      return this.processTextNode(node, bindings);
    }
    if (isTag(node)) {
      return this.processElementNode(node, bindings, idMap);
    }
    return '';
  }

  /**
   * Process a text node. If it contains `{{...}}` interpolation markers,
   * convert them to a template literal expression, create a text binding,
   * and replace the raw text with a `<span ac-ref="...">` placeholder
   * that the runtime will target via `el.textContent = String(expr)`.
   *
   * Plain text nodes (no `{{`) are returned unchanged.
   */
  private processTextNode(node: Text, bindings: Binding[]): string {
    const text = node.data;
    if (!text.includes('{{')) {
      return text;
    }

    const id = `ac-${this.generateHexId()}`;
    // Convert "Hello {{name}}!" → "`Hello ${name}!`"
    const expression = '`' + text.replace(/\{\{(.+?)\}\}/g, '${$1}') + '`';

    bindings.push({
      type: 'text',
      expression,
      targetId: id,
      rootIds: [],
    });

    return `<span ac-ref="${id}"></span>`;
  }

  /**
   * Process an element node. Handles:
   * - `ac:for` — Loop directive → extracts iteration var, compiles sub-template
   * - `ac:if` — Conditional directive → compiles sub-template
   * - `<ac-container>` — Virtual container → renders children only (no wrapper tag)
   * - Attribute bindings: `[prop]`, `(event)`, `ac:class:`, `ac:style:`, `ac:model`, `ac:bind:`, `#ref`
   *
   * For elements with bindings, injects an `ac-ref` attribute for runtime querySelector targeting.
   */
  private processElementNode(el: Element, bindings: Binding[], idMap: Map<string, string>): string {
    const isContainer = el.tagName === 'ac-container';

    // Handle ac:for
    const acFor = el.attribs['ac:for'];
    if (acFor) {
      delete el.attribs['ac:for'];
      const [itemPart, listExprRaw] = acFor.split(' of ').map(s => s.trim());
      const itemVar = itemPart.replace(/^(let|const|var)\s+/, '');

      // Strip trailing "; let index=index" or similar index declarations
      const listExpr = listExprRaw.split(';')[0].trim();

      const placeholderId = `ac-for-${this.generateHexId()}`;

      const subCompiler = new TemplateCompiler();
      const subResult = subCompiler.compile(
        isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el),
      );
      // Propagate idMap from sub-compiler so @AcViewChild can find refs inside for blocks
      for (const [key, val] of Object.entries(subResult.idMap)) {
        idMap.set(key, val);
      }

      bindings.push({
        type: 'for',
        expression: listExpr,
        itemVar,
        targetId: placeholderId,
        template: subResult.html,
        childBindings: subResult.bindings,
        rootIds: [],
      });
      return `<!--${placeholderId}-->`;
    }

    // Handle ac:if
    const acIf = el.attribs['ac:if'];
    if (acIf) {
      delete el.attribs['ac:if'];
      const placeholderId = `ac-if-${this.generateHexId()}`;
      const subCompiler = new TemplateCompiler();
      const subResult = subCompiler.compile(
        isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el),
      );
      // Propagate idMap from sub-compiler so @AcViewChild can find refs inside if blocks
      for (const [key, val] of Object.entries(subResult.idMap)) {
        idMap.set(key, val);
      }
      bindings.push({
        type: 'if',
        expression: acIf,
        targetId: placeholderId,
        template: subResult.html,
        childBindings: subResult.bindings,
        rootIds: [],
      });
      return `<!--${placeholderId}-->`;
    }

    if (isContainer) {
      return this.processNodes(el.children, bindings, idMap);
    }

    const id = `ac-${this.generateHexId()}`;
    let hasBinding = false;

    const attribEntries = Object.entries(el.attribs);
    for (const [name, value] of attribEntries) {
      if (name.startsWith('[') && name.endsWith(']')) {
        const prop = name.slice(1, -1);
        if (prop.startsWith('class.')) {
          bindings.push({ type: 'class', expression: value, target: prop.slice(6), targetId: id, rootIds: [] });
        } else if (prop.startsWith('style.')) {
          bindings.push({ type: 'style', expression: value, target: prop.slice(6), targetId: id, rootIds: [] });
        } else {
          bindings.push({ type: 'property', expression: value, target: prop, targetId: id, rootIds: [] });
        }
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('(') && name.endsWith(')')) {
        bindings.push({ type: 'event', expression: value, target: name.slice(1, -1), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('ac:class:')) {
        bindings.push({ type: 'class', expression: value, target: name.slice(9), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('ac:style:')) {
        bindings.push({ type: 'style', expression: value, target: name.slice(9), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name === 'ac:model') {
        // Determine the correct property and event based on element type
        const isCheckbox = el.attribs['type'] === 'checkbox';
        const isRadio = el.attribs['type'] === 'radio';
        const isSelect = el.tagName === 'select';
        const prop = (isCheckbox || isRadio) ? 'checked' : 'value';
        const event = (isCheckbox || isRadio || isSelect) ? 'change' : 'input';
        bindings.push({ type: 'model', expression: value, target: `${prop}:${event}`, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('ac:bind:')) {
        bindings.push({ type: 'attribute', expression: value, target: name.slice(8), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('#')) {
        idMap.set(name.slice(1), id);
        hasBinding = true;
        delete el.attribs[name];
      }
    }

    if (hasBinding) {
      el.attribs['ac-ref'] = id;
    }

    const childrenHtml = this.processNodes(el.children, bindings, idMap);
    const attrs = Object.entries(el.attribs).map(([n, v]) => `${n}="${v}"`).join(' ');
    const openTag = `<${el.tagName}${attrs ? ' ' + attrs : ''}>`;

    // Void elements must not have closing tags
    if (VOID_ELEMENTS.has(el.tagName)) {
      return openTag;
    }

    return `${openTag}${childrenHtml}</${el.tagName}>`;
  }

  /** Serialize an element node back to an HTML string (including its tag and attributes). */
  private elementToHtml(el: Element): string {
    return htmlparser2.DomUtils.getOuterHTML(el);
  }
}
