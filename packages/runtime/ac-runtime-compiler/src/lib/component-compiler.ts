import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateCompiler } from './template-compiler.js';

export class ComponentCompiler {
  private templateCompiler = new TemplateCompiler();

  compile(sourceCode: string, filePath?: string) {
    const sourceFile = ts.createSourceFile(filePath || 'component.ts', sourceCode, ts.ScriptTarget.Latest, true);
    const components: any[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        const componentMetadata = this.getComponentMetadata(node);
        if (componentMetadata) {
          components.push(this.compileComponent(node, componentMetadata, sourceCode, filePath));
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return components;
  }

  private getComponentMetadata(node: ts.ClassDeclaration) {
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
    if (!decorators) return null;
    const acElementDecorator = decorators.find(d => this.isDecorator(d, 'AcElement'));
    if (!acElementDecorator) return null;

    const call = acElementDecorator.expression as ts.CallExpression;
    const config = call.arguments[0] as ts.ObjectLiteralExpression;
    const metadata: any = {};
    config.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
          metadata[prop.name.text] = prop.initializer.text;
        } else if (ts.isArrayLiteralExpression(prop.initializer)) {
            metadata[prop.name.text] = prop.initializer.elements
                .filter(ts.isStringLiteral)
                .map(el => el.text);
        }
      }
    });
    return metadata;
  }

  private extractUsedIdentifiers(templateBindings: any[]): Set<string> {
    const identifiers = new Set<string>();
    const processExpression = (expr: string) => {
      const matches = expr.matchAll(/[a-zA-Z_$][a-zA-Z0-9_$]*/g);
      for (const match of matches) {
        const id = match[0];
        if (!['true', 'false', 'null', 'undefined', 'this', 'window', 'document', 'console', 'Math', 'Array', 'Object', 'String'].includes(id)) {
          identifiers.add(id);
        }
      }
    };
    for (const b of templateBindings) {
      processExpression(b.expression);
      if (b.childBindings) {
        this.extractUsedIdentifiers(b.childBindings).forEach(id => identifiers.add(id));
      }
    }
    return identifiers;
  }

  private compileComponent(node: ts.ClassDeclaration, metadata: any, sourceCode: string, filePath?: string) {
    const className = node.name!.text;
    const selector = metadata.selector;
    
    let template = metadata.template || '';
    if (metadata.templateUrl && filePath) {
        const templatePath = path.resolve(path.dirname(filePath), metadata.templateUrl);
        if (fs.existsSync(templatePath)) {
            template = fs.readFileSync(templatePath, 'utf8');
        }
    }

    let styles: string[] = Array.isArray(metadata.styles) ? metadata.styles : [];
    if (metadata.styleUrls && filePath) {
        const styleUrls = Array.isArray(metadata.styleUrls) ? metadata.styleUrls : [metadata.styleUrls];
        styleUrls.forEach((url: string) => {
            const stylePath = path.resolve(path.dirname(filePath), url);
            if (fs.existsSync(stylePath)) {
                styles.push(fs.readFileSync(stylePath, 'utf8'));
            }
        });
    }

    const templateResult = this.templateCompiler.compile(template);
    const usedInTemplate = this.extractUsedIdentifiers(templateResult.bindings);

    const inputs: string[] = [];
    const outputs: string[] = [];
    const viewChildren: { propName: string; selector: string }[] = [];
    const reactiveProps: { name: string; init?: string }[] = [];
    const nonReactiveProps: { name: string; init?: string }[] = [];
    const reactivePropNames = new Set<string>();

    node.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
        const propName = member.name.text;
        const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
        let isInput = false;
        let isOutput = false;
        let isViewChild = false;

        if (decorators) {
          decorators.forEach(d => {
            if (this.isDecorator(d, 'AcInput')) { inputs.push(propName); isInput = true; }
            if (this.isDecorator(d, 'AcOutput')) { outputs.push(propName); isOutput = true; }
            if (this.isDecorator(d, 'AcViewChild')) {
                const call = d.expression as ts.CallExpression;
                const viewChildSelector = (call.arguments[0] as ts.StringLiteral).text;
                viewChildren.push({ propName, selector: viewChildSelector });
                isViewChild = true;
            }
          });
        }

        const init = member.initializer ? member.initializer.getText() : 'undefined';
        if (isInput || usedInTemplate.has(propName)) {
          reactiveProps.push({ name: propName, init });
          reactivePropNames.add(propName);
        } else if (!isOutput && !isViewChild) {
          nonReactiveProps.push({ name: propName, init });
        }
      }
    });

    const transformedMembersCode = node.members
      .filter(ts.isMethodDeclaration)
      .map(m => this.transformMethod(m, reactivePropNames));

    const generatedCode = this.generateWebComponent(className, selector, templateResult, styles, reactiveProps, nonReactiveProps, inputs, outputs, viewChildren, transformedMembersCode);

    return { className, selector, code: generatedCode };
  }

  private transformMethod(method: ts.MethodDeclaration, reactiveProps: Set<string>): string {
    const printer = ts.createPrinter();
    const transformer = (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      const visit = (node: ts.Node): ts.Node => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
          const propAccess = node.expression;
          if (ts.isPropertyAccessExpression(propAccess.expression) && propAccess.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
            const propName = (propAccess.expression.name as ts.Identifier).text;
            const methodName = propAccess.name.text;
            if (reactiveProps.has(propName) && ['push', 'pop', 'splice', 'shift', 'unshift', 'reverse', 'sort'].includes(methodName)) {
              return ts.factory.createParenthesizedExpression(ts.factory.createComma(node, ts.factory.createAssignment(propAccess.expression, propAccess.expression)));
            }
          }
        }
        return ts.visitEachChild(node, visit, context);
      };
      return ts.visitNode(rootNode, visit);
    };
    return printer.printNode(ts.EmitHint.Unspecified, ts.transform(method, [transformer]).transformed[0] as ts.MethodDeclaration, method.getSourceFile());
  }

  private isDecorator(d: ts.Decorator, name: string) {
    const call = d.expression;
    if (ts.isCallExpression(call)) return ts.isIdentifier(call.expression) && call.expression.text === name;
    if (ts.isIdentifier(call)) return call.text === name;
    return false;
  }

  private generateWebComponent(className: string, selector: string, templateResult: any, styles: string[], reactiveProps: any[], nonReactiveProps: any[], inputs: string[], outputs: string[], viewChildren: any[], membersCode: string[]) {
    const signalInits = reactiveProps.map(p => `
    const [${p.name}Sig, set${p.name}Sig] = createSignal(${p.init});
    Object.defineProperty(this, '${p.name}', {
      get: () => ${p.name}Sig(),
      set: (v) => set${p.name}Sig(v),
      configurable: true
    });`).join('\n');

    const standardInits = nonReactiveProps.map(p => `this.${p.name} = ${p.init};`).join('\n');
    const outputInits = outputs.map(o => `this.${o} = { emit: (data) => this.dispatchEvent(new CustomEvent('${o}', { detail: data })) };`).join('\n');

    const generateBindings = (bindings: any[], itemVar?: string): string[] => {
      return bindings.map(b => {
        const wrap = (expr: string) => {
            if (itemVar) {
                return `(function(${itemVar}) { with(this) { return ${expr} } }).call(this, ${itemVar})`;
            }
            return `(function() { with(this) { return ${expr} } }).call(this)`;
        };

        if (b.type === 'text') return `createEffect(() => { ${b.targetId}.textContent = ${wrap(b.expression)}; });`;
        if (b.type === 'property') {
          const target = b.target.includes('.') ? `['${b.target.split('.').join("']['")}']` : `['${b.target}']`;
          return `createEffect(() => { ${b.targetId}${target} = ${wrap(b.expression)}; });`;
        }
        if (b.type === 'event') return `${b.targetId}.addEventListener('${b.target}', ($event) => { ${wrap(b.expression)} });`;
        if (b.type === 'if') return `(function() { let currentNodes = []; createEffect(() => { const condition = ${wrap(b.expression)}; if (condition) { if (currentNodes.length === 0) { const subRender = (function() { ${b.template} const rootNodes = [el0]; ${generateBindings(b.childBindings || [], itemVar).join('\n')} return rootNodes; }).call(this); currentNodes = subRender; currentNodes.forEach(node => { ${b.targetId}.parentNode.insertBefore(node, ${b.targetId}.nextSibling); }); } } else { currentNodes.forEach(node => node.remove()); currentNodes = []; } }); })();`;
        if (b.type === 'for') return `(function() { let currentMap = new Map(); createEffect(() => { const list = ${wrap(b.expression)}; const newMap = new Map(); list.forEach((item, index) => { if (currentMap.has(item)) { newMap.set(item, currentMap.get(item)); currentMap.delete(item); } else { const subRender = (function(${b.itemVar}) { ${b.template} const rootNodes = [el0]; ${generateBindings(b.childBindings || [], b.itemVar).join('\n')} return rootNodes; }).call(this, item); newMap.set(item, subRender); } }); currentMap.forEach(nodes => nodes.forEach(n => n.remove())); currentMap = newMap; let lastNode = ${b.targetId}; list.forEach(item => { const nodes = newMap.get(item); nodes.forEach(n => { lastNode.parentNode.insertBefore(n, lastNode.nextSibling); lastNode = n; }); }); }); })();`;
        return '';
      });
    };

    const viewChildAssignments = viewChildren.map(vc => {
        const internalId = templateResult.idMap[vc.selector];
        return internalId ? `this.${vc.propName} = ${internalId};` : `console.warn('@AcViewChild: Could not find element with id "${vc.selector}"');`;
    }).join('\n');

    const stylesCode = styles.length > 0 ? `
      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(styles.join('\n'))};
      this.shadowRoot.appendChild(style);
    ` : '';

    return `
(function() {
  let activeEffect = null;
  function createSignal(value) {
    const subscribers = new Set();
    return [() => { if (activeEffect) subscribers.add(activeEffect); return value; }, (newValue) => { if (value === newValue) return; value = newValue; subscribers.forEach(sub => sub()); }];
  }
  function createEffect(fn) { const effect = () => { activeEffect = effect; fn(); activeEffect = null; }; effect(); }

  class ${className}Compiled extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      ${standardInits}
      ${outputInits}
      ${signalInits}
    }
    connectedCallback() { this.render(); if (this.acOnInit) this.acOnInit(); }
    render() {
      const self = this;
      ${stylesCode}
      ${templateResult.code}
      ${templateResult.rootIds.map((id: string) => `this.shadowRoot.appendChild(${id});`).join('\n')}
      ${viewChildAssignments}
      ${generateBindings(templateResult.bindings).join('\n')}
    }
    ${membersCode.join('\n\n')}
  }
  if (!customElements.get('${selector}')) customElements.define('${selector}', ${className}Compiled);
})();`;
  }
}
