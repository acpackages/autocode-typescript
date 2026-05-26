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
 *    - #refName          → Template ref         → stored in idMap
 * 3. Replace dynamic attributes with stable `ac-ref` IDs
 * 4. Return cleaned HTML + binding descriptors
 *
 * Structural directives (`ac:if`, `ac:for`) spawn sub-compilers to
 * recursively process their inner templates.
 */
import * as htmlparser2 from 'htmlparser2';
import { DomHandler, Element, Node, Text, isTag } from 'domhandler';
import { randomBytes } from 'node:crypto';
import type { Binding, ReactivePropertyDef, TemplateCompileResult } from './types.js';
import { VOID_ELEMENTS, GLOBAL_IDENTIFIERS } from './constants.js';
import { transformPipeExpression } from './pipes.js';
import * as ts from 'typescript';

// Re-export types so existing consumers don't break
export type { Binding, TemplateCompileResult };

/**
 * Extract bare identifiers from a template expression string.
 * Filters out JS/TS keywords, built-ins, browser globals, and local variables.
 */
function extractExpressionIdentifiers(
  expression: string,
  localVars: Set<string>,
): Set<string> {
  const identifiers = new Set<string>();

  if (!expression || !expression.trim()) return identifiers;

  // Handle template literals
  if (expression.startsWith('`') && expression.endsWith('`')) {
    const matches = expression.matchAll(/\$\{([^}]+)\}/g);
    for (const match of matches) {
      const innerIds = extractExpressionIdentifiers(match[1], localVars);
      for (const id of innerIds) {
        identifiers.add(id);
      }
    }
    return identifiers;
  }

  try {
    const sourceFile = ts.createSourceFile('expr.ts', `(${expression})`, ts.ScriptTarget.Latest, true);

    const visit = (node: ts.Node) => {
      // Exclude function/arrow parameters
      if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        const nestedLocalVars = new Set(localVars);
        for (const param of node.parameters) {
          if (ts.isIdentifier(param.name)) {
            nestedLocalVars.add(param.name.text);
          }
        }
        const visitWithScope = (n: ts.Node) => {
          if (ts.isPropertyAccessExpression(n)) {
            if (n.expression.kind === ts.SyntaxKind.ThisKeyword) {
              const name = n.name.text;
              if (!nestedLocalVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
                identifiers.add(name);
              }
            } else {
              visitWithScope(n.expression);
            }
            return;
          }
          if (ts.isElementAccessExpression(n)) {
            if (n.expression.kind === ts.SyntaxKind.ThisKeyword && ts.isStringLiteral(n.argumentExpression)) {
              const name = n.argumentExpression.text;
              if (!nestedLocalVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
                identifiers.add(name);
              }
            } else {
              visitWithScope(n.expression);
              visitWithScope(n.argumentExpression);
            }
            return;
          }
          if (ts.isPropertyAssignment(n)) {
            visitWithScope(n.initializer);
            return;
          }
          if (ts.isShorthandPropertyAssignment(n)) {
            const name = n.name.text;
            if (!nestedLocalVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
              identifiers.add(name);
            }
            return;
          }
          if (ts.isIdentifier(n)) {
            const name = n.text;
            if (!nestedLocalVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
              identifiers.add(name);
            }
          }
          ts.forEachChild(n, visitWithScope);
        };
        visitWithScope(node.body);
        return;
      }

      if (ts.isPropertyAccessExpression(node)) {
        if (node.expression.kind === ts.SyntaxKind.ThisKeyword) {
          const name = node.name.text;
          if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
            identifiers.add(name);
          }
        } else {
          visit(node.expression);
        }
        return;
      }

      if (ts.isElementAccessExpression(node)) {
        if (node.expression.kind === ts.SyntaxKind.ThisKeyword && ts.isStringLiteral(node.argumentExpression)) {
          const name = node.argumentExpression.text;
          if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
            identifiers.add(name);
          }
        } else {
          visit(node.expression);
          visit(node.argumentExpression);
        }
        return;
      }

      if (ts.isPropertyAssignment(node)) {
        visit(node.initializer);
        return;
      }

      if (ts.isShorthandPropertyAssignment(node)) {
        const name = node.name.text;
        if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
          identifiers.add(name);
        }
        return;
      }

      if (ts.isIdentifier(node)) {
        const name = node.text;
        if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
          identifiers.add(name);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  } catch {
    // Fallback: if TS compilation fails, use simple regex to avoid crash
    const matches = expression.matchAll(/[a-zA-Z_$][a-zA-Z0-9_$]*/g);
    for (const match of matches) {
      const name = match[0];
      if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name)) {
        identifiers.add(name);
      }
    }
  }

  return identifiers;
}

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
  compile(template: string, localVars: Set<string> = new Set()): TemplateCompileResult {
    // Local state per compilation — makes the compiler reentrant
    const bindings: Binding[] = [];
    const idMap = new Map<string, string>();
    const reactiveProperties: Record<string, ReactivePropertyDef[]> = {};

    // Parse HTML into a DOM tree
    // lowerCaseAttributeNames: false preserves camelCase like [usePagination]
    const handler = new DomHandler();
    const parser = new htmlparser2.Parser(handler, { lowerCaseAttributeNames: false });
    parser.write(template);
    parser.end();

    // Walk the tree, extracting bindings and producing clean HTML
    const processedHtml = this.processNodes(handler.dom, bindings, idMap, reactiveProperties, localVars);

    return {
      html: processedHtml,
      bindings,
      idMap: Object.fromEntries(idMap),
      reactiveProperties,
    };
  }

  /** Helper to register reactive properties */
  private addReactiveProperties(options: {
    expression: string;
    targetId: string;
    type: string;
    reactiveProperties: Record<string, ReactivePropertyDef[]>;
    localVars: Set<string>;
    property?: string;
    targetElementHtml?: string;
  }): void {
    const { expression, targetId, type, reactiveProperties, localVars, targetElementHtml } = options;
    const ids = extractExpressionIdentifiers(expression, localVars);
    for (const id of ids) {
      if (!reactiveProperties[id]) {
        reactiveProperties[id] = [];
      }
      const alreadyExists = reactiveProperties[id].some(
        entry => entry.targetId === targetId && entry.type === type
      );
      if (!alreadyExists) {
        reactiveProperties[id].push({ targetId, type, expression, targetElementHtml });
      }
    }
  }

  /** Concatenate the HTML output of processing each child node. */
  private processNodes(
    nodes: Node[],
    bindings: Binding[],
    idMap: Map<string, string>,
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    let html = '';
    for (const node of nodes) {
      html += this.processNode(node, bindings, idMap, reactiveProperties, localVars);
    }
    return html;
  }

  /** Dispatch to the appropriate handler based on node type. */
  private processNode(
    node: Node,
    bindings: Binding[],
    idMap: Map<string, string>,
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    if (node instanceof Text) {
      return this.processTextNode(node, bindings, reactiveProperties, localVars);
    }
    if (isTag(node)) {
      return this.processElementNode(node, bindings, idMap, reactiveProperties, localVars);
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
  private processTextNode(
    node: Text,
    bindings: Binding[],
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    const text = node.data;
    // No interpolation markers → return as-is
    if (!text.includes('{{')) return text;

    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const parts = text.split(/(\{\{.+?\}\})/g);
    let finalHtml = '';

    for (const part of parts) {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const inner = part.slice(2, -2).trim();
        const id = `${this.generateHexId()}`;
        const properties = Array.from(extractExpressionIdentifiers(inner, localVars));

        bindings.push({
          bindingId:this.generateHexId(),
          type: 'text',
          expression: inner,
          targetId: id,
          properties,
          rootIds: [],
        });

        const spanHtml = `<span ac-ref="${id}"></span>`;
        this.addReactiveProperties({
          expression: inner,
          targetId: id,
          type: 'value',
          reactiveProperties,
          localVars,
          targetElementHtml: spanHtml,
        });

        finalHtml += spanHtml;
      } else {
        finalHtml += escapeHtml(part);
      }
    }

    return finalHtml;
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
  private processElementNode(
    el: Element,
    bindings: Binding[],
    idMap: Map<string, string>,
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    const isContainer = el.tagName === 'ac-container';

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTURAL DIRECTIVE: ac:for
    // ═══════════════════════════════════════════════════════════════════
    const acFor = el.attribs['ac:for'];
    if (acFor) {
      return this.processForDirective(el, acFor, bindings, idMap, isContainer, reactiveProperties, localVars);
    }

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTURAL DIRECTIVE: ac:if
    // ═══════════════════════════════════════════════════════════════════
    const acIf = el.attribs['ac:if'];
    if (acIf) {
      return this.processIfDirective(el, acIf, bindings, idMap, isContainer, reactiveProperties, localVars);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPECIAL ELEMENT: <ac-template>
    // ═══════════════════════════════════════════════════════════════════
    if (el.tagName === 'ac-template') {
      return this.processTemplateElement(el, bindings, idMap, reactiveProperties, localVars);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPECIAL DIRECTIVE: ac:template:outlet (before container check)
    // ═══════════════════════════════════════════════════════════════════
    const acTemplateOutlet = el.attribs['ac:template:outlet'];
    if (acTemplateOutlet) {
      return this.processTemplateOutlet(el, acTemplateOutlet, bindings, reactiveProperties, localVars);
    }

    // ═══════════════════════════════════════════════════════════════════
    // VIRTUAL CONTAINER: <ac-container> (renders children only)
    // ═══════════════════════════════════════════════════════════════════
    if (isContainer) {
      return this.processNodes(el.children, bindings, idMap, reactiveProperties, localVars);
    }

    // ═══════════════════════════════════════════════════════════════════
    // REGULAR ELEMENT: Process attribute bindings
    // ═══════════════════════════════════════════════════════════════════
    return this.processRegularElement(el, bindings, idMap, reactiveProperties, localVars);
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
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
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
    const newLocalVars = new Set(localVars);
    if (itemVar) newLocalVars.add(itemVar);
    if (indexVar) newLocalVars.add(indexVar);

    const subResult = subCompiler.compile(
      isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el),
      newLocalVars,
    );

    // Propagate idMap so @AcViewChild can find refs inside for blocks
    for (const [key, val] of Object.entries(subResult.idMap)) {
      idMap.set(key, val);
    }

    // Merge subResult.reactiveProperties
    for (const [prop, entries] of Object.entries(subResult.reactiveProperties)) {
      if (!reactiveProperties[prop]) {
        reactiveProperties[prop] = [];
      }
      for (const entry of entries) {
        const alreadyExists = reactiveProperties[prop].some(
          existing => existing.targetId === entry.targetId && existing.type === entry.type
        );
        if (!alreadyExists) {
          reactiveProperties[prop].push(entry);
        }
      }
    }

    const properties = Array.from(extractExpressionIdentifiers(listExpr, localVars));
    const finalHtml = `<!--${placeholderId}-start--><!--${placeholderId}-end-->`;

    bindings.push({
      type: 'for',
      bindingId:this.generateHexId(),
      expression: listExpr,
      itemVar,
      indexVar,
      targetId: placeholderId,
      template: subResult.html,
      childBindings: subResult.bindings,
      properties,
      rootIds: [],
    });

    this.addReactiveProperties({
      expression: listExpr,
      targetId: placeholderId,
      type: 'for',
      reactiveProperties,
      localVars,
      targetElementHtml: finalHtml,
    });

    // Return a comment node as the insertion point
    return finalHtml;
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
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    delete el.attribs['ac:if'];

    const placeholderId = `ac-if-${this.generateHexId()}`;

    // Recursively compile the inner template
    const subCompiler = new TemplateCompiler();
    const subResult = subCompiler.compile(
      isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el),
      localVars,
    );

    // Propagate idMap so @AcViewChild can find refs inside if blocks
    for (const [key, val] of Object.entries(subResult.idMap)) {
      idMap.set(key, val);
    }

    // Merge subResult.reactiveProperties
    for (const [prop, entries] of Object.entries(subResult.reactiveProperties)) {
      if (!reactiveProperties[prop]) {
        reactiveProperties[prop] = [];
      }
      for (const entry of entries) {
        const alreadyExists = reactiveProperties[prop].some(
          existing => existing.targetId === entry.targetId && existing.type === entry.type
        );
        if (!alreadyExists) {
          reactiveProperties[prop].push(entry);
        }
      }
    }

    const properties = Array.from(extractExpressionIdentifiers(acIf, localVars));
    const finalHtml = `<!--${placeholderId}-start--><!--${placeholderId}-end-->`;

    bindings.push({
      type: 'if',
      bindingId:this.generateHexId(),
      expression: acIf,
      targetId: placeholderId,
      template: subResult.html,
      childBindings: subResult.bindings,
      properties,
      rootIds: [],
    });

    this.addReactiveProperties({
      expression: acIf,
      targetId: placeholderId,
      type: 'if',
      reactiveProperties,
      localVars,
      targetElementHtml: finalHtml,
    });

    return finalHtml;
  }

  // ─── Special Element Handlers ──────────────────────────────────────────────

  /**
   * Process `<ac-template #refName>...</ac-template>`.
   *
   * Sub-compiles children into a binding with type 'template'.
   * No HTML placeholder is emitted — the runtime appends the
   * template content from the binding when required.
   */
  private processTemplateElement(
    el: Element,
    bindings: Binding[],
    idMap: Map<string, string>,
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    const id = `${this.generateHexId()}`;
    let refName: string | undefined;

    // Register all #ref attributes on this template element
    for (const attrName of Object.keys(el.attribs)) {
      if (attrName.startsWith('#')) {
        refName = attrName.slice(1);
        idMap.set(refName, id);
        idMap.set(refName.toLowerCase(), id);
      }
    }

    // Sub-compile children using the same caveman pattern as ac:if / ac:for
    const subCompiler = new TemplateCompiler();
    const subResult = subCompiler.compile(
      htmlparser2.DomUtils.getInnerHTML(el),
      localVars,
    );

    // Propagate idMap so @AcViewChild can find refs inside template blocks
    for (const [key, val] of Object.entries(subResult.idMap)) {
      idMap.set(key, val);
    }

    // Merge subResult.reactiveProperties
    for (const [prop, entries] of Object.entries(subResult.reactiveProperties)) {
      if (!reactiveProperties[prop]) {
        reactiveProperties[prop] = [];
      }
      for (const entry of entries) {
        const alreadyExists = reactiveProperties[prop].some(
          existing => existing.targetId === entry.targetId && existing.type === entry.type
        );
        if (!alreadyExists) {
          reactiveProperties[prop].push(entry);
        }
      }
    }

    bindings.push({
      type: 'template',
      bindingId: this.generateHexId(),
      expression: refName ?? id,
      targetId: id,
      template: subResult.html,
      childBindings: subResult.bindings,
      properties: [],
      rootIds: [],
    });

    // No HTML output — template content lives in the binding
    return '';
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
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    // const id = `${this.generateHexId()}`;
    const placeholderId = `ac-template-outlet-${this.generateHexId()}`;
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

    const properties = Array.from(extractExpressionIdentifiers(expression, localVars));
    if (contextExpression) {
      const contextProps = extractExpressionIdentifiers(contextExpression, localVars);
      for (const prop of contextProps) {
        if (!properties.includes(prop)) {
          properties.push(prop);
        }
      }
    }
    const finalHtml = `<!--${placeholderId}-start--><!--${placeholderId}-end-->`;

    bindings.push({
      type: 'template-outlet',
      bindingId:this.generateHexId(),
      expression,
      contextExpression,
      targetId: placeholderId,
      properties,
      rootIds: [],
    });

    this.addReactiveProperties({
      expression,
      targetId: placeholderId,
      type: 'bind',
      reactiveProperties,
      localVars,
      targetElementHtml: finalHtml,
    });
    if (contextExpression) {
      this.addReactiveProperties({
        expression: contextExpression,
        targetId: placeholderId,
        type: 'bind',
        reactiveProperties,
        localVars,
        targetElementHtml: finalHtml,
      });
    }

    return finalHtml;
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
    reactiveProperties: Record<string, ReactivePropertyDef[]>,
    localVars: Set<string>,
  ): string {
    const id = `${this.generateHexId()}`;
    let hasBinding = false;
    const pendingProperties: { expression: string; type: string }[] = [];

    const attribEntries = Object.entries(el.attribs);
    for (const [name, value] of attribEntries) {
      // ── Property binding: [prop]="expr" ──
      if (name.startsWith('[') && name.endsWith(']')) {
        const prop = name.slice(1, -1);
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        if (prop.startsWith('class.')) {
          bindings.push({ bindingId:this.generateHexId(),type: 'class', expression: value, target: prop.slice(6), targetId: id, properties, rootIds: [] });
          pendingProperties.push({ expression: value, type: 'class' });
        } else if (prop.startsWith('style.')) {
          bindings.push({ bindingId:this.generateHexId(),type: 'style', expression: value, target: prop.slice(6), targetId: id, properties, rootIds: [] });
          pendingProperties.push({ expression: value, type: 'style' });
        } else {
          bindings.push({ bindingId:this.generateHexId(),type: 'property', expression: value, target: prop, targetId: id, properties, rootIds: [] });
          pendingProperties.push({ expression: value, type: 'bind' });
        }
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Event binding: (event)="expr" ──
      else if (name.startsWith('(') && name.endsWith(')')) {
        const prop = name.slice(1, -1);
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        bindings.push({ bindingId:this.generateHexId(),type: 'event', expression: value, target: name.slice(1, -1), targetId: id, properties, rootIds: [] });
        pendingProperties.push({ expression: value, type: 'event' });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Class toggle: ac:class:name="expr" ──
      else if (name.startsWith('ac:class:')) {
        const prop = name.slice(9);
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        bindings.push({ bindingId:this.generateHexId(),type: 'class', expression: value, target: name.slice(9), targetId: id, properties, rootIds: [] });
        pendingProperties.push({ expression: value, type: 'class' });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Style binding: ac:style:prop="expr" ──
      else if (name.startsWith('ac:style:')) {
        const prop = name.slice(9);
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        bindings.push({ bindingId:this.generateHexId(),type: 'style', expression: value, target: name.slice(9), targetId: id, properties, rootIds: [] });
        pendingProperties.push({ expression: value, type: 'style' });
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
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        bindings.push({ bindingId:this.generateHexId(),type: 'model', expression: value, target: `${prop}:${event}`, targetId: id, properties, rootIds: [] });
        pendingProperties.push({ expression: value, type: 'model' });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Attribute binding: ac:bind:attr="expr" ──
      else if (name.startsWith('ac:bind:')) {
        const prop = name.slice(8);
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        bindings.push({ bindingId:this.generateHexId(),type: 'attribute', expression: value, target: name.slice(8), targetId: id, properties, rootIds: [] });
        pendingProperties.push({ expression: value, type: 'bind' });
        hasBinding = true;
        delete el.attribs[name];
      }
      // ── Template outlet: ac:template:outlet="expr" ──
      else if (name === 'ac:template:outlet') {
        const properties = Array.from(extractExpressionIdentifiers(value, localVars));
        bindings.push({ bindingId:this.generateHexId(),type: 'template-outlet', expression: value, targetId: id, properties, rootIds: [] });
        pendingProperties.push({ expression: value, type: 'bind' });
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
    const childrenHtml = this.processNodes(el.children, bindings, idMap, reactiveProperties, localVars);

    // Serialize the element back to HTML
    const attrs = Object.entries(el.attribs).map(([n, v]) => `${n}="${v}"`).join(' ');
    const openTag = `<${el.tagName}${attrs ? ' ' + attrs : ''}>`;

    // Void elements (br, img, input, etc.) must not have closing tags
    let finalHtml = '';
    if (VOID_ELEMENTS.has(el.tagName)) {
      finalHtml = openTag;
    } else {
      finalHtml = `${openTag}${childrenHtml}</${el.tagName}>`;
    }

    // Register reactive properties now that finalHtml is built
    for (const pending of pendingProperties) {
      this.addReactiveProperties({
        expression: pending.expression,
        targetId: id,
        type: pending.type,
        reactiveProperties,
        localVars,
        targetElementHtml: finalHtml
      });
    }

    return finalHtml;
  }

  /** Serialize an element node back to an HTML string. */
  private elementToHtml(el: Element): string {
    return htmlparser2.DomUtils.getOuterHTML(el);
  }
}
