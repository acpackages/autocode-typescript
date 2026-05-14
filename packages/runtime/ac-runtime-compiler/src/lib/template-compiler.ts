import * as htmlparser2 from 'htmlparser2';
import { DomHandler, Element, Node, Text, isTag } from 'domhandler';

export interface Binding {
  type: 'text' | 'property' | 'event' | 'if' | 'for' | 'class' | 'model' | 'style' | 'attribute';
  expression: string;
  target?: string;
  targetId: string;
  template?: string;
  childBindings?: Binding[];
  itemVar?: string;
  rootIds: string[];
}

export class TemplateCompiler {
  private nextId = 0;
  private bindings: Binding[] = [];
  private idMap = new Map<string, string>();

  compile(template: string) {
    this.nextId = 0;
    this.bindings = [];
    this.idMap = new Map<string, string>();

    const handler = new DomHandler();
    const parser = new htmlparser2.Parser(handler);
    parser.write(template);
    parser.end();

    const processedHtml = this.processNodes(handler.dom);

    return {
      html: processedHtml,
      bindings: this.bindings,
      idMap: Object.fromEntries(this.idMap)
    };
  }

  private processNodes(nodes: Node[]): string {
    let html = '';
    nodes.forEach(node => {
      html += this.processNode(node);
    });
    return html;
  }

  private processNode(node: Node): string {
    if (node instanceof Text) {
      return this.processTextNode(node);
    } else if (isTag(node)) {
      return this.processElementNode(node);
    }
    return '';
  }

  private processTextNode(node: Text): string {
    const text = node.data;
    if (!text.includes('{{')) {
      return text;
    }

    const id = `ac-t-${this.nextId++}`;
    const expression = '`' + text.replace(/\{\{(.+?)\}\}/g, '${$1}') + '`';
    
    // We need a wrapper for text bindings if they are mixed with other text or roots
    // But for now, let's just use a span with the ID
    this.bindings.push({
      type: 'text',
      expression,
      targetId: id,
      rootIds: []
    });

    return `<span ac-id="${id}"></span>`;
  }

  private processElementNode(el: Element): string {
    const isContainer = el.tagName === 'ac-container';
    
    // Handle ac:for
    const acFor = el.attribs['ac:for'];
    if (acFor) {
        delete el.attribs['ac:for'];
        let [itemPart, listExpr] = acFor.split(' of ').map(s => s.trim());
        const itemVar = itemPart.replace(/^(let|const|var)\s+/, '');
        const placeholderId = `ac-for-${this.nextId++}`;
        
        const subCompiler = new TemplateCompiler();
        const subResult = subCompiler.compile(isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el));
        
        this.bindings.push({
            type: 'for',
            expression: listExpr,
            itemVar: itemVar,
            targetId: placeholderId,
            template: subResult.html,
            childBindings: subResult.bindings,
            rootIds: [] // Not used in this new strategy as we use innerHTML
        });
        return `<!--${placeholderId}-->`;
    }

    // Handle ac:if
    const acIf = el.attribs['ac:if'];
    if (acIf) {
        delete el.attribs['ac:if'];
        const placeholderId = `ac-if-${this.nextId++}`;
        const subCompiler = new TemplateCompiler();
        const subResult = subCompiler.compile(isContainer ? htmlparser2.DomUtils.getInnerHTML(el) : this.elementToHtml(el));
        this.bindings.push({
            type: 'if',
            expression: acIf,
            targetId: placeholderId,
            template: subResult.html,
            childBindings: subResult.bindings,
            rootIds: []
        });
        return `<!--${placeholderId}-->`;
    }

    if (isContainer) {
        return this.processNodes(el.children);
    }

    const id = `ac-${this.nextId++}`;
    let hasBinding = false;

    Object.entries(el.attribs).forEach(([name, value]) => {
      if (name.startsWith('[') && name.endsWith(']')) {
        const prop = name.slice(1, -1);
        this.bindings.push({ type: 'property', expression: value, target: prop, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('(') && name.endsWith(')')) {
        const event = name.slice(1, -1);
        this.bindings.push({ type: 'event', expression: value, target: event, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('ac:class:')) {
        const className = name.slice(9);
        this.bindings.push({ type: 'class', expression: value, target: className, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('ac:style:')) {
        const styleProp = name.slice(9);
        this.bindings.push({ type: 'style', expression: value, target: styleProp, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name === 'ac:model') {
        // Determine the correct property and event based on element type
        const isCheckbox = el.attribs['type'] === 'checkbox';
        const isRadio = el.attribs['type'] === 'radio';
        const isSelect = el.tagName === 'select';
        const prop = (isCheckbox || isRadio) ? 'checked' : 'value';
        const event = (isCheckbox || isRadio || isSelect) ? 'change' : 'input';
        this.bindings.push({ type: 'model', expression: value, target: `${prop}:${event}`, targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('ac:bind:')) {
        this.bindings.push({ type: 'attribute', expression: value, target: name.slice(8), targetId: id, rootIds: [] });
        hasBinding = true;
        delete el.attribs[name];
      } else if (name.startsWith('#')) {
          this.idMap.set(name.slice(1), id);
          hasBinding = true;
          delete el.attribs[name];
      }
    });

    if (hasBinding) {
        el.attribs['ac-id'] = id;
    }

    const childrenHtml = this.processNodes(el.children);
    const attrs = Object.entries(el.attribs).map(([n, v]) => `${n}="${v}"`).join(' ');
    
    return `<${el.tagName}${attrs ? ' ' + attrs : ''}>${childrenHtml}</${el.tagName}>`;
  }

  private elementToHtml(el: Element): string {
      return htmlparser2.DomUtils.getOuterHTML(el);
  }
}
