/**
 * @module template-compiler
 *
 * Parses AC Runtime HTML templates and extracts reactive bindings.
 *
 * **Compilation pipeline:**
 * 1. Parse the HTML template string into a DOM tree using `htmlparser2`
 * 2. Walk every node in the tree, identifying AC-specific syntax:
 *    - `{{expr}}`          → Text interpolation  → type: 'text'
 *    - `[prop]="expr"`     → Property binding     → type: 'property'
 *    - `(event)="expr"`    → Event listener       → type: 'event'
 *    - `[class.name]`      → Class toggle         → type: 'class'
 *    - `[style.prop]`      → Style binding        → type: 'style'
 *    - `ac:model="expr"`   → Two-way binding      → type: 'model'
 *    - `ac:bind:attr`      → Attribute binding    → type: 'attribute'
 *    - `ac:if="expr"`      → Conditional render   → type: 'if'
 *    - `ac:for="x of xs"`  → List render          → type: 'for'
 *    - `#refName`          → Template ref         → stored in idMap
 * 3. Replace dynamic attributes with stable `ac-ref` IDs
 * 4. Return cleaned HTML + binding descriptors
 *
 * Structural directives (`ac:if`, `ac:for`) spawn sub-compilers to
 * recursively process their inner templates.
 */
import * as htmlparser2 from 'htmlparser2';
import { DomHandler, Element, Node, Text, isTag } from 'domhandler';
import { randomBytes } from 'node:crypto';
import type { Binding, TemplateCompileResult } from './types.js';
import { VOID_ELEMENTS } from './constants.js';
import { transformPipeExpression } from './pipes.js';

// Re-export types so existing consumers don't break
export type { Binding, TemplateCompileResult };

/**
 * Parses AC Runtime HTML templates and extracts reactive binding descriptors.
 *
 * This compiler is **stateless per invocation** — all mutable state is kept
 * local to the `compile()` call, making it safe to reuse a single instance
 * across multiple compilations.
 */
export class TemplateCompiler {
  /** Counter for ID uniqueness (not currently used — hex IDs used instead). */
  private idCounter = 0;

  /**
   * Generate a unique 8-character hex ID for `ac-ref` attributes.
   * Uses `crypto.randomBytes` for guaranteed uniqueness.
   */
  private generateHexId(): string {
    return randomBytes(4).toString('hex');
  }

