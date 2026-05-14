/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-useless-escape */
import { evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';
import { AC_RUNTIME_CONFIG } from '../consts/ac-runtime-config.const';
import { getAcInputMetadata } from '../decorators/ac-input.decorator';
import { AcElementManager } from './../core/ac-element-manager';
import { getAcOutputMetadata } from '../decorators/ac-output.decorator';
import { acElementRegistry } from '../core/ac-element-registry';
import { clearElement, createElementFromHtml } from '../utils/functions';
import { AcDelayedCallback, acNullifyInstanceProperties } from '@autocode-ts/autocode';
import { IAcTemplateDef } from '../interfaces/ac-template-def.interface';
import { acEffect, AcEffect } from '../reactivity/ac-effect';
import { acMakeReactive } from '../reactivity/ac-reactivity';
import { AC_RUNTIME_INTERNAL_KEYS } from '../consts/ac-runtime_internal_keys.const';

export class AcElementRenderer {
  templates = new Map<string, IAcTemplateDef>();
  private references = new Map<string, any>();
  private effects = new Set<AcEffect>();
  private parent?: AcElementRenderer;
  private context: any;
  private elementManager?: AcElementManager;

  constructor({ context, parentEngine, elementManager }: { context: any, parentEngine?: AcElementRenderer, elementManager?: AcElementManager }) {
    this.context = context;
    this.parent = parentEngine;
    this.elementManager = elementManager;
  }

  private applyAttributesToInstance(instance: any, el: HTMLElement, registration?: any) {
    const attrs = Array.from(el.attributes);
    const inputMetadata = registration ? getAcInputMetadata(registration.constructor) : {};

    for (const attr of attrs) {
      try {
        const attrName = attr.name;
        let attrValue = attr.value;

        if (attrName.startsWith('ac:') || (attrName.startsWith('(') && attrName.endsWith(')')) || attrName.startsWith('#')) {
          continue;
        }

        let propName = attrName;
        let isBound = false;

        if (attrName.startsWith('[') && attrName.endsWith(']')) {
          propName = attrName.slice(1, -1);
          isBound = true;
        }
        else {
          for (const [_, alias] of Object.entries(inputMetadata)) {
            if (alias.toLowerCase() === propName.toLowerCase()) {
              if (!attrName.startsWith('[') && !attrName.endsWith(']')) {
                attrValue = `'${attrValue.replaceAll("'", "/'")}'`;
              }
              isBound = true;
              break;
            }
          }
        }
        let targetProp: string | undefined;

        if (registration) {
          for (const [key, alias] of Object.entries(inputMetadata)) {
            if (alias.toLowerCase() === propName.toLowerCase()) {
              targetProp = key;
              break;
            }
          }
        }

        if (!targetProp) {
          targetProp = this.findCorrectPropertyCasing(instance, propName);
        }

        if (targetProp) {
          if (isBound) {
            let oldValue: any;
            let isFirstChange = true;
            this.effect(() => {
              try {
                const valOrPromise = this.evaluateExpression(attrValue);
                const updateInstance = (newValue: any) => {
                  // trigger only when old and new value changes
                  if (!isFirstChange && this.isEquivalent(oldValue, newValue)) {
                    return;
                  }

                  const currentOldValue = isFirstChange ? undefined : oldValue;
                  const currentIsFirstChange = isFirstChange;

                  // Update state BEFORE side effects
                  oldValue = newValue;
                  isFirstChange = false;

                  instance[targetProp!] = newValue;
                  if (typeof instance.acOnChange === 'function') {
                    instance.acOnChange({
                      key: targetProp,
                      oldValue: currentOldValue,
                      newValue: newValue,
                      firstChange: currentIsFirstChange
                    });
                  }
                };

                if (valOrPromise instanceof Promise) {
                  valOrPromise.then(updateInstance);
                } else {
                  updateInstance(valOrPromise);
                }
              } catch (e) {
                AC_RUNTIME_CONFIG.logError(`Error in reactive input binding [${propName}] for ${el.tagName}:`, e);
              }
            });
          } else {
            // instance[targetProp] = attrValue;
          }
        }
      } catch (e) {
        AC_RUNTIME_CONFIG.logError(`Error mapping attribute ${attr.name} to instance:`, e);
      }
    }
  }

  private applyReferenceToInstance(instance: any, el: HTMLElement, refValue: any) {
    if (!instance || !instance.constructor) return;

    const managerInstance: AcElementManager = instance[AC_RUNTIME_INTERNAL_KEYS.managerInstance];
    if (!managerInstance) return;
    const viewChildMetadata = managerInstance.viewChildMetadata;
    if (viewChildMetadata.length === 0) return;

    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      if (attr.name.startsWith('#')) {
        const refName = attr.name.slice(1).toLowerCase();


        // Match case-insensitively against @AcViewChild metadata
        for (const metaData of viewChildMetadata) {
          const propertyKey = metaData.propertyKey;
          const referenceKey = metaData.propertyKey;
          const targetRef = referenceKey.startsWith('#') ? referenceKey.slice(1).toLowerCase() : referenceKey.toLowerCase();
          if (refName === targetRef) {
            instance[propertyKey] = (el as any).acInstance || refValue;
          }
        }
      }
    }
  }

  cleanupRemovedElement(element: HTMLElement) {
    if (element.hasAttribute(AC_RUNTIME_INTERNAL_KEYS.elementRefAttribute)) {
      const refName: string = element.getAttribute(AC_RUNTIME_INTERNAL_KEYS.elementRefAttribute)!;
      // console.log("Removing reference ",refName);
      for (const metaData of this.elementManager!.viewChildMetadata) {
        // console.log(metaData);
        if (metaData.referenceKey.toLowerCase() == refName) {
          // this.de
          // this.elementManager!.instance[metaData.propertyKey] = undefined;
          // console.log("Destroying property",metaData.propertyKey);
          // if ((element as any)[AC_RUNTIME_INTERNAL_KEYS.managerInstance] != undefined) {
          //   const manager = (element as any)[AC_RUNTIME_INTERNAL_KEYS.managerInstance];
          //   console.log(this.elementManager?.instance[metaData.propertyKey], manager.instance);
          //   if (this.elementManager?.instance[metaData.propertyKey] == manager.instance) {
          //     this.elementManager!.instance[metaData.propertyKey] = undefined;
          //   }
          // }
          // else {
          //   console.log("Removing element",metaData.propertyKey);
          //   if (this.elementManager?.instance[metaData.propertyKey] == element) {
          //     this.elementManager!.instance[metaData.propertyKey] = undefined;
          //   }
          // }
        }
      }
    }
  }

  public compile(element: HTMLElement | DocumentFragment) {
    this.findAndRegisterTemplates(element);
    this.traverse(element);
  }

  private createFragmentFromContainer(el: HTMLElement): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const clone = el.cloneNode(true) as HTMLElement;
    while (clone.firstChild) fragment.appendChild(clone.firstChild);
    return fragment;
  }

  destroy() {
    for (const e of this.effects) {
      e.destroy();
    }
    acNullifyInstanceProperties({ instance: this });
  }

  private detectAndInstantiateCustomElement(el: HTMLElement): boolean {
    const tagName = el.tagName.toLowerCase();
    let registration = acElementRegistry.getByTagName(tagName);

    if (!registration) {
      for (const attr of Array.from(el.attributes)) {
        const attrRegistration = acElementRegistry.getByAttribute(attr.name);
        if (attrRegistration) {
          registration = attrRegistration;
          break;
        }
      }
    }

    if (!registration) return false;

    // Prevent self-instantiation if this element is already the host for the current context
    if (this.context && this.context.element === el) {
      return false;
    }

    const outputs: Record<string, string> = {};
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
        outputs[attr.name.slice(1, -1).toLowerCase()] = attr.value;
        el.removeAttribute(attr.name);
      }
    }

    const ElementClass = registration.constructor;
    let instance = (el as any).acInstance;

    if (!instance) {
      const elementManager: AcElementManager = new AcElementManager({ instance: new ElementClass(), element: el, parentEngine: this, elementDef: registration });

      instance = elementManager.instance;
      this.applyAttributesToInstance(instance, el, registration);

      const outputMetadata = getAcOutputMetadata(ElementClass);
      const registeredOutputNames = new Set(Object.values(outputMetadata).map(o => o.toLowerCase()));

      for (const [propKey, outputName] of Object.entries(outputMetadata)) {
        try {
          const handler = outputs[outputName.toLowerCase()];
          if (handler) {
            const eventEmitter = instance[propKey];
            if (eventEmitter && typeof eventEmitter.subscribe === 'function') {
              eventEmitter.subscribe((value: any) => {
                try {
                  const resOrPromise = this.evaluateExpression(handler, { '$event': value });
                  if (resOrPromise instanceof Promise) {
                    resOrPromise.catch(e => {
                      AC_RUNTIME_CONFIG.logError(`Error in async output handler for (${outputName}) on ${tagName}:`, e);
                    });
                  }
                } catch (e) {
                  AC_RUNTIME_CONFIG.logError(`Error in output handler for (${outputName}) on ${tagName}:`, e);
                }
              });
            }
          }
        } catch (e) {
          AC_RUNTIME_CONFIG.logError(`Error setting up output (${outputName}) on ${tagName}:`, e);
        }
      }

      // Bind any remaining events in outputs that are not @AcOutputs as native DOM events
      for (const [eventName, handler] of Object.entries(outputs)) {
        if (!registeredOutputNames.has(eventName)) {
          el.addEventListener(eventName, (event) => {
            try {
              const resOrPromise = this.evaluateExpression(handler, { '$event': event });
              if (resOrPromise instanceof Promise) {
                resOrPromise.catch(e => {
                  AC_RUNTIME_CONFIG.logError(`Error in async native event handler (${eventName}) on ${tagName}:`, e);
                });
              }
            } catch (e) {
              AC_RUNTIME_CONFIG.logError(`Error in native event handler (${eventName}) on ${tagName}:`, e);
            }
          });
        }
      }


      this.registerContentTemplates(el, instance);

      elementManager.bootstrap();
    }

    // Apply References (Selective & Template Scope)
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('#')) {
        const refName = attr.name.slice(1).toLowerCase();
        this.references.set(refName, instance);
      }
    }

    this.applyReferenceToInstance(this.context, el, instance);
    return true;
  }

  private effect(fn: () => void | (() => void)): AcEffect {
    const e = acEffect(fn);
    this.effects.add(e);
    return e;
  }

  private evaluateExpression(exp: string, locals?: Record<string, any>, isExpressionEval: boolean = false): any {
    if (exp.includes('|') && !isExpressionEval) {
      const context = { ...this.context };
      return evaluateAcPipeExpression({
        expression: exp, context, evaluateFunction: ({ expression, context, }: { expression: string; context: any; }) => {
          return this.evaluateExpression(expression, locals, true);
        }
      });
    }
    try {
      const scope = this.getScope(locals);
      const normalizedExpr = this.normalizeExprForScope(exp);
      const fn = new Function('scope', 'context', `with (context) { with (scope) { return ${normalizedExpr} } } `);
      const result = fn.call(this.context, scope, this.context);

      return result;
    } catch (e) {
      AC_RUNTIME_CONFIG.logError(`Error evaluating expression: ${exp} `, e);
      return undefined;
    }
  }

  private findAndRegisterTemplates(root: HTMLElement | DocumentFragment) {
    root.querySelectorAll('ac-template').forEach(el => {
      let parent = el.parentElement;
      let isOwned = true;
      while (parent && parent !== root) {
        if (acElementRegistry.getByTagName(parent.tagName)) {
          isOwned = false;
          break;
        }
        parent = parent.parentElement;
      }
      if (isOwned) {
        this.handleTemplateDefinition(el as HTMLElement);
      }
    });
  }

  private findCorrectPropertyCasing(instance: any, lowerProp: string): string | undefined {
    const lower = lowerProp.toLowerCase();
    let curr = instance;
    while (curr) {
      const props = Object.getOwnPropertyNames(curr);
      const found = props.find(p => p.toLowerCase() === lower);
      if (found) return found;
      curr = Object.getPrototypeOf(curr);
    }
    return undefined;
  }

  private getScope(locals?: Record<string, any>): any {
    const scope = Object.create(null);
    if (locals) {
      Object.assign(scope, locals);
    }

    // Collect engine hierarchy from root to this
    const engines: AcElementRenderer[] = [];
    let curr: AcElementRenderer | undefined = this;
    while (curr) {
      engines.unshift(curr);
      curr = curr.parent;
    }

    // Merge templates and references into scope (local shadows parent)
    for (const engine of engines) {
      engine.templates.forEach((tpl, name) => {
        scope[name] = tpl;
      });
      engine.references.forEach((ref, name) => {
        scope[name] = ref;
      });
    }

    return scope;
  }

  private handleContainer(el: HTMLElement) {
    const parent = el.parentNode;
    if (!parent) return;
    const acIf = el.getAttribute('ac:if');
    const acFor = el.getAttribute('ac:for');
    if (acIf !== null || acFor !== null) {
      if (acIf !== null) this.handleIfDirective(el, acIf);
      else if (acFor !== null) this.handleForDirective(el, acFor);
      return;
    }
    const fragment = document.createDocumentFragment();
    while (el.firstChild) fragment.appendChild(el.firstChild);
    const placeholder = document.createComment('ac-container');
    (el as any)._acPlaceholder = placeholder;
    parent.replaceChild(placeholder, el);
    Array.from(fragment.childNodes).forEach(child => this.traverse(child));
    parent.insertBefore(fragment, placeholder);
  }

  private handleForDirective(el: HTMLElement, expression: string) {
    // Split on semicolons to separate the main `let item of list` from extra variable declarations
    const parts = expression.split(';').map(p => p.trim()).filter(p => p.length > 0);
    const mainPart = parts[0];
    const extraParts = parts.slice(1);

    const match = mainPart.match(/let\s+(\w+)\s+of\s+(.+)/);
    if (!match) return;

    const itemName = match[1];
    const listExpression = match[2].trim();

    // Parse extra variable declarations like `let index = index`, `let first = first`, etc.
    // Maps local variable name -> keyword ('index', 'first', 'last', 'even', 'odd', 'count')
    const extraVars: { localName: string; keyword: string }[] = [];
    for (const part of extraParts) {
      const varMatch = part.match(/let\s+(\w+)\s*=\s*(\w+)/);
      if (varMatch) {
        extraVars.push({ localName: varMatch[1], keyword: varMatch[2] });
      }
    }

    el.removeAttribute('ac:for');
    const elementHtml = el.outerHTML;
    const startPlaceholder = document.createComment(`ac:for-start ${expression}`);
    const endPlaceholder = document.createComment(`ac:for-end ${expression}`);
    el.parentNode?.replaceChild(endPlaceholder, el);
    endPlaceholder.parentNode?.insertBefore(startPlaceholder, endPlaceholder);
    clearElement(el);
    (el as any) = null;

    // Track rendered entries for incremental updates
    interface IAcForEntry { item: any; nodes: Node[]; subContext: any; renderer: AcElementRenderer }
    let renderedEntries: IAcForEntry[] = [];

    /** Set loop variables on a sub-context using Object.defineProperty to bypass proxy traps */
    const setLoopVars = (subContext: any, item: any, i: number, count: number) => {
      Object.defineProperty(subContext, itemName, { value: item, writable: true, enumerable: true, configurable: true });
      Object.defineProperty(subContext, '$index', { value: i, writable: true, enumerable: true, configurable: true });
      for (const { localName, keyword } of extraVars) {
        let varValue: any;
        switch (keyword) {
          case 'index': varValue = i; break;
          case 'first': varValue = i === 0; break;
          case 'last': varValue = i === count - 1; break;
          case 'even': varValue = i % 2 === 0; break;
          case 'odd': varValue = i % 2 !== 0; break;
          case 'count': varValue = count; break;
          default: varValue = undefined; break;
        }
        Object.defineProperty(subContext, localName, { value: varValue, writable: true, enumerable: true, configurable: true });
      }
    };

    /** Render a single item and return the entry */
    const renderItem = (item: any, i: number, count: number): IAcForEntry => {
      const instance = createElementFromHtml(elementHtml) as HTMLElement;
      const subContext = acMakeReactive(Object.create(this.context));
      setLoopVars(subContext, item, i, count);

      const renderer = new AcElementRenderer({ context: subContext, parentEngine: this });
      let nodes: Node[];

      if (instance.tagName.toLowerCase() === 'ac-container') {
        const fragment = this.createFragmentFromContainer(instance);
        renderer.compile(fragment as any);
        nodes = Array.from(fragment.childNodes);
      } else {
        renderer.compile(instance);
        nodes = [instance];
      }

      return { item, nodes, subContext, renderer };
    };

    /** Remove an entry's DOM nodes and destroy instances */
    const removeEntry = (entry: IAcForEntry) => {
      for (let node of entry.nodes as Element[]) {
        clearElement(node as any);
        node.remove();
        (node as any) = null;
      }
      entry.renderer.destroy();
    };

    this.effect(() => {
      const listOrPromise = this.evaluateExpression(listExpression);

      const renderFor = (list: any) => {
        if (!Array.isArray(list)) return;

        const parent = endPlaceholder.parentNode;
        if (!parent) return;

        const newCount = list.length;
        const oldCount = renderedEntries.length;

        // Fast path: items only appended (push) — keep existing, add new ones
        // Check if the first oldCount items are the same by reference
        let isAppendOnly = newCount >= oldCount;
        if (isAppendOnly) {
          for (let i = 0; i < oldCount; i++) {
            if (renderedEntries[i].item !== list[i]) {
              isAppendOnly = false;
              break;
            }
          }
        }

        if (isAppendOnly && oldCount > 0) {
          // Update index-related variables on existing entries if count changed
          if (newCount !== oldCount) {
            for (let i = 0; i < oldCount; i++) {
              const entry = renderedEntries[i];
              const sc = entry.subContext;
              // Update last/count which may have changed
              for (const { localName, keyword } of extraVars) {
                if (keyword === 'last' || keyword === 'count') {
                  const varValue = keyword === 'last' ? i === newCount - 1 : newCount;
                  sc[localName] = varValue;
                }
              }
            }
          }

          // Render only new items and batch-insert
          const fragment = document.createDocumentFragment();
          const newEntries: IAcForEntry[] = [];
          for (let i = oldCount; i < newCount; i++) {
            const entry = renderItem(list[i], i, newCount);
            for (const node of entry.nodes) {
              fragment.appendChild(node);
            }
            newEntries.push(entry);
          }
          parent.insertBefore(fragment, endPlaceholder);
          renderedEntries = [...renderedEntries, ...newEntries];
          return;
        }

        // Fast path: items removed from end (pop/truncate) — keep prefix, remove suffix
        let isTruncate = newCount < oldCount && newCount > 0;
        if (isTruncate) {
          for (let i = 0; i < newCount; i++) {
            if (renderedEntries[i].item !== list[i]) {
              isTruncate = false;
              break;
            }
          }
        }

        if (isTruncate) {
          // Remove entries beyond the new length
          for (let i = newCount; i < oldCount; i++) {
            removeEntry(renderedEntries[i]);
          }
          renderedEntries = renderedEntries.slice(0, newCount);

          // Update last/count on remaining entries
          for (let i = 0; i < newCount; i++) {
            const sc = renderedEntries[i].subContext;
            for (const { localName, keyword } of extraVars) {
              if (keyword === 'last' || keyword === 'count') {
                const varValue = keyword === 'last' ? i === newCount - 1 : newCount;
                sc[localName] = varValue;
              }
            }
          }
          return;
        }

        // Full rebuild — array was replaced or reordered
        for (const entry of renderedEntries) {
          removeEntry(entry);
        }
        renderedEntries = [];

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < newCount; i++) {
          const entry = renderItem(list[i], i, newCount);
          for (const node of entry.nodes) {
            fragment.appendChild(node);
          }
          renderedEntries.push(entry);
        }
        parent.insertBefore(fragment, endPlaceholder);
      };

      if (listOrPromise instanceof Promise) {
        listOrPromise.then(renderFor);
      } else {
        renderFor(listOrPromise);
      }
    });
  }

  private handleIfDirective(el: HTMLElement, expression: string) {
    const branchChain: { html: string; expression: string | null }[] = [];
    el.removeAttribute('ac:if');
    branchChain.push({ html: el.outerHTML, expression });

    let next = el.nextElementSibling as HTMLElement;
    while (next) {
      const elseIfExpr = next.getAttribute('ac:else:if');
      if (elseIfExpr !== null) {
        next.removeAttribute('ac:else:if');
        branchChain.push({ html: next.outerHTML, expression: elseIfExpr });
        const toRemove = next;
        next = next.nextElementSibling as HTMLElement;
        clearElement(toRemove);
        toRemove.remove();
        (toRemove as any) = null;
        continue;
      }
      if (next.hasAttribute('ac:else')) {
        next.removeAttribute('ac:else');
        branchChain.push({ html: next.outerHTML, expression: null });
        const toRemove = next;
        next = next.nextElementSibling as HTMLElement;
        clearElement(toRemove);
        toRemove.remove();
        (toRemove as any) = null;
        break;
      }
      break;
    }

    el.removeAttribute('ac:if');
    const startPlaceholder = el.ownerDocument.createComment('ac:if:start');
    const endPlaceholder = el.ownerDocument.createComment('ac:if:end');

    el.parentNode?.insertBefore(endPlaceholder, el);
    clearElement(el);
    el.remove();
    (el as any) = null;
    endPlaceholder.parentNode?.insertBefore(startPlaceholder, endPlaceholder);

    this.effect(() => {
      let current = startPlaceholder.nextSibling;
      while (current && current !== endPlaceholder) {
        const next = current.nextSibling;

        if (current instanceof HTMLElement) {
          clearElement(current);
          current.remove();
          (current as any) = null;
        }
        if (current) {
          if (current.parentNode) {
            clearElement(current as any);
            current.remove();
            (current as any) = null;
          }
        }

        current = next;
      }

      const renderBranches = async () => {
        for (const branch of branchChain) {
          const conditionOrPromise = branch.expression === null ? true : this.evaluateExpression(branch.expression);
          const condition = conditionOrPromise instanceof Promise ? await conditionOrPromise : conditionOrPromise;
          if (condition) {
            const clone = createElementFromHtml(branch.html) as HTMLElement;
            const parent = endPlaceholder.parentNode;
            if (parent) {
              if (clone.tagName.toLowerCase() === 'ac-container') {
                const fragment = this.createFragmentFromContainer(clone);
                const nodes = Array.from(fragment.childNodes);
                parent.insertBefore(fragment, endPlaceholder);
                nodes.forEach(node => this.traverse(node));
              } else {
                parent.insertBefore(clone, endPlaceholder);
                this.traverse(clone);
              }
            }
            break;
          }
        }
      };

      renderBranches();
      if (this.elementManager) {
        this.elementManager.resolveViewChild();
      }
    });
  }

  private handleTemplateDefinition(el: HTMLElement) {
    const refAttr = Array.from(el.attributes).find(attr => attr.name.startsWith('#'));
    if (refAttr) {
      const refName = refAttr.name.slice(1).toLowerCase();
      const template: IAcTemplateDef = {
        html: el.innerHTML,
        _acContext: this.context,
        _acEngine: this
      };
      this.templates.set(refName, template);
      if (this.context) {
        this.applyReferenceToInstance(this.context, el, template);
      }
    }
    el.remove();
    clearElement(el);
    (el as any) = null;
  }

  private isEquivalent(a: any, b: any): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (a[key] !== b[key]) return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Normalizes an expression by lowercasing identifiers that match known template
   * or reference names. This replaces the Proxy's case-insensitive has/get traps:
   * HTML lowercases attribute names (e.g., #rowTemplate → key 'rowtemplate'),
   * but expression values preserve casing (e.g., 'rowTemplate'). This method
   * ensures they match without needing a Proxy.
   */
  private normalizeExprForScope(expression: string): string {
    // Collect all known scope names (templates + references) from hierarchy
    const knownNames = new Set<string>();
    let engine: AcElementRenderer | undefined = this;

    while (engine) {
      engine.templates.forEach((_, name) => knownNames.add(name));
      engine.references.forEach((_, name) => knownNames.add(name));
      engine = engine.parent;
    }

    if (knownNames.size === 0) return expression;

    // Sort by length descending so longer names match first
    const sorted = Array.from(knownNames).sort((a, b) => b.length - a.length);
    const escaped = sorted.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = escaped.join('|');
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    let result = '';
    let i = 0;
    let inString: string | null = null; // ', ", or `
    let buffer = '';

    while (i < expression.length) {
      const char = expression[i];

      // Handle string start/end
      if (inString) {
        buffer += char;

        // Handle escape
        if (char === '\\') {
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
      if (char === '"' || char === "'" || char === '`') {
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

  private processElement(el: HTMLElement): boolean {
    // Skip processing if this is the host element of the current component
    // This prevents the component from incorrectly processing its own attributes
    // (like #ref placed by a parent) and overwriting its own properties.
    if (this.context && this.context.element === el) {
      return false;
    }

    const tagName = el.tagName.toLowerCase();

    // 1. Structural Directives
    const acIf = el.getAttribute('ac:if');
    if (acIf !== null) {
      this.handleIfDirective(el, acIf);
      return true;
    }

    const acFor = el.getAttribute('ac:for');
    if (acFor !== null) {
      this.handleForDirective(el, acFor);
      return true;
    }

    // 2. Identification and Ref Tracking
    const attrs = Array.from(el.attributes);
    attrs.forEach(attr => {
      if (attr.name.startsWith('#')) {
        const refName = attr.name.slice(1).toLowerCase();
        this.references.set(refName, el);
        el.setAttribute(AC_RUNTIME_INTERNAL_KEYS.elementRefAttribute, refName);
        (el as any)[AC_RUNTIME_INTERNAL_KEYS.rendererInstance] = this;
        if (this.parent) {
          this.parent.references.set(refName, el);
        }
      }
    });

    // 3. Early Tag-Specific Handling
    if (tagName === 'ac-template') {
      this.handleTemplateDefinition(el);
      return true;
    }

    if (tagName === 'ac-container') {
      this.handleContainer(el);
      // Do not return early; let attributes (like outlets) run on this element.
    }

    // 4. Directive, Model, Style, Class Binding
    let outletHandled = false;
    for (const attr of attrs) {
      const name = attr.name;
      const value = attr.value;

      try {
        if (name === 'ac:model') {
          const isCheckbox = (el as HTMLInputElement).type === 'checkbox';
          const isSelect = el.tagName === 'SELECT';

          this.effect(() => {
            const valOrPromise = this.evaluateExpression(value);
            const updateModel = (val: any) => {
              if (isCheckbox) (el as HTMLInputElement).checked = !!val;
              else if (isSelect) (el as HTMLSelectElement).value = val !== undefined ? val : '';
              else (el as HTMLInputElement).value = val !== undefined ? val : '';
            };

            if (valOrPromise instanceof Promise) {
              valOrPromise.then(updateModel);
            } else {
              updateModel(valOrPromise);
            }
          });

          const listenerFun = () => {
            const target = el as HTMLInputElement | HTMLSelectElement;
            const val = isCheckbox ? (target as HTMLInputElement).checked : target.value;
            this.setExpressionValue(value, val);
          };
          el.addEventListener('input', listenerFun);
          el.addEventListener('change', listenerFun);
          el.removeAttribute(name);
        }
        else if (name === 'ac:template:outlet' || name === 'ac:template-outlet' || name === '[acTemplateOutlet]' || name === '*ngTemplateOutlet' || name === '[ngTemplateOutlet]') {
          let currentActiveNodes: Node[] = [];
          this.effect(() => {
            // Cleanup old nodes
            if (currentActiveNodes.length > 0) {
              currentActiveNodes.forEach(node => {
                if (node instanceof HTMLElement) {
                  // this.destroyElement(node);
                }
                if (node.parentNode) {
                  node.parentNode.removeChild(node);
                }
              });
              currentActiveNodes = [];
            }

            let templateExpr = value;
            let contextExpr: string | null = null;
            if (value.includes(';')) {
              const parts = value.split(';').map(p => p.trim());
              templateExpr = parts[0];
              const contextPart = parts.find(p => p.startsWith('context:'));
              if (contextPart) contextExpr = contextPart.replace('context:', '').trim();
            }

            const renderTemplate = (template: any, extraContext?: any) => {
              if (template) {
                let html = '';
                let definitionContext = this.context;
                let definingEngine = this;

                if (template instanceof HTMLTemplateElement || (template instanceof HTMLElement && template.tagName.toLowerCase() === 'ac-template')) {
                  html = template.innerHTML;
                  definitionContext = (template as any)._acContext || this.context;
                  definingEngine = (template as any)._acEngine || this;
                } else if (typeof template === 'object' && template.html !== undefined) {
                  html = template.html;
                  definitionContext = template._acContext || this.context;
                  definingEngine = template._acEngine || this;
                } else if (typeof template === 'string') {
                  html = template;
                }

                if (html) {
                  const fragment = document.createRange().createContextualFragment(html);
                  const nodes = Array.from(fragment.childNodes);

                  const definitionContextToUse = definitionContext;
                  const definingEngineToUse = definingEngine;
                  let renderContext = definitionContextToUse;

                  if (extraContext) {
                    renderContext = Object.create(definitionContextToUse);
                    for (const [k, v] of Object.entries(extraContext)) {
                      Object.defineProperty(renderContext, k, { value: v, writable: true, enumerable: true, configurable: true });
                    }
                  }

                  const engine = new AcElementRenderer({ context: renderContext, parentEngine: this });
                  const placeholder = (el as any)._acPlaceholder;
                  if (placeholder && placeholder.parentNode) {
                    placeholder.parentNode.insertBefore(fragment, placeholder);
                    nodes.forEach(child => engine.traverse(child));
                  } else {
                    el.innerHTML = '';
                    el.appendChild(fragment);
                    nodes.forEach(child => engine.traverse(child));
                  }
                  currentActiveNodes = nodes;
                }
              }
            };

            const templateOrPromise = this.evaluateExpression(templateExpr);
            const contextOrPromise = contextExpr ? this.evaluateExpression(contextExpr) : undefined;

            if (templateOrPromise instanceof Promise || contextOrPromise instanceof Promise) {
              Promise.all([
                templateOrPromise instanceof Promise ? templateOrPromise : Promise.resolve(templateOrPromise),
                contextOrPromise instanceof Promise ? contextOrPromise : Promise.resolve(contextOrPromise)
              ]).then(([template, extraContext]) => {
                renderTemplate(template, extraContext);
              });
            } else {
              renderTemplate(templateOrPromise, contextOrPromise);
            }
          });
          el.removeAttribute(name);
          outletHandled = true;
        }
        else if (name.startsWith('ac:bind:')) {
          const attrToBind = name.replace('ac:bind:', '');
          this.effect(() => {
            const valOrPromise = this.evaluateExpression(value);
            const updateBind = (val: any) => {
              if (val === null || val === undefined) {
                el.removeAttribute(attrToBind);
                if (attrToBind in el) {
                  (el as any)[attrToBind] = (typeof (el as any)[attrToBind] === 'boolean') ? false : '';
                }
              } else {
                const stringValue = String(val);
                const escapedValue = stringValue.includes('"') ? stringValue.replace(/"/g, '\"') : stringValue;
                if (attrToBind == "disabled" || attrToBind == "readonly") {
                  if (stringValue == "false") {
                    (el as any)[attrToBind] = false;
                    el.removeAttribute(attrToBind);
                  }
                  else {
                    (el as any)[attrToBind] = true;
                    el.setAttribute(attrToBind, "true");
                  }
                }
                else {
                  if (attrToBind in el) {
                    (el as any)[attrToBind] = val;
                  }
                  if (attrToBind == 'innerhtml') {
                    el.innerHTML = stringValue;
                  }
                  else if (attrToBind == 'innertext') {
                    el.innerText = stringValue;
                  }
                  else {
                    el.setAttribute(attrToBind, escapedValue);
                  }
                }

              }
            };

            if (valOrPromise instanceof Promise) {
              valOrPromise.then(updateBind);
            } else {
              updateBind(valOrPromise);
            }
          });
          el.removeAttribute(name);
        }
        else if (name.startsWith('ac:class:')) {
          const className = name.split(':')[2];
          this.effect(() => {
            const valOrPromise = this.evaluateExpression(value);
            const updateClass = (val: any) => {
              if (val) {
                el.classList.add(className);
              }
              else {
                el.classList.remove(className);
              }
            };

            if (valOrPromise instanceof Promise) {
              valOrPromise.then(updateClass);
            } else {
              updateClass(valOrPromise);
            }
          });
          el.removeAttribute(name);
        }
      } catch (e) {
        AC_RUNTIME_CONFIG.logError(`Error processing attribute ${name} on ${el.tagName}:`, e);
      }
    }

    // 5. Custom Elements
    const customElement = this.detectAndInstantiateCustomElement(el);
    if (customElement) {
      return true;
    }

    // 6. ViewChild and Attribute Mapping
    this.applyReferenceToInstance(this.context, el, el);
    this.applyAttributesToInstance(el, el);

    // 7. Event Binding
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name;
      const value = attr.value;

      try {
        if (name.startsWith('(') && name.endsWith(')')) {
          const eventName = name.slice(1, -1);
          el.addEventListener(eventName, (event) => {
            try {
              const resOrPromise = this.evaluateExpression(value, { '$event': event });
              if (resOrPromise instanceof Promise) {
                resOrPromise.catch(e => {
                  AC_RUNTIME_CONFIG.logError(`Error in async event handler (${eventName}) on ${el.tagName}:`, e);
                });
              }
            } catch (e) {
              AC_RUNTIME_CONFIG.logError(`Error in event handler (${eventName}) on ${el.tagName}:`, e);
            }
          });
          el.removeAttribute(name);
        }
      } catch (e) {
        AC_RUNTIME_CONFIG.logError(`Error processing event ${name} on ${el.tagName}:`, e);
      }
    }

    // If it was a container or an outlet was handled, we prevent the default
    // recursive traversal of the element's children because we've already
    // handled them (either via handleContainer or by rendering the outlet).

    return (tagName === 'ac-container' || outletHandled);
  }

  private processTextNode(node: Text) {
    const originalText = node.textContent || '';
    const regex = /\{\{\s*(.*?)\s*\}\}/g;
    if (regex.test(originalText)) {
      this.effect(() => {
        let newText = originalText;
        let match;
        regex.lastIndex = 0;
        const replacements: { placeholder: string, value: any }[] = [];

        while ((match = regex.exec(originalText)) !== null) {
          const expression = match[1];
          const value = this.evaluateExpression(expression);
          replacements.push({ placeholder: match[0], value });
        }

        if (replacements.length === 0) return;

        // Handle async values if any
        const hasPromise = replacements.some(r => r.value instanceof Promise);
        if (hasPromise) {
          Promise.all(replacements.map(async r => ({
            placeholder: r.placeholder,
            value: r.value instanceof Promise ? await r.value : r.value
          }))).then(resolvedReplacements => {
            let updatedText = originalText;
            resolvedReplacements.forEach(r => {
              updatedText = updatedText.replace(r.placeholder, r.value !== undefined ? r.value : '');
            });
            node.textContent = updatedText;
          });
        } else {
          replacements.forEach(r => {
            newText = newText.replace(r.placeholder, r.value !== undefined ? r.value : '');
          });
          node.textContent = newText;
        }
      });
    }
  }

  private registerContentTemplates(el: HTMLElement, instance: any) {
    // Use direct children only to avoid stealing templates from nested components
    Array.from(el.children).filter(child => child.tagName.toLowerCase() === 'ac-template').forEach(tpl => {
      const refAttr = Array.from(tpl.attributes).find(attr => attr.name.startsWith('#'));
      if (refAttr) {
        const refName = refAttr.name.slice(1).toLowerCase();
        const template: IAcTemplateDef = {
          html: tpl.innerHTML,
          _acContext: this.context,
          _acEngine: this
        };
        instance[refName] = template;
      }
      tpl.remove();
    });
  }

  private setExpressionValue(expression: string, value: any) {
    try {
      const scope = this.getScope();
      const normalizedExpr = this.normalizeExprForScope(expression);

      const fn = new Function('scope', 'context', 'value', `with (context) { with (scope) { ${normalizedExpr} = value } } `);
      fn.call(this.context, scope, this.context, value);
    } catch (e) {
      AC_RUNTIME_CONFIG.logError(`Error setting expression value: ${expression} `, e);
    }
  }

  private traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      this.processTextNode(node as Text);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const skipChildren = this.processElement(el);
      if (!skipChildren) {
        Array.from(el.childNodes).forEach(child => this.traverse(child));
      }
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      Array.from(node.childNodes).forEach(child => this.traverse(child));
    }
  }
}
