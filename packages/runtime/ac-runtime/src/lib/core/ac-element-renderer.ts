/* eslint-disable @typescript-eslint/no-inferrable-types */
/**
 * @module ac-element-base
 *
 * Shared base class for all AC Runtime generated Web Components.
 *
 * Previously, the {@link ComponentCompiler} inlined ~300 lines of shared
 * HTMLElement wrapper methods into every generated component file. This
 * base class extracts those shared methods so each generated component
 * only needs to provide its constructor (creating the inner class instance,
 * wiring bindings, registering property listeners) and a `render()` override.
 *
 * Generated components extend this class:
 * ```ts
 * class $$$MyComponent extends AcRuntimeElement {
 *   constructor() {
 *     super();
 *     this.acRuntimeInstance = new MyComponent();
 *     // ... bindings, viewChildren, property listeners ...
 *     (this.acRuntimeInstance as any).element = this;
 *   }
 *   protected async render() {
 *     this.innerHTML = `<div>...</div>`;
 *     // ... execute change listeners ...
 *   }
 * }
 * ```
 */
import { acPipeRegistry, evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';
import { AcRuntimeElement } from './ac-runtime-element';

/**
 * Base HTMLElement class for all AC Runtime compiled components.
 *
 * Provides shared lifecycle management, expression evaluation,
 * property change tracking, and DOM utility methods.
 */
export class AcElementRenderer {
  html!: string;
  context: any;
  parentRenderer?: AcElementRenderer;
  rootElement!: AcRuntimeElement;
  private currentBindingValues: any = {};
  private nodes: Node[] = [];
  private startComment?: string;
  private endComment?: string;
  isRoot?: boolean = false;

  // protected changeListeners: Record<string,{callback: any;binding: { expression: string; type: string };currentValue: any;}> = {};

  constructor({ html, rootElement, context, parentRenderer, startComment, endComment, isRoot = false }: { html: string, rootElement: AcRuntimeElement, context: any, parentRenderer?: AcElementRenderer, startComment?: string; endComment?: string, isRoot?: boolean }) {
    this.rootElement = rootElement;
    this.context = context;
    this.parentRenderer = parentRenderer;
    this.html = html;
    this.startComment = startComment;
    this.endComment = endComment;
    this.isRoot = isRoot;
  }

  /**
   * Insert DOM nodes between two named comment markers.
   */
  protected appendElementsBetweenComments(
    startCommentName: string,
    endCommentName: string,
    nodes: Node[]
  ): void {
    const startComment = this.findComment(startCommentName);
    const endComment = this.findComment(endCommentName);

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

  createChildRenderer({ html, startComment, endComment, context }: { html: string, startComment?: string, endComment?: string, context: any }) {
    const childRenderer = new AcElementRenderer({ rootElement: this.rootElement, context: context, html, startComment, endComment });
    childRenderer.render();
  }

  /**
   * Create DOM nodes from an HTML string using a `<template>` element.
   */
  createElementsFromHtml(html: string): Node[] {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return Array.from(template.content.childNodes);
  }

  /**
   * Evaluate a template expression string against the component instance.
   * Supports pipe expressions (e.g., `value | pipeName:arg`) and
   * plain JavaScript expressions.
   *
   * @param options.expression       - The expression string to evaluate
   * @param options.locals           - Optional local variables (e.g., from ac:for)
   * @param options.isExpressionEval - Internal flag to prevent recursive pipe parsing
   */
  protected evaluateExpression({
    expression,
    locals,
    isExpressionEval = false,
  }: {
    expression: string;
    locals?: Record<string, any>;
    isExpressionEval?: boolean;
  }): any {
    if (expression.includes('|') && !isExpressionEval) {
      const context = { ...this.context };
      return evaluateAcPipeExpression({
        expression,
        context,
        evaluateFunction: ({
          expression,
          context,
        }: {
          expression: string;
          context: any;
        }) => {
          return this.evaluateExpression({
            expression,
            locals,
            isExpressionEval: true,
          });
        },
      });
    }
    try {
      const scope = this.getScope(locals);
      const normalizedExpr = this.normalizeExprForScope(expression);
      const fn = new Function(
        'scope',
        'context',
        `with (context) { with (scope) { return ${normalizedExpr} } }`
      );
      const result = fn.call(this.context, scope, this.context);
      if (expression == 'showSidebar') {
        console.log("[AcRuntimeRenderer] Evaluating Expression", expression, this.context['isHostSet'], this.context['showSetHost']);
      }
      // console.log("[AcRuntimeRenderer] Evaluating Expression",normalizedExpr,scope,this.context,result);
      return result;
    } catch (e) {
      console.error(`Error evaluating expression: ${expression} `, e);
      return undefined;
    }
  }

  async executeChangeListener({
    targetId,
    targetIds,
    bindingId,
    bindingIds,
    force = false,
  }: {
    targetId?: string;
    targetIds?: string[];
    bindingId?: string;
    bindingIds?: string[];
    force?: boolean;
  }): Promise<void> {
    const executeListener = async (targetKey: string) => {
      try {
        const targetCallbacks = this.rootElement.changeListeners[targetKey];
        if (targetCallbacks) {
          for (const bindingKey of Object.keys(targetCallbacks)) {
            let continueExecution: boolean = true;
            if (bindingId != undefined || bindingIds != undefined) {
              continueExecution = false;
              if (bindingId) {
                continueExecution = bindingKey == bindingId;
              }
              else if (bindingIds) {
                continueExecution = bindingIds.includes(bindingKey);
              }
            }
            if (continueExecution) {
              // console.log("[AcRuntimeRenderer] ",targetCallbacks,bindingKey);
              // console.dir("[AcRuntimeRenderer] ",this.rootElement);
              const callbackDef = targetCallbacks[bindingKey];
              const newValue = await this.evaluateExpression({
                expression: callbackDef.binding.expression,
              });
              const oldValue = this.currentBindingValues[bindingKey];

              // console.log("[AcRuntimeRenderer] ",targetCallbacks,bindingKey);
              // console.log("[AcRuntimeRenderer] ",callbackDef.binding.expression,newValue,oldValue);
              if (oldValue != newValue || force) {
                if (callbackDef.binding.expression == 'showSidebar') {
                  console.log("[AcRuntimeRenderer] ", "Executing " + bindingKey);
                }
                this.currentBindingValues[bindingKey] = newValue;
                callbackDef.callback({ oldValue, newValue, renderer: this });
              }
            }
            else {
              // console.log("[AcRuntimeRenderer] Skipping execution because binding key(s) does not match", targetId, targetIds, bindingId, bindingIds, this);
            }
          }
        }
        else {
          // console.log("[AcRuntimeRenderer] Skipping execution because target does not have change listeners", targetId, targetIds, bindingId, bindingIds, this);
        }
      }
      catch (ex) {
        console.error(ex);
        console.log(targetId, targetIds, bindingId, bindingIds, force, this);
        console.trace();
      }
    };
    if (targetIds) {
      for (const k of targetIds) {
        await executeListener(k);
      }
    } else if (targetId) {
      await executeListener(targetId);
    }
  }

  /**
   * Find a comment node within this element's subtree by its text content.
   */
  protected findComment(commentText: string): Comment | null {
    const walker = document.createTreeWalker(
      this.rootElement,
      NodeFilter.SHOW_COMMENT
    );

    let current = walker.nextNode();
    let childFound: boolean = this.startComment == undefined;

    while (current) {
      if (!childFound) {
        if (
          current.nodeType === Node.COMMENT_NODE &&
          current.nodeValue?.trim() === this.startComment
        ) {
          childFound = true;
        }
      }
      if (childFound) {
        if (
          current.nodeType === Node.COMMENT_NODE &&
          current.nodeValue?.trim() === commentText
        ) {
          return current as Comment;
        }
      }


      current = walker.nextNode();
    }

    return null;
  }

  /**
   * Get all sibling nodes between two comment markers (exclusive).
   */
  protected getElementsBetweenComments(
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

  /**
   * Scan DOM subtrees for `ac-ref` attributes, `ac-if` comment markers,
   * and `ac-for` comment markers, returning all discovered target IDs.
   */
  protected getRefTargetIdsFromNodes(roots: Node[]): {
    refs: string[];
    ifs: string[];
    fors: string[];
    all: string[];
  } {
    const refs = new Set<string>();
    const ifs = new Set<string>();
    const fors = new Set<string>();

    for (const root of roots) {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT
      );

      let current: Node | null = walker.currentNode;

      while (current) {
        // ac-ref attributes
        if (current.nodeType === Node.ELEMENT_NODE) {
          const ref = (current as Element).getAttribute('ac-ref');

          if (ref) {
            refs.add(ref.trim());
          }
        }

        // ac-if / ac-for comments
        else if (current.nodeType === Node.COMMENT_NODE) {
          let comment = (current as Comment).data.trim();

          comment = comment
            .replace(/-start$/, '')
            .replace(/-end$/, '')
            .trim();

          if (comment.startsWith('ac-if')) {
            const value = comment.trim();

            if (value) {
              ifs.add(value);
            }
          } else if (comment.startsWith('ac-for')) {
            const value = comment.trim();

            if (value) {
              fors.add(value);
            }
          }
        }

        current = walker.nextNode();
      }
    }

    return {
      refs: [...refs],
      ifs: [...ifs],
      fors: [...fors],
      all: [...refs, ...ifs, ...fors],
    };
  }

  /**
   * Build the evaluation scope for expression evaluation.
   * Currently returns the component instance directly.
   */
  protected getScope(locals?: Record<string, any>): any {
    // return this.context;

    const scope = Object.create(null);
    if (locals) {
      Object.assign(scope, locals);
    }

    return scope;
  }

  async render() {
    this.nodes = this.createElementsFromHtml(this.html);
    const res = this.getRefTargetIdsFromNodes(this.nodes);
    if (this.startComment && this.endComment) {
      this.removeElementsBetweenCommentsByName(this.startComment, this.endComment);
      this.appendElementsBetweenComments(this.startComment, this.endComment, this.nodes);
    }
    else {
      this.rootElement.innerHTML = ``;
      for (const node of this.nodes) {
        this.rootElement.appendChild(node);
      }
    }
    for (const key of res.all) {
      await this.executeChangeListener({ targetId: key });
    }
  }

  /**
   * Normalize an expression for scope-based evaluation.
   * Rewrites known scope names (template refs, etc.) to their
   * lowercase equivalents for case-insensitive matching.
   */
  protected normalizeExprForScope(expression: string): string {
    const knownNames = new Set<string>();

    if (knownNames.size === 0) return expression;

    const sorted = Array.from(knownNames).sort(
      (a, b) => b.length - a.length
    );
    const escaped = sorted.map((n) =>
      n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = escaped.join('|');
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    let result = '';
    let i = 0;
    let inString: string | null = null;
    let buffer = '';

    while (i < expression.length) {
      const char = expression[i];

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
          result += buffer;
          buffer = '';
          inString = null;
        }

        i++;
        continue;
      }

      // Enter string
      if (char === '"' || char === "'" || char === '`') {
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
        result += buffer;
      } else {
        result += buffer.replace(regex, (match) => match.toLowerCase());
      }
    }

    return result;
  }

  queryElement(query: string): Element | null {
    if (this.startComment && this.endComment) {
      for (const node of this.nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          if (element.matches(query)) {
            return element;
          }

          const child = element.querySelector(query);

          if (child) {
            return child;
          }
        }
      }

      return null;
    }

    return this.rootElement.querySelector(query);
  }

  /**
   * Remove all DOM nodes between two named comment markers.
   */
  protected removeElementsBetweenCommentsByName(
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

}