  /**
   * Parse an HTML template string and extract all reactive bindings.
   *
   * @param template - Raw HTML string with AC template syntax
   * @returns Cleaned HTML, binding descriptors, and ref→ID mappings
   */
  compile(template: string): TemplateCompileResult {
    // Local state per compilation — makes the compiler reentrant
    const bindings: Binding[] = [];
    const idMap = new Map<string, string>();

    // Parse HTML into a DOM tree
    // lowerCaseAttributeNames: false preserves camelCase like [usePagination]
    const handler = new DomHandler();
    const parser = new htmlparser2.Parser(handler, { lowerCaseAttributeNames: false });
    parser.write(template);
    parser.end();

    // Walk the tree, extracting bindings and producing clean HTML
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
   * Process a text node containing `{{...}}` interpolation markers.
   *
   * Converts `Hello {{name}}!` into a `<span ac-ref="..."></span>` placeholder
   * and creates a text binding that the runtime will use to update the content.
   *
   * Plain text nodes (no `{{`) are returned unchanged.
   */
  private processTextNode(node: Text, bindings: Binding[]): string {
    const text = node.data;
    // No interpolation markers → return as-is
    if (!text.includes('{{')) return text;

    const id = `ac-${this.generateHexId()}`;

    // Convert "Hello {{name}}!" → "`Hello ${name}!`"
    // Also transform pipe expressions: "{{val | currency}}" → "`${__acPipe(val, 'currency')}`"
    const expression = '`' + text.replace(
      /\{\{(.+?)\}\}/g,
      (_, inner) => '${' + transformPipeExpression(inner) + '}',
    ) + '`';

    bindings.push({
      type: 'text',
      expression,
      targetId: id,
      rootIds: [],
    });

    // Return a span placeholder that the runtime will find and update
    return `<span ac-ref="${id}"></span>`;
  }

  /**
   * Process an element node. This is the main workhorse that handles:
   *
   * **Structural directives** (processed first, replace entire element):
   * - `ac:for` → Loop rendering
   * - `ac:if`  → Conditional rendering
   *
   * **Special elements:**
   * - `<ac-template>` → Named template slot
   * - `<ac-container>` → Virtual container (renders children only, no wrapper tag)
   * - `ac:template:outlet` → Template content injection
   *
   * **Attribute bindings** (processed on regular elements):
   * - `[prop]` → Property binding
   * - `(event)` → Event binding
   * - `ac:class:name` → Class toggle
   * - `ac:style:prop` → Style binding
   * - `ac:model` → Two-way binding
   * - `ac:bind:attr` → Attribute binding
   * - `#ref` → Template reference
   */
  private processElementNode(el: Element, bindings: Binding[], idMap: Map<string, string>): string {
    const isContainer = el.tagName === 'ac-container';

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTURAL DIRECTIVE: ac:for
    // ═══════════════════════════════════════════════════════════════════
    const acFor = el.attribs['ac:for'];
    if (acFor) {
      return this.processForDirective(el, acFor, bindings, idMap, isContainer);
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTURAL DIRECTIVE: ac:if
    // ═══════════════════════════════════════════════════════════════════
    const acIf = el.attribs['ac:if'];
    if (acIf) {
      return this.processIfDirective(el, acIf, bindings, idMap, isContainer);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPECIAL ELEMENT: <ac-template>
    // ═══════════════════════════════════════════════════════════════════
    if (el.tagName === 'ac-template') {
      return this.processTemplateElement(el, bindings, idMap);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPECIAL DIRECTIVE: ac:template:outlet (before container check)
    // ═══════════════════════════════════════════════════════════════════
    const acTemplateOutlet = el.attribs['ac:template:outlet'];
    if (acTemplateOutlet) {
      return this.processTemplateOutlet(el, acTemplateOutlet, bindings);
    }

    // ═══════════════════════════════════════════════════════════════════
    // VIRTUAL CONTAINER: <ac-container> (renders children only)
    // ═══════════════════════════════════════════════════════════════════
    if (isContainer) {
      return this.processNodes(el.children, bindings, idMap);
    }

    // ═══════════════════════════════════════════════════════════════════
    // REGULAR ELEMENT: Process attribute bindings
    // ═══════════════════════════════════════════════════════════════════
    return this.processRegularElement(el, bindings, idMap);
  }

  // ─── Structural Directive Handlers ─────────────────────────────────────────

  /**
   * Process `ac:for="item of items"` directive.
   *
   * Parses the for expression, creates a sub-compiler for the inner template,
   * and returns a comment placeholder for runtime insertion.
   */
  private processForDirective(
    el: Element,
    acFor: string,
    bindings: Binding[],
    idMap: Map<string, string>,
    isContainer: boolean,
  ): string {
    delete el.attribs['ac:for'];

    // Parse "item of items" or "let item of items; let i = index"
    const [itemPart, rest] = acFor.split(' of ').map(s => s.trim());
    const itemVar = itemPart.replace(/^(let|const|var)\s+/, '');

    let listExpr = rest;
    let indexVar: string | undefined;

    // Handle optional index: "items; let i = index"
    if (rest.includes(';')) {
      const parts = rest.split(';').map(s => s.trim());
      listExpr = parts[0];
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes('=')) {
          const [v, alias] = part.split('=').map(s => s.trim());
          if (alias === 'index') {
            indexVar = v.replace(/^(let|const|var)\s+/, '');
          }
        }
      }
    }

    const placeholderId = `ac-for-${this.generateHexId()}`;

    // Recursively compile the inner template
    const subCompiler = new TemplateCompiler();
    const subResult = subCompiler.compile(
      isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el),
    );

    // Propagate idMap so @AcViewChild can find refs inside for blocks
    for (const [key, val] of Object.entries(subResult.idMap)) {
      idMap.set(key, val);
    }

    bindings.push({
      type: 'for',
      expression: listExpr,
      itemVar,
      indexVar,
      targetId: placeholderId,
      template: subResult.html,
      childBindings: subResult.bindings,
      rootIds: [],
    });

    // Return a comment node as the insertion point
    return `<!--${placeholderId}-->`;
  }

  /**
   * Process `ac:if="condition"` directive.
   *
   * Creates a sub-compiler for the inner template and returns a
   * comment placeholder for runtime conditional insertion.
   */
  private processIfDirective(
    el: Element,
    acIf: string,
    bindings: Binding[],
    idMap: Map<string, string>,
    isContainer: boolean,
  ): string {
    delete el.attribs['ac:if'];

    const placeholderId = `ac-if-${this.generateHexId()}`;

    // Recursively compile the inner template
    const subCompiler = new TemplateCompiler();
    const subResult = subCompiler.compile(
      isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el),
    );

    // Propagate idMap so @AcViewChild can find refs inside if blocks
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

  // ─── Special Element Handlers ──────────────────────────────────────────────

  /**
   * Process `<ac-template #refName>...</ac-template>`.
   *
   * Compiles to a hidden div that can be referenced by ac:template:outlet.
   */
  private processTemplateElement(
    el: Element,
    bindings: Binding[],
    idMap: Map<string, string>,
  ): string {
    const id = `ac-${this.generateHexId()}`;

    // Register all #ref attributes on this template element
    for (const attrName of Object.keys(el.attribs)) {
      if (attrName.startsWith('#')) {
        const refName = attrName.slice(1);
        idMap.set(refName, id);
        idMap.set(refName.toLowerCase(), id);
      }
    }

    const childrenHtml = this.processNodes(el.children, bindings, idMap);
    return `<div data-ac-template ac-ref="${id}" style="display:none">${childrenHtml}</div>`;
  }

  /**
   * Process `ac:template:outlet="templateRef"` directive.
   *
   * Renders a div that will be filled with the referenced template's content.
   */
  private processTemplateOutlet(
    el: Element,
    acTemplateOutlet: string,
    bindings: Binding[],
  ): string {
    const id = `ac-${this.generateHexId()}`;
    let expression = acTemplateOutlet;
    let contextExpression: string | undefined;

    // Handle syntax: "templateRef; context: { $implicit: item }"
    if (acTemplateOutlet.includes(';')) {
      const parts = acTemplateOutlet.split(';');
      expression = parts[0].trim();
      const contextPart = parts[1].trim();
      if (contextPart.startsWith('context:')) {
        contextExpression = contextPart.replace('context:', '').trim();
      }
    }

    bindings.push({
      type: 'template-outlet',
      expression,
      contextExpression,
      targetId: id,
      rootIds: [],
    });

    return `<div ac-ref="${id}"></div>`;
  }

  // ─── Regular Element Processing ────────────────────────────────────────────

  /**
   * Process a regular HTML element, extracting any binding attributes.
   *
   * Scans all attributes for AC binding syntax, creates binding descriptors,
   * removes the binding attributes, and injects an `ac-ref` ID if needed.
   */
  private processRegularElement(
    el: Element,
    bindings: Binding[],
    idMap: Map<string, string>,
  ): string {
    const id = `ac-${this.generateHexId()}`;
    let hasBinding = false;

    const attribEntries = Object.entries(el.attribs);
    for (const [name, value] of attribEntries) {
      // ── Property binding: [prop]="expr" ──
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
      }
      // ── Event binding: (event)="expr" ──
      else if (name.startsWith('(') && name.endsWith(')')) {
        bindings.push({ type: 'event', expression: value, target: name.slice(1, -1), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Class toggle: ac:class:name="expr" ──
      else if (name.startsWith('ac:class:')) {
        bindings.push({ type: 'class', expression: value, target: name.slice(9), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Style binding: ac:style:prop="expr" ──
      else if (name.startsWith('ac:style:')) {
        bindings.push({ type: 'style', expression: value, target: name.slice(9), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Two-way binding: ac:model="expr" ──
      else if (name === 'ac:model') {
        const isCheckbox = el.attribs['type'] === 'checkbox';
        const isRadio = el.attribs['type'] === 'radio';
        const isSelect = el.tagName === 'select';
        const prop = (isCheckbox || isRadio) ? 'checked' : 'value';
        const event = (isCheckbox || isRadio || isSelect) ? 'change' : 'input';
        bindings.push({ type: 'model', expression: value, target: `${prop}:${event}`, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Attribute binding: ac:bind:attr="expr" ──
      else if (name.startsWith('ac:bind:')) {
        bindings.push({ type: 'attribute', expression: value, target: name.slice(8), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Template outlet: ac:template:outlet="expr" ──
      else if (name === 'ac:template:outlet') {
        bindings.push({ type: 'template-outlet', expression: value, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Template reference: #refName ──
      else if (name.startsWith('#')) {
        idMap.set(name.slice(1), id);
        hasBinding = true;
        delete el.attribs[name];
      }
    }

    // Inject ac-ref attribute if this element has any bindings
    if (hasBinding) {
      el.attribs['ac-ref'] = id;
    }

    // Process child nodes
    const childrenHtml = this.processNodes(el.children, bindings, idMap);

    // Serialize the element back to HTML
    const attrs = Object.entries(el.attribs).map(([n, v]) => `${n}="${v}"`).join(' ');
    const openTag = `<${el.tagName}${attrs ? ' ' + attrs : ''}>`;

    // Void elements (br, img, input, etc.) must not have closing tags
    if (VOID_ELEMENTS.has(el.tagName)) {
      return openTag;
    }

    return `${openTag}${childrenHtml}</${el.tagName}>`;
  }

  /** Serialize an element node back to an HTML string. */
  private elementToHtml(el: Element): string {
    return htmlparser2.DomUtils.getOuterHTML(el);
  }
}
