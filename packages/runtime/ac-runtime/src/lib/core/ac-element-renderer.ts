/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcRuntimeElement } from './ac-runtime-element';
import { evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';
export class AcElementRenderer {
  context: any;
  parentRenderer?: AcElementRenderer;
  rootElement!: AcRuntimeElement;
  private rendererId: string = '';
  protected currentBindingValues: any = {};
  nodes: Node[] = [];
  private startComment?: string;
  private endComment?: string;
  rendererStartCommentText: string = '';
  rendererEndCommentText: string = '';
  childRenderers: Record<string, AcElementRenderer> = {};
  isRendered?: boolean = false;
  isRoot?: boolean = false;
  protected targetId?: string = '';
  ownedTargetIds: string[] = [];
  childRendererClass?: any;
  private subscriptions: (() => void)[] = [];
  commentCache: Map<string, Comment> = new Map();

  constructor({ targetId, rootElement, context, parentRenderer, startComment, endComment, isRoot = false, childRendererClass }: { targetId?: string, rootElement: AcRuntimeElement, context: any, parentRenderer?: AcElementRenderer, startComment?: string; endComment?: string, isRoot?: boolean, childRendererClass?: any }) {
    this.rendererId = rootElement.generateHexId();
    this.rendererStartCommentText = `ac-renderer-${this.rendererId}-start`;
    this.rendererEndCommentText = `ac-renderer-${this.rendererId}-end`;
    this.rootElement = rootElement;
    this.context = context;
    this.parentRenderer = parentRenderer;
    this.startComment = startComment;
    this.endComment = endComment;
    this.isRoot = isRoot;
    this.targetId = targetId;
    this.childRendererClass = childRendererClass;
  }

  appendNodesBetweenComments({ startComment, endComment, nodes, processNodes = true }: {
    startComment: string,
    endComment: string,
    nodes: Node[]
    processNodes?: boolean,
  }
  ): void {
    const startCommentEl = this.findComment(startComment);
    const endCommentEl = this.findComment(endComment);

    if (!startCommentEl || !endCommentEl) {
      return;
    }
    const parent = startCommentEl.parentNode;

    if (!parent) {
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      parent.insertBefore(nodes[i], endCommentEl);
    }
  }

  createChildRenderer({ targetId, startComment, endComment, context, rootElement, ownedTargetIds = [], childRendererClass }: { targetId: string, startComment?: string, endComment?: string, context: any, rootElement?: AcRuntimeElement, ownedTargetIds?: string[], childRendererClass?: any }) {
    if (rootElement == undefined) {
      rootElement = this.rootElement;
    }
    const RendererClass = childRendererClass || this.childRendererClass || AcElementRenderer;
    // const RendererClass = this.childRendererClass || AcElementRenderer;
    const childRenderer = new RendererClass({ targetId, rootElement, context: context, parentRenderer: this, startComment, endComment });
    childRenderer.ownedTargetIds = ownedTargetIds;
    this.childRenderers[targetId] = childRenderer;
    childRenderer.render();
  }

  createRendererNodes(): void {
    // Implemented via compiler
  }

  createNodesFromHtml(html: string): Node[] {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return Array.from(template.content.childNodes);
  }

  protected destroyNestedElements(node: Node): void {
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (typeof (el as any).destroy === 'function') {
        (el as any).destroy();
      } else {
        const nested = el.querySelectorAll?.('[ac-runtime-element]');
        if (nested) {
          nested.forEach((child: any) => {
            if (typeof child.destroy === 'function') {
              child.destroy();
            }
          });
        }
      }
    }
  }

  updateContext(contextUpdates: any): void {
    this.context = { ...this.context, ...contextUpdates };
    for (const key of Object.keys(this.childRenderers)) {
      this.childRenderers[key].updateContext(contextUpdates);
    }
  }

  destroy(): void {
    for (const key of Object.keys(this.childRenderers)) {
      this.destroyChildRenderer(key);
    }
    this.childRenderers = {};

    if (this.startComment && this.endComment && this.parentRenderer) {
      this.parentRenderer.removeNodesBetweenComments({ startComment: this.startComment, endComment: this.endComment });
    } else if (this.rendererStartCommentText && this.rendererEndCommentText) {
      this.removeNodesBetweenComments({ startComment: this.rendererStartCommentText, endComment: this.rendererEndCommentText });
    }

    for (const node of this.nodes) {
      this.destroyNestedElements(node);
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    this.nodes = [];

    this.commentCache.clear();
    for (const unsub of this.subscriptions) {
      unsub();
    }
    this.subscriptions = [];
  }

  protected subscribe(path: string, callback: () => void): void {
    const unsub = this.rootElement.subscribePath(path, callback);
    this.subscriptions.push(unsub);
  }

  protected subscribeArrayItem(path: string, callback: () => void): void {
    let resolvedKey = path;
    let currentRenderer: AcElementRenderer | undefined = this;
    while (currentRenderer) {
      if (currentRenderer.parentRenderer && currentRenderer.parentRenderer instanceof AcElementArrayRenderer) {
        const arrayRenderer = currentRenderer.parentRenderer as AcElementArrayRenderer;
        if (arrayRenderer.indexVar && arrayRenderer.itemVar && arrayRenderer.expression) {
          const idx = currentRenderer.context ? currentRenderer.context[arrayRenderer.indexVar] : undefined;
          if (idx !== undefined) {
            resolvedKey = resolvedKey.replaceAll(`${arrayRenderer.itemVar}.`, `${arrayRenderer.expression}.${idx}.`);
          }
        }
      }
      currentRenderer = currentRenderer.parentRenderer;
    }
    if (resolvedKey) {
      this.subscribe(resolvedKey, callback);
    }
  }

  destroyChildRenderer(targetId: string): void {
    const childRenderer = this.childRenderers[targetId];
    if (childRenderer) {
      delete this.childRenderers[targetId];
      childRenderer.destroy();
    }
  }

  async executeChangeListener({ targetId,bindingIds, force = false, isFirst = false}: { targetId?: string;bindingIds?:string[], force?: boolean;isFirst?: boolean }): Promise<void> {
    // Implemented via compiler
  }

  protected evaluateExpression({
    expression,
    context,
    isExpressionEval = false,
  }: {
    expression: string;
    context?: Record<string, any>;
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
            context,
            isExpressionEval: true,
          });
        },
      });
    }
    try {
      const fn = new Function(
        'scope',
        'context',
        `with (context) { with (scope) { return ${expression} } }`
      );
      const result = fn.call(this.rootElement.acRuntimeInstance, context, this.rootElement.acRuntimeInstance);
      // console.log("[AcRuntimeRenderer] Evaluating Expression",normalizedExpr,scope,this.context,result);
      return result;
    } catch (e) {
      console.error(this);
      console.error(`Error evaluating expression: ${expression} `, e);
      console.error(context, this.context);
      return undefined;
    }
  }

  protected findComment(commentText: string): Comment | null {
    const cached = this.commentCache.get(commentText);
    if (cached && cached.isConnected) {
      return cached;
    }

    // 1. If searching for this renderer's own boundary comments (startComment or endComment),
    // and this renderer has a parentRenderer, delegate to parentRenderer because boundary
    // comments were defined in parentRenderer's scope.
    if ((commentText === this.startComment || commentText === this.endComment) && this.parentRenderer) {
      const comment = this.parentRenderer.findComment(commentText);
      if (comment) {
        this.commentCache.set(commentText, comment);
        return comment;
      }
    }

    // 2. If this renderer has its own nodes, search within this.nodes first (prevents cross-contamination across loop items)
    if (this.nodes && this.nodes.length > 0) {
      for (let i = 0; i < this.nodes.length; i++) {
        const rootNode = this.nodes[i];
        if (rootNode.nodeType === Node.COMMENT_NODE && (rootNode as Comment).nodeValue?.trim() === commentText) {
          this.commentCache.set(commentText, rootNode as Comment);
          return rootNode as Comment;
        }
        if (rootNode.nodeType === Node.ELEMENT_NODE || rootNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_COMMENT);
          let current = walker.nextNode();
          while (current) {
            if (current.nodeType === Node.COMMENT_NODE) {
              const val = (current as Comment).nodeValue?.trim();
              if (val) {
                this.commentCache.set(val, current as Comment);
                if (val === commentText) {
                  return current as Comment;
                }
              }
            }
            current = walker.nextNode();
          }
        }
      }
    }

    // 3. If this renderer is delimited by startComment and endComment, search strictly between them
    if (this.startComment && this.endComment) {
      const startEl = this.findComment(this.startComment);
      const endEl = this.findComment(this.endComment);
      if (startEl && endEl && startEl.parentNode) {
        let current: Node | null = startEl.nextSibling;
        while (current && current !== endEl) {
          if (current.nodeType === Node.COMMENT_NODE) {
            const val = (current as Comment).nodeValue?.trim();
            if (val) {
              this.commentCache.set(val, current as Comment);
              if (val === commentText) {
                return current as Comment;
              }
            }
          }
          if (current.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(current, NodeFilter.SHOW_COMMENT);
            let child = walker.nextNode();
            while (child) {
              const val = (child as Comment).nodeValue?.trim();
              if (val) {
                this.commentCache.set(val, child as Comment);
                if (val === commentText) {
                  return child as Comment;
                }
              }
              child = walker.nextNode();
            }
          }
          current = current.nextSibling;
        }
      }
    }

    // 4. If not found and parentRenderer exists, delegate to parentRenderer
    if (this.parentRenderer) {
      const comment = this.parentRenderer.findComment(commentText);
      if (comment) {
        this.commentCache.set(commentText, comment);
        return comment;
      }
    }

    // 5. Fallback: search within rootElement if isRoot or no parentRenderer
    if (this.isRoot || !this.parentRenderer) {
      const walker = document.createTreeWalker(
        this.rootElement,
        NodeFilter.SHOW_COMMENT
      );
      let current = walker.nextNode();
      while (current) {
        if (current.nodeType === Node.COMMENT_NODE) {
          const val = (current as Comment).nodeValue?.trim();
          if (val) {
            this.commentCache.set(val, current as Comment);
            if (val === commentText) {
              return current as Comment;
            }
          }
        }
        current = walker.nextNode();
      }
    }

    return null;
  }

  getChildRenderer(targetId: string): AcElementRenderer | undefined {
    return this.childRenderers[targetId];
  }

  getChildRenderers(): Record<string, AcElementRenderer> {
    return this.childRenderers;
  }

  protected getNodesBetweenComments(
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

  getRefTargetIdsFromNodes(roots: Node[]): {
    refs: string[];
    ifs: string[];
    fors: string[];
    templateOutlets: string[];
    all: string[];
  } {
    const refs = new Set<string>();
    const ifs = new Set<string>();
    const fors = new Set<string>();
    const templateOutlets = new Set<string>();

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
          else if (comment.startsWith('ac-template-outlet')) {
            const value = comment.trim();

            if (value) {
              templateOutlets.add(value);
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
      templateOutlets: [...templateOutlets],
      all: [...refs, ...ifs, ...fors, ...templateOutlets],
    };
  }

  queryElement(query: string): Element | null {
    if (this.startComment && this.endComment) {
      const startEl = this.findComment(this.startComment);
      const endEl = this.findComment(this.endComment);
      if (startEl && endEl) {
        const liveNodes = this.getNodesBetweenComments(startEl, endEl);
        for (const node of liveNodes) {
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
      }

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

  registerElementEvents(){
    // Implemented via compiler
  }

  removeNodesBetweenComments({ startComment, endComment }: { startComment: string, endComment: string }): void {
    const startCommentEl = this.findComment(startComment);
    const endCommentEl = this.findComment(endComment);

    if (!startCommentEl || !endCommentEl) {
      return;
    }

    let current = startCommentEl.nextSibling;

    while (current && current !== endCommentEl) {
      const next = current.nextSibling;
      if (current && current.nodeType === Node.COMMENT_NODE) {
        const commentText = (current as Comment).data.trim();
        if (commentText.includes('-start')) {
          const identifier = commentText.replace('-start', '');
          this.destroyChildRenderer(identifier);
        }
      }
      this.destroyNestedElements(current);
      current.remove();
      current = null;
      current = next;
    }
  }

  async render() {
    this.createRendererNodes();
    if (this.startComment && this.endComment && this.parentRenderer) {
      this.parentRenderer.removeNodesBetweenComments({ startComment: this.startComment, endComment: this.endComment });
      this.parentRenderer.appendNodesBetweenComments({ startComment: this.startComment, endComment: this.endComment, nodes: this.nodes, processNodes: false });
    }
    else {
      this.rootElement.innerHTML = ``;
      this.rootElement.append(...this.nodes);
    }
    this.isRendered = true;
    this.resolveTemplateOutlets();
    this.registerElementEvents();
    this.setViewChildRefs();
    this.setInitialState();
  }

  resolveTemplateOutlets(){
    // Implemented via compiler
  }

  resolveTemplateOutletsLegacy({ targetId, targetIds }: { targetId?: string, targetIds?: string[] }) {
    const executeOutlet = async (targetKey: string) => {
      const templateRenderer = (templateDef: any) => {
        const startComment = `${targetKey}-start`;
        const endComment = `${targetKey}-end`;
        this.createChildRenderer({ targetId: targetKey, startComment: startComment, endComment: endComment, context: templateDef.rootElement.acRuntimeInstance, rootElement: templateDef.rootElement, ownedTargetIds: templateDef.ownedTargetIds });
      };
      if (this.rootElement.templateOutlets[targetKey]) {
        const templateOutlet = this.rootElement.templateOutlets[targetKey];
        const templateName = templateOutlet['template'];
        if (this.rootElement.templates[templateName]) {
          templateRenderer(this.rootElement.templates[templateName]);
        }
        else if (this.rootElement.acRuntimeInstance[templateName]) {
          templateRenderer(this.rootElement.acRuntimeInstance[templateName]);
        }
      }
    };
    if (targetIds) {
      for (const k of targetIds) {
        executeOutlet(k);
      }
    } else if (targetId) {
      executeOutlet(targetId);
    }
  }

  setInitialState(){
    // Implemented via compiler
  }

  setViewChildRefs(){
    // Implemented via compiler
  }

  triggerUpdate(force = true) {
    // this.executeChangeListener({ targetIds: this.ownedTargetIds, force });
  }

}


export class AcElementArrayRenderer extends AcElementRenderer {
  expression: string = '';
  indexVar: string = '';
  itemVar: string = '';
  private bindingId: string = '';
  private loopItemRendererMap: Record<string, number> = {};
  private loopItemOrder: string[] = [];

  appendArrayItems({ items, index = -1 }: { items: any[], index?: number }) {
    const startIdx = Number(index);
    let endComment = `${this.targetId}-end`;
    if (startIdx !== -1 && startIdx < this.loopItemOrder.length) {
      const targetItemId = this.loopItemOrder[startIdx];
      if (targetItemId) {
        endComment = `${targetItemId}-start`;
      }
    }

    if (startIdx !== -1) {
      const shiftCount = items.length;
      for (let idx = this.loopItemOrder.length - 1; idx >= startIdx; idx--) {
        const key = this.loopItemOrder[idx];
        const newIdx = idx + shiftCount;
        this.loopItemRendererMap[key] = newIdx;
        this.updateChildRendererContext(key, { [this.indexVar]: newIdx });
      }
    }

    let i: number = startIdx !== -1 ? startIdx : this.loopItemOrder.length;
    const newKeys: string[] = [];
    for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
      const item = items[itemIdx];
      const itemId: string = this.rootElement.generateHexId();
      newKeys.push(itemId);
      const startCommentHtml = `${itemId}-start`;
      const endCommentHtml = `${itemId}-end`;
      this.appendNodesBetweenComments({
        startComment: `${this.targetId}-start`,
        endComment: endComment,
        nodes: [document.createComment(startCommentHtml), document.createComment(endCommentHtml)],
        processNodes: false
      });
      const context: any = {
        ...this.context
      };
      context[this.itemVar] = item;
      context[this.indexVar] = i;
      this.createChildRenderer({
        targetId: `${itemId}`,
        startComment: startCommentHtml,
        endComment: endCommentHtml,
        context,
        rootElement: this.parentRenderer?.rootElement,
        ownedTargetIds: this.ownedTargetIds
      });
      this.loopItemRendererMap[itemId] = i;
      i++;
    }

    if (startIdx !== -1) {
      this.loopItemOrder.splice(startIdx, 0, ...newKeys);
    } else {
      for (let k = 0; k < newKeys.length; k++) {
        this.loopItemOrder.push(newKeys[k]);
      }
    }
  }

  initLoop(
    { indexVar, itemVar, expression, items, bindingId }: { indexVar: string, itemVar: string, expression: string, items: any, bindingId: string }) {
    this.indexVar = indexVar;
    this.itemVar = itemVar;
    this.expression = expression;
    this.bindingId = bindingId;

    this.parentRenderer?.removeNodesBetweenComments({ startComment: `${this.targetId}-start`, endComment: `${this.targetId}-end` });
    this.commentCache.clear();
    this.appendArrayItems({ items });
    this.rootElement.subscribeArrayPropertyChangeListeners({
      bindingId: this.bindingId, property: this.expression, callback: (args: any) => {
        if (args.type === 'arrayInsert') {
          const { index, items } = args.newValue;
          this.appendArrayItems({ items, index });
        }
        else if (args.type === 'arrayReplace') {
          this.refreshLoop({ items: args.newValue });
        }
        else if (args.type === 'arrayDelete') {
          const { index, items } = args.oldValue;
          this.removeArrayItems({ items, index });
        }
        else if (args.type === 'arrayUpdate') {
          let targetIndex = args.index;
          let newItem = undefined;
          if (args.newValue && typeof args.newValue === 'object' && 'items' in args.newValue && 'index' in args.newValue) {
            targetIndex = args.newValue.index;
            if (Array.isArray(args.newValue.items) && args.newValue.items.length > 0) {
              newItem = args.newValue.items[0];
            }
          }
          if (targetIndex !== undefined) {
            const key = this.loopItemOrder[targetIndex] || Object.keys(this.loopItemRendererMap).find(
              k => this.loopItemRendererMap[k] === targetIndex
            );
            if (key) {
              const childRenderer = this.childRenderers[key];
              if (childRenderer) {
                if (newItem !== undefined) {
                  this.updateChildRendererContext(key, { [this.itemVar]: newItem });
                } else {
                  childRenderer.triggerUpdate();
                }
              }
            }
          }
        }
        else if (args.type === 'arraySplice') {
          this.removeArrayItems({ items: args.oldValue.items, index: args.oldValue.index });
          this.appendArrayItems({ items: args.newValue.items, index: args.newValue.index });
        }
        else if (args.type === 'arraySort') {
          this.refreshLoop({ items: args.newValue });
        }
        else if (args.type === 'arrayReverse') {
          this.refreshLoop({ items: args.newValue });
        }
        else if (args.type === 'arrayFill') {
          this.refreshLoop({ items: args.newValue });
        }
        else if (args.type === 'arrayCopyWithin') {
          this.refreshLoop({ items: args.newValue });
        }
      }
    });
  }

  override destroy(): void {
    if (this.expression && this.bindingId && this.rootElement) {
      this.rootElement.unsubscribeArrayPropertyChangeListeners({
        property: this.expression,
        bindingId: this.bindingId
      });
    }
    super.destroy();
    this.loopItemRendererMap = {};
    this.loopItemOrder = [];
  }

  override updateContext(contextUpdates: any): void {
    this.context = { ...this.context, ...contextUpdates };
    for (const key of Object.keys(this.childRenderers)) {
      this.childRenderers[key].updateContext(contextUpdates);
    }
  }

  refreshLoop({ items, context }: { items: any[]; context?: any }) {
    if (context) {
      this.context = { ...this.context, ...context };
    }
    for (const key of Object.keys(this.childRenderers)) {
      this.destroyChildRenderer(key);
    }
    this.parentRenderer?.removeNodesBetweenComments({ startComment: `${this.targetId}-start`, endComment: `${this.targetId}-end` });
    this.childRenderers = {};
    this.loopItemRendererMap = {};
    this.loopItemOrder = [];
    this.commentCache.clear();
    this.appendArrayItems({ items });
  }

  removeArrayItems({ items, index = 0 }: { items: any[], index?: number }) {
    const startIdx = Number(index);
    const deleteCount = items.length;
    const keysToDelete: string[] = this.loopItemOrder.splice(startIdx, deleteCount);
    if (keysToDelete.length === 0) {
      for (let i = 0; i < deleteCount; i++) {
        const targetIdx = startIdx + i;
        const key = Object.keys(this.loopItemRendererMap).find(
          k => this.loopItemRendererMap[k] === targetIdx
        );
        if (key) keysToDelete.push(key);
      }
    }

    for (let k = 0; k < keysToDelete.length; k++) {
      const key = keysToDelete[k];
      this.removeChildRenderer(
        key,
        `${key}-start`,
        `${key}-end`
      );
      delete this.loopItemRendererMap[key];
    }

    for (let idx = startIdx; idx < this.loopItemOrder.length; idx++) {
      const key = this.loopItemOrder[idx];
      this.loopItemRendererMap[key] = idx;
      this.updateChildRendererContext(key, { [this.indexVar]: idx });
    }
  }

  removeChildRenderer(targetId: string, startComment: string, endComment: string): void {
    const startCommentEl = this.findComment(startComment);
    const endCommentEl = this.findComment(endComment);
    this.destroyChildRenderer(targetId);
    this.removeNodesBetweenComments({ startComment, endComment });
    this.commentCache.delete(startComment);
    this.commentCache.delete(endComment);
    if (startCommentEl) startCommentEl.remove();
    if (endCommentEl) endCommentEl.remove();
  }

  updateChildRendererContext(targetId: string, contextUpdates: any): void {
    const childRenderer = this.childRenderers[targetId];
    if (childRenderer) {
      childRenderer.updateContext(contextUpdates);
    }
  }
}
