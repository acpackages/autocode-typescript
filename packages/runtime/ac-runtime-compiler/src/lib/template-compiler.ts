import * as htmlparser2 from 'htmlparser2';
import { DomHandler, Element, Node, Text, isTag } from 'domhandler';

export interface Binding {
  type: 'text' | 'property' | 'event' | 'if' | 'for';
  expression: string;
  target?: string;
  targetId: string;
  template?: string;
  childBindings?: Binding[];
  itemVar?: string;
}

export class TemplateCompiler {
  private nextId = 0;
  private code: string[] = [];
  private bindings: Binding[] = [];
  private idMap = new Map<string, string>();

  compile(template: string) {
    this.nextId = 0;
    this.code = [];
    this.bindings = [];
    this.idMap = new Map<string, string>();

    const handler = new DomHandler();
    const parser = new htmlparser2.Parser(handler);
    parser.write(template);
    parser.end();

    const rootIds: string[] = [];
    handler.dom.forEach(node => {
      const id = this.processNode(node, null);
      if (id) rootIds.push(id);
    });

    return {
      code: this.code.join('\n'),
      bindings: this.bindings,
      rootIds,
      idMap: Object.fromEntries(this.idMap)
    };
  }

  private processNode(node: Node, parentId: string | null): string | null {
    let id: string | null = null;
    if (node instanceof Text) {
      id = this.processTextNode(node);
    } else if (isTag(node)) {
      id = this.processElementNode(node, parentId);
    }

    if (id && parentId && id !== 'FRAGMENT_GROUP') {
      this.code.push(`${parentId}.appendChild(${id});`);
    }
    return id;
  }

  private processTextNode(node: Text): string {
    const text = node.data;
    const id = `el${this.nextId++}`;

    if (!text.includes('{{')) {
      this.code.push(`const ${id} = document.createTextNode(${JSON.stringify(text)});`);
      return id;
    }

    this.code.push(`const ${id} = document.createTextNode('');`);
    const expression = '`' + text.replace(/\{\{(.+?)\}\}/g, '${$1}') + '`';
    
    this.bindings.push({
      type: 'text',
      expression,
      targetId: id
    });

    return id;
  }

  private processElementNode(el: Element, parentId: string | null): string | null {
    // Handle ac:for
    const acFor = el.attribs['ac:for'];
    if (acFor) {
        delete el.attribs['ac:for'];
        const [itemVar, listExpr] = acFor.split(' of ').map(s => s.trim());
        const placeholderId = `el${this.nextId++}`;
        this.code.push(`const ${placeholderId} = document.createComment('ac:for');`);
        
        const subCompiler = new TemplateCompiler();
        const subResult = subCompiler.compile(this.elementToHtml(el));
        
        this.bindings.push({
            type: 'for',
            expression: listExpr,
            itemVar: itemVar,
            targetId: placeholderId,
            template: subResult.code,
            childBindings: subResult.bindings
        });
        return placeholderId;
    }

    // Handle ac:if
    const acIf = el.attribs['ac:if'];
    if (acIf) {
        delete el.attribs['ac:if'];
        const placeholderId = `el${this.nextId++}`;
        this.code.push(`const ${placeholderId} = document.createComment('ac:if');`);
        const subCompiler = new TemplateCompiler();
        const subResult = subCompiler.compile(this.elementToHtml(el));
        this.bindings.push({
            type: 'if',
            expression: acIf,
            targetId: placeholderId,
            template: subResult.code,
            childBindings: subResult.bindings
        });
        return placeholderId;
    }

    const isContainer = el.tagName === 'ac-container';
    
    if (isContainer) {
        el.children.forEach(child => {
            this.processNode(child, parentId);
        });
        return 'FRAGMENT_GROUP'; 
    }

    const id = `el${this.nextId++}`;
    this.code.push(`const ${id} = document.createElement('${el.tagName}');`);
    if (el.attribs['id']) {
        this.idMap.set(el.attribs['id'], id);
    }

    Object.entries(el.attribs).forEach(([name, value]) => {
      if (name.startsWith('[') && name.endsWith(']')) {
        const prop = name.slice(1, -1);
        this.bindings.push({ type: 'property', expression: value, target: prop, targetId: id });
      } else if (name.startsWith('(') && name.endsWith(')')) {
        const event = name.slice(1, -1);
        this.bindings.push({ type: 'event', expression: value, target: event, targetId: id });
      } else if (name.startsWith('ac:bind:')) {
        this.bindings.push({ type: 'property', expression: value, target: name.slice(8), targetId: id });
      } else {
        this.code.push(`${id}.setAttribute('${name}', ${JSON.stringify(value)});`);
      }
    });

    el.children.forEach(child => {
      this.processNode(child, id);
    });

    return id;
  }

  private elementToHtml(el: Element): string {
      const attrs = Object.entries(el.attribs).map(([n, v]) => `${n}="${v}"`).join(' ');
      return `<${el.tagName} ${attrs}>${htmlparser2.DomUtils.getInnerHTML(el)}</${el.tagName}>`;
  }
}
