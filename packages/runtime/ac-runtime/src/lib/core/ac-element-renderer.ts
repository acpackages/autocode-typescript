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
  nodes: Node[] = [];
  private startComment?: string;
  private endComment?: string;
  childRenderers: Record<string, AcElementRenderer> = {};
  isRoot?: boolean = false;
  protected targetId?: string = '';
  ownedTargetIds: string[] = [];
  childRendererClass?: any;
  protected rendererEndComment: string = '';
  protected rendererStartComment: string = '';



  private subscriptions: (() => void)[] = [];

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

  destroy(): void {
    for (const key of Object.keys(this.childRenderers)) {
      this.destroyChildRenderer(key);
    }
    this.nodes = [];
    this.childRenderers = {};
    for (const unsub of this.subscriptions) {
      unsub();
    }
    this.subscriptions = [];
  }

  protected subscribe(path: string, callback: () => void): void {
    const unsub = this.rootElement.subscribePath(path, callback);
    this.subscriptions.push(unsub);
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

    this.resolveTemplateOutlets();
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



}
