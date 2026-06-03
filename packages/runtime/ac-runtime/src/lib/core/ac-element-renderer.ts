/* eslint-disable @typescript-eslint/no-inferrable-types */
import { start } from 'repl';
import { AcRuntimeElement } from './ac-runtime-element';
import { evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';
export class AcElementRenderer {
  context: any;
  parentRenderer?: AcElementRenderer;
  rootElement!: AcRuntimeElement;
  private rendererId: string = '';
  protected currentBindingValues: any = {};
  private nodes: Node[] = [];
  private startComment?: string;
  private endComment?: string;
  childRenderers: Record<string, AcElementRenderer> = {};
  isRoot?: boolean = false;
  protected targetId?: string = '';
  ownedTargetIds: string[] = [];
  childRendererClass?: any;
  protected rendererEndComment: string = '';
  protected rendererStartComment: string = '';

  // Loop properties
  private expression: string = '';
  private indexVar: string = '';
  private itemVar: string = '';
  private bindingId: string = '';
  private loopItemRendererMap: Record<string, number> = {};

  constructor({ targetId, rootElement, context, parentRenderer, startComment, endComment, isRoot = false, childRendererClass }: { targetId?: string, rootElement: AcRuntimeElement, context: any, parentRenderer?: AcElementRenderer, startComment?: string; endComment?: string, isRoot?: boolean, childRendererClass?: any }) {
    this.rendererId = rootElement.generateHexId();
    this.rendererStartComment = `<!--ac-renderer-${this.rendererId}-start-->`;
    this.rendererEndComment = `<!--ac-renderer-${this.rendererId}-end-->`;
    this.rootElement = rootElement;
    this.context = context;
    this.parentRenderer = parentRenderer;
    this.startComment = startComment;
    this.endComment = endComment;
    this.isRoot = isRoot;
    this.targetId = targetId;
    this.childRendererClass = childRendererClass;

  }

  appendArrayItems({ items, index = -1 }: { items: any[], index?: number }) {
    const startIdx = Number(index);
    let endComment = `${this.targetId}-end`;
    if (startIdx !== -1) {
      const targetItemId = Object.keys(this.loopItemRendererMap).find(
        key => this.loopItemRendererMap[key] === startIdx
      );
      if (targetItemId) {
        endComment = `${targetItemId}-start`;
      }
    }

    if (startIdx !== -1) {
      const shiftCount = items.length;
      const sortedKeys = Object.keys(this.loopItemRendererMap).sort(
        (a, b) => this.loopItemRendererMap[b] - this.loopItemRendererMap[a]
      );
      for (const key of sortedKeys) {
        const currIdx = this.loopItemRendererMap[key];
        if (currIdx >= startIdx) {
          const newIdx = currIdx + shiftCount;
          this.loopItemRendererMap[key] = newIdx;
          this.updateChildRendererContext(key, { [this.indexVar]: newIdx });
        }
      }
    }

    let i: number = startIdx !== -1 ? startIdx : Object.keys(this.loopItemRendererMap).length;
    for (const item of items) {
      const itemId: string = this.rootElement.generateHexId();
      const startCommentHtml = `${itemId}-start`;
      const endCommentHtml = `${itemId}-end`;
      this.appendNodesBetweenComments({
        startComment: `${this.targetId}-start`,
        endComment: endComment,
        nodes: this.createNodesFromHtml(`<!--${startCommentHtml}--><!--${endCommentHtml}-->`),
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
    console.log("Appending node before ", startComment, parent);

    if (!parent) {
      return;
    }

    for (const node of nodes) {
      parent.insertBefore(node, endCommentEl);
    }

    if (processNodes) {
      // const childRefs = this.getRefTargetIdsFromNodes(nodes);
      // this.assignViewChildrenRefs({ targetIds: childRefs.all })
      // this.resolveTemplateOutlets({ targetIds: childRefs.all });
      // this.executeChangeListener({ targetIds: childRefs.all, force: true });
    }
  }

  private assignViewChildrenRefsLegacy({
    targetId,
    targetIds
  }: {
    targetId?: string;
    targetIds?: string[];
  }): void {
    const refIds: string[] = Object.values(this.rootElement.instanceViewChildren);
    const executeAssigner = async (targetKey: string) => {
      try {
        if (refIds.includes(targetKey)) {
          for (const propKey of Object.keys(this.rootElement.instanceViewChildren)) {
            if (this.rootElement.instanceViewChildren[propKey] == targetKey) {
              const el = this.rootElement.querySelector(`[ac-ref="${targetKey}"]`);
              if (el && (el as any).acRuntimeInstance) {
                this.rootElement.acRuntimeInstance[propKey] = (el as any).acRuntimeInstance;
              }
              else {
                this.rootElement.acRuntimeInstance[propKey] = el;
              }
            }
          }
        }
      }
      catch (ex) {
        console.error(ex);
      }
    };
    if (targetIds) {
      for (const k of targetIds) {
        executeAssigner(k);
      }
    } else if (targetId) {
      executeAssigner(targetId);
    }
  }

  createChildRenderer({ targetId, startComment, endComment, context, rootElement, ownedTargetIds = [], childRendererClass }: { targetId: string, startComment?: string, endComment?: string, context: any, rootElement?: AcRuntimeElement, ownedTargetIds?: string[], childRendererClass?: any }) {
    if (rootElement == undefined) {
      rootElement = this.rootElement;
    }
    // const RendererClass = childRendererClass || this.childRendererClass || AcElementRenderer;
    const RendererClass = this.childRendererClass || AcElementRenderer;
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

  destroy(): void {
    for (const key of Object.keys(this.childRenderers)) {
      this.destroyChildRenderer(key);
    }
    this.nodes = [];
    this.childRenderers = {};
  }

  destroyChildRenderer(targetId: string): void {
    const childRenderer = this.childRenderers[targetId];
    if (childRenderer) {
      childRenderer.destroy();
      delete this.childRenderers[targetId];
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

  protected findCommentNew(commentText: string): Comment | null {
    const result = (
      this.nodes.find(
        (node) =>
          node.nodeType === Node.COMMENT_NODE &&
          node.nodeValue?.trim() === commentText
      ) as Comment | undefined
    ) ?? null;
    console.log("Getting comment : " + commentText, result, this);
    return result;
  }

  protected findComment(commentText: string): Comment | null {
    const walker = document.createTreeWalker(
      this.rootElement,
      NodeFilter.SHOW_COMMENT
    );

    let current = walker.nextNode();
    let childFound: boolean = this.startComment == undefined || this.isRoot == true;

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
        else {
          if (
            current.nodeType === Node.COMMENT_NODE &&
            current.nodeValue?.trim() === this.endComment
          ) {
            return null;
          }
        }
      }
      current = walker.nextNode();
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

  protected getRefTargetIdsFromNodes(roots: Node[]): {
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

  initLoop(
    { indexVar, itemVar, expression, items, bindingId }: { indexVar: string, itemVar: string, expression: string, items: any, bindingId: string }) {
    this.indexVar = indexVar;
    this.itemVar = itemVar;
    this.expression = expression;
    this.bindingId = bindingId;

    this.parentRenderer?.removeNodesBetweenComments({ startComment: `${this.targetId}-start`, endComment: `${this.targetId}-end` });
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
            const key = Object.keys(this.loopItemRendererMap).find(
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

  refreshLoop({ items }: { items: any[] }) {
    this.parentRenderer?.removeNodesBetweenComments({ startComment: `${this.targetId}-start`, endComment: `${this.targetId}-end` });
    this.childRenderers = {};
    this.loopItemRendererMap = {};
    this.appendArrayItems({ items });
  }

  registerElementEvents(){
    // Implemented via compiler
  }

  removeArrayItems({ items, index = 0 }: { items: any[], index?: number }) {
    const startIdx = Number(index);
    const deleteCount = items.length;
    const keysToDelete: string[] = [];
    for (let i = 0; i < deleteCount; i++) {
      const targetIdx = startIdx + i;
      const key = Object.keys(this.loopItemRendererMap).find(
        k => this.loopItemRendererMap[k] === targetIdx
      );
      if (key) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.removeChildRenderer(
        key,
        `${key}-start`,
        `${key}-end`
      );
      delete this.loopItemRendererMap[key];
    }

    const sortedKeys = Object.keys(this.loopItemRendererMap).sort(
      (a, b) => this.loopItemRendererMap[a] - this.loopItemRendererMap[b]
    );
    for (const key of sortedKeys) {
      const currIdx = this.loopItemRendererMap[key];
      if (currIdx >= startIdx + deleteCount) {
        const newIdx = currIdx - deleteCount;
        this.loopItemRendererMap[key] = newIdx;
        this.updateChildRendererContext(key, { [this.indexVar]: newIdx });
      }
    }
  }

  removeChildRenderer(targetId: string, startComment: string, endComment: string): void {
    const startCommentEl = this.findComment(startComment);
    const endCommentEl = this.findComment(endComment);
    this.destroyChildRenderer(targetId);
    this.removeNodesBetweenComments({ startComment, endComment });
    if (startCommentEl) startCommentEl.remove();
    if (endCommentEl) endCommentEl.remove();
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
          if (this.childRenderers[identifier] != undefined) {
            delete this.childRenderers[identifier];
          }
        }
      }
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


    this.registerElementEvents();
    this.setViewChildRefs();
    this.setInitialState();
    // for (const key of res.all) {
    //   if (this.ownedTargetIds.includes(key)) {
    //     await this.assignViewChildrenRefs({ targetId: key });
    //     await this.resolveTemplateOutlets({ targetId: key });
    //     await this.executeChangeListener({ targetId: key });
    //   }
    // }
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

  updateChildRendererContext(targetId: string, contextUpdates: any): void {
    const childRenderer = this.childRenderers[targetId];
    if (childRenderer) {
      childRenderer.context = { ...childRenderer.context, ...contextUpdates };
      const refs = childRenderer.getRefTargetIdsFromNodes(childRenderer.nodes);
      // childRenderer.executeChangeListener({ targetIds: refs.all, force: true });
    }
  }

}
