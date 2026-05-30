/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';
import { AcRuntimeElement } from './ac-runtime-element';
import { AcElementLoopRenderer } from './ac-element-loop-renderer';
export class AcElementRenderer {
  html!: string;
  context: any;
  parentRenderer?: AcElementRenderer;
  rootElement!: AcRuntimeElement;
  private currentBindingValues: any = {};
  private nodes: Node[] = [];
  private startComment?: string;
  private endComment?: string;
  childRenderers:Record<string,AcElementRenderer> = {};
  loopRenderers:Record<string,AcElementLoopRenderer> = {};
  isRoot?: boolean = false;
  protected targetId?:string = '';

  constructor({ targetId, html, rootElement, context, parentRenderer, startComment, endComment, isRoot = false }: { targetId?:string,html: string, rootElement: AcRuntimeElement, context: any, parentRenderer?: AcElementRenderer, startComment?: string; endComment?: string, isRoot?: boolean }) {
    this.rootElement = rootElement;
    this.context = context;
    this.parentRenderer = parentRenderer;
    this.html = html;
    this.startComment = startComment;
    this.endComment = endComment;
    this.isRoot = isRoot;
    this.targetId = targetId;
  }

  appendNodesBetweenComments({startComment,endComment,nodes,processNodes = true}:{
    startComment: string,
    endComment: string,
    nodes: Node[]
    processNodes?:boolean
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

    for (const node of nodes) {
      parent.insertBefore(node, endCommentEl);
    }
    if(processNodes){
      const childRefs = this.getRefTargetIdsFromNodes(nodes);
      this.assignViewChildrenRefs({targetIds:childRefs.all})
      this.resolveTemplateOutlets({ targetIds:childRefs.all });
      this.executeChangeListener({targetIds:childRefs.all, force:true});
      this.executeEventCallbackRegister({targetIds:childRefs.all});
    }
  }

  private assignViewChildrenRefs({
    targetId,
    targetIds
  }: {
    targetId?: string;
    targetIds?: string[];
  }):void{
    const refIds:string[] = Object.values(this.rootElement.instanceViewChildren);
    const executeAssigner = async (targetKey: string) => {
      try {
        if(refIds.includes(targetKey)){
          for (const propKey of Object.keys(this.rootElement.instanceViewChildren)) {
            if(this.rootElement.instanceViewChildren[propKey] == targetKey){
              const el = this.rootElement.querySelector(`[ac-ref="${targetKey}"]`);
              if(el && (el as any).acRuntimeInstance){
                this.rootElement.acRuntimeInstance[propKey] = (el as any).acRuntimeInstance;
              }
              else{
                this.rootElement.acRuntimeInstance[propKey] = el;
              }
            }
          }
        }
      }
      catch (ex) {
        console.error(ex);
        console.log(targetId, targetIds, this);
        console.trace();
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

  clearElement({element}:{element:Element}){
    for(let el of Array.from(element.children)){
      if(el){
        this.clearElement({element:el});
        (el as any) = null;
      }
    }
  }

  createChildRenderer({ targetId,html, startComment, endComment, context,rootElement }: { targetId:string,html: string, startComment?: string, endComment?: string, context: any,rootElement?:AcRuntimeElement }) {
    if(rootElement == undefined){
      rootElement = this.rootElement;
    }
    const childRenderer = new AcElementRenderer({ targetId,rootElement, context: context, html, startComment, endComment });
    this.childRenderers[targetId] = childRenderer;
    childRenderer.render();
  }

  destroyChildRenderer(targetId: string): void {
    console.log(`[AcElementRenderer] destroyChildRenderer: targetId=${targetId}`);
    const childRenderer = this.childRenderers[targetId];
    if (childRenderer) {
      childRenderer.destroy();
      delete this.childRenderers[targetId];
    }
  }

  removeChildRenderer(targetId: string, startComment: string, endComment: string): void {
    console.log(`[AcElementRenderer] removeChildRenderer: targetId=${targetId}, start=${startComment}, end=${endComment}`);
    this.destroyChildRenderer(targetId);
    this.removeNodesBetweenComments({startComment, endComment});
  }

  getChildRenderer(targetId: string): AcElementRenderer | undefined {
    return this.childRenderers[targetId];
  }

  getChildRenderers(): Record<string, AcElementRenderer> {
    return this.childRenderers;
  }

  updateChildRendererContext(targetId: string, contextUpdates: any): void {
    console.log(`[AcElementRenderer] updateChildRendererContext: targetId=${targetId}`, contextUpdates);
    const childRenderer = this.childRenderers[targetId];
    if (childRenderer) {
      childRenderer.context = { ...childRenderer.context, ...contextUpdates };
      const refs = childRenderer.getRefTargetIdsFromNodes(childRenderer.nodes);
      childRenderer.executeChangeListener({ targetIds: refs.all, force: true });
    }
  }

  destroy(): void {
    console.log(`[AcElementRenderer] destroy`);
    for (const key of Object.keys(this.childRenderers)) {
      this.destroyChildRenderer(key);
    }
    // Clean up dynamic/loop change listeners registered by this renderer
    if (this.rootElement && this.rootElement.dynamicPropertyListeners) {
      for (const property of Object.keys(this.rootElement.dynamicPropertyListeners)) {
        for (const targetId of Object.keys(this.rootElement.dynamicPropertyListeners[property])) {
          for (const bindingId of Object.keys(this.rootElement.dynamicPropertyListeners[property][targetId])) {
            // Unregister if it belongs to this element/sub-renderers
            if (targetId.startsWith(this.startComment || '') || targetId === this.startComment) {

              this.rootElement.unregisterLoopChangeListener({ targetId, bindingId, property });
            }
          }
        }
      }
    }
    this.nodes = [];
    this.childRenderers = {};
  }

  createNodesFromHtml(html: string): Node[] {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return Array.from(template.content.childNodes);
  }

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
    const scope = this.getScope(locals);
    try {
      const normalizedExpr = this.normalizeExprForScope(expression);
      const fn = new Function(
        'scope',
        'context',
        `with (context) { with (scope) { return ${normalizedExpr} } }`
      );
      const result = fn.call(this.rootElement.acRuntimeInstance, scope, this.rootElement.acRuntimeInstance);
      // console.log("[AcRuntimeRenderer] Evaluating Expression",normalizedExpr,scope,this.context,result);
      return result;
    } catch (e) {
      console.error(`Error evaluating expression: ${expression} `, e);
      console.error(scope,this.context);
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
              if (oldValue != newValue || force || (newValue !== null && typeof newValue === 'object')) {
                  // console.log("[AcRuntimeRenderer] ", "Executing " + bindingKey);
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
        const el = this.queryElement(`[ac-ref="${targetKey}"]`);
        if(el?.hasAttribute('ac-el-has-inputs')){
          el.removeAttribute('ac-el-has-inputs');
          if((el as any).acRuntimeInstance){
            (el as any).notifyElementInit();
          }
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
      this.executeChildChangeListeners({targetIds});
    } else if (targetId) {
      await executeListener(targetId);
      this.executeChildChangeListeners({targetId});
    }
  }

  async executeChildChangeListeners({
    targetId,
    targetIds,
    bindingId,
    bindingIds,
  }:{
    targetId?: string;
    targetIds?: string[];
    bindingId?: string;
    bindingIds?: string[];
  }){
    for(const childRenderer of Object.values(this.childRenderers)){
      const res = childRenderer.getRefTargetIdsFromNodes(childRenderer.nodes);
    if(targetId){
      if(res.all.includes(targetId)){
        childRenderer.executeChangeListener({targetId,bindingId,bindingIds});
      }
    }
    else if(targetIds && targetIds.length > 0){
      const destIds:string[] = [];
      for(const t of targetIds){
        if(res.all.includes(t)){
          destIds.push(t);
        }
      }
      if(destIds.length > 0){
        childRenderer.executeChangeListener({targetIds:destIds,bindingId,bindingIds});
      }
    }
    }

  }

  async executeEventCallbackRegister({
    targetId,
    targetIds
  }: {
    targetId?: string;
    targetIds?: string[];
  }): Promise<void> {
    const executeListener = async (targetKey: string) => {
      try {
        const targetCallbacks = this.rootElement.eventCallbacks[targetKey];
        if (targetCallbacks) {
          for (const bindingKey of Object.keys(targetCallbacks)) {
            const callbackDef = targetCallbacks[bindingKey];
              callbackDef.callback({renderer:this});
          }
        }
        else {
          // console.log("[AcRuntimeRenderer] Skipping execution because target does not have change listeners", targetId, targetIds, bindingId, bindingIds, this);
        }
      }
      catch (ex) {
        console.error(ex);
        console.log(targetId, targetIds, this);
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

  protected getScope(locals?: Record<string, any>): any {
    const scope = Object.create(null);
    if (locals) {
      Object.assign(scope, locals);
    }
    if(this.context){
      Object.assign(scope, this.context);
    }
    for(const key of Object.keys(this.rootElement.templates)){
      scope[key] = this.rootElement.templates[key];
    }
    return scope;
    // if(this.isRoot){
    //   return scope;
    // }
    // else{
    //   return {...scope,...this.rootElement.acRuntimeInstance};
    // }
  }

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

  removeNodesBetweenComments({startComment,endComment}:{startComment: string,endComment: string}): void {
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
        if(commentText.includes('-start')){
          const identifier = commentText.replace('-start','');
          if(this.childRenderers[identifier] != undefined){
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
    this.nodes = this.createNodesFromHtml(this.html);
    const res = this.getRefTargetIdsFromNodes(this.nodes);
    if (this.startComment && this.endComment) {
      this.removeNodesBetweenComments({startComment:this.startComment, endComment:this.endComment});
      this.appendNodesBetweenComments({startComment:this.startComment,endComment: this.endComment,nodes: this.nodes,processNodes:false});
    }
    else {
      this.rootElement.innerHTML = ``;
      for (const node of this.nodes) {
        this.rootElement.appendChild(node);
      }
    }
    for (const key of res.all) {
      await this.assignViewChildrenRefs({ targetId:key });
      await this.resolveTemplateOutlets({ targetId:key });
      await this.executeChangeListener({ targetId: key });
      await this.executeEventCallbackRegister({ targetId: key });
    }
  }

  resolveTemplateOutlets({ targetId, targetIds }: { targetId?: string,targetIds?: string[] }){
    const executeOutlet = async (targetKey: string) => {
      const templateRenderer = (templateDef:any)=>{
        const startComment = `${targetKey}-start`;
        const endComment = `${targetKey}-end`;
        this.createChildRenderer({targetId:targetKey,html:templateDef.html,startComment:startComment,endComment:endComment,context:templateDef.rootElement.acRuntimeInstance,rootElement:templateDef.rootElement});
      };
      if(this.rootElement.templateOutlets[targetKey]){
        const templateOutlet = this.rootElement.templateOutlets[targetKey];
        const templateName = templateOutlet['template'];
        if(this.rootElement.templates[templateName]){
          // console.log("[AcElementRenderer] Rendering template for target : ",targetKey);
          templateRenderer(this.rootElement.templates[templateName]);
        }
        else if(this.rootElement.acRuntimeInstance[templateName]){
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
}
