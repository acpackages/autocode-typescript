import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateCompiler } from './template-compiler.js';

export class ComponentCompiler {
  private templateCompiler = new TemplateCompiler();

  compile(sourceCode: string, filePath?: string) {
    const sourceFile = ts.createSourceFile(filePath || 'component.ts', sourceCode, ts.ScriptTarget.Latest, true);
    const printer = ts.createPrinter();
    const components: any[] = [];
    const otherStatements: string[] = [];
    const topLevelVars = new Set<string>();

    sourceFile.statements.forEach(node => {
      if (ts.isClassDeclaration(node) && node.name) {
        const componentMetadata = this.getComponentMetadata(node);
        if (componentMetadata) {
          components.push({ node, metadata: componentMetadata });
          return;
        }
      }
      
      // Collect top-level identifiers
      if (ts.isImportDeclaration(node)) {
          if (node.importClause) {
              if (node.importClause.name) topLevelVars.add(node.importClause.name.text);
              if (node.importClause.namedBindings) {
                  if (ts.isNamedImports(node.importClause.namedBindings)) {
                      node.importClause.namedBindings.elements.forEach(el => topLevelVars.add(el.name.text));
                  } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                      topLevelVars.add(node.importClause.namedBindings.name.text);
                  }
              }
          }
      } else if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach(decl => {
              if (ts.isIdentifier(decl.name)) topLevelVars.add(decl.name.text);
          });
      } else if (ts.isFunctionDeclaration(node) && node.name) {
          topLevelVars.add(node.name.text);
      } else if (ts.isClassDeclaration(node) && node.name) {
          topLevelVars.add(node.name.text);
      }

      // If it's not a component we are compiling, keep it as is
      let statement = node;
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && filePath) {
          const originalPath = node.moduleSpecifier.text;
          if (originalPath.startsWith('.')) {
              const absolutePath = path.resolve(path.dirname(filePath), originalPath);
              statement = ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, ts.factory.createStringLiteral(absolutePath.replace(/\\/g, '/')), node.assertClause);
          }
      }
      otherStatements.push(printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile));
    });

    const otherCode = otherStatements.join('\n');
    const compiledComponents = components.map(c => {
        const compiled = this.compileComponent(c.node, c.metadata, sourceCode, topLevelVars, filePath);
        return {
            ...compiled,
            code: `${otherCode}\n\n${compiled.code}`
        };
    });

    return compiledComponents;
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
        if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer) || ts.isTemplateExpression(prop.initializer)) {
          metadata[prop.name.text] = prop.initializer.getText().slice(1, -1);
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
      if (!expr) return;
      const matches = expr.matchAll(/[a-zA-Z_$][a-zA-Z0-9_$]*/g);
      for (const match of matches) {
        const id = match[0];
        if (!['true', 'false', 'null', 'undefined', 'this', 'window', 'document', 'console', 'Math', 'Array', 'Object', 'String', 'JSON'].includes(id)) {
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

  private compileComponent(node: ts.ClassDeclaration, metadata: any, sourceCode: string, topLevelVars: Set<string>, filePath?: string) {
    const className = node.name!.text;
    const selector = metadata.selector;
    
    let template = metadata.template || '';
    if (metadata.templateUrl && filePath) {
        const templatePath = path.resolve(path.dirname(filePath), metadata.templateUrl);
        if (fs.existsSync(templatePath)) {
            template = fs.readFileSync(templatePath, 'utf8');
        }
    }

    let styles: string[] = Array.isArray(metadata.styles) ? metadata.styles : (metadata.styles ? [metadata.styles] : []);
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

    const membersCode = node.members
      .filter(m => ts.isMethodDeclaration(m) || ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m))
      .map(m => m.getText());

    const code = this.generateWebComponent(className, selector, templateResult, styles, reactiveProps, nonReactiveProps, inputs, outputs, viewChildren, membersCode, topLevelVars);
    
    return { selector, code };
  }

  private isDecorator(d: ts.Decorator, name: string) {
    const call = d.expression;
    if (ts.isCallExpression(call)) return ts.isIdentifier(call.expression) && call.expression.text === name;
    if (ts.isIdentifier(call)) return call.text === name;
    return false;
  }

  private prefixIdentifiers(expression: string, localVars: Set<string>, topLevelVars: Set<string>): string {
    if (!expression || !expression.trim()) return "''";
    
    if (expression.startsWith('`') && expression.endsWith('`')) {
        return expression.replace(/\$\{([^}]+)\}/g, (_, inner) => '${' + this.prefixIdentifiers(inner, localVars, topLevelVars) + '}');
    }

    try {
        const sourceFile = ts.createSourceFile('expr.ts', `(${expression})`, ts.ScriptTarget.Latest, true);
        const printer = ts.createPrinter({ removeComments: true });
        
        const transformer = (context: ts.TransformationContext) => (rootNode: ts.Node) => {
            const visit = (node: ts.Node): ts.Node => {
                if (ts.isPropertyAccessExpression(node)) {
                    const newExpr = ts.visitNode(node.expression, visit) as ts.Expression;
                    return ts.factory.updatePropertyAccessExpression(node, newExpr, node.name);
                }
                
                if (ts.isPropertyAssignment(node)) {
                    const newInitializer = ts.visitNode(node.initializer, visit) as ts.Expression;
                    return ts.factory.updatePropertyAssignment(node, node.name, newInitializer);
                }

                if (ts.isShorthandPropertyAssignment(node)) {
                    const name = node.name.text;
                    const globals = ['true', 'false', 'null', 'undefined', 'this', 'window', 'document', 'console', 'Math', 'Array', 'Object', 'String', '$event', 'JSON', 'NaN', 'Infinity'];
                    if (!localVars.has(name) && !globals.includes(name) && !topLevelVars.has(name)) {
                        return ts.factory.createPropertyAssignment(node.name, 
                            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), node.name));
                    }
                    return node;
                }

                if (ts.isIdentifier(node)) {
                    const name = node.text;
                    const globals = ['true', 'false', 'null', 'undefined', 'this', 'window', 'document', 'console', 'Math', 'Array', 'Object', 'String', '$event', 'JSON', 'NaN', 'Infinity', 'let', 'const', 'var'];
                    
                    if (!localVars.has(name) && !globals.includes(name) && !topLevelVars.has(name)) {
                        return ts.factory.createPropertyAccessExpression(ts.factory.createThis(), node);
                    }
                }
                return ts.visitEachChild(node, visit, context);
            };
            return ts.visitNode(rootNode, visit);
        };

        const result = ts.transform(sourceFile, [transformer]);
        const transformedFile = result.transformed[0] as ts.SourceFile;
        const statement = transformedFile.statements[0] as ts.ExpressionStatement;
        const expressionNode = statement.expression;
        
        let innerExpr = expressionNode;
        if (ts.isParenthesizedExpression(expressionNode)) {
            innerExpr = expressionNode.expression;
        }

        return printer.printNode(ts.EmitHint.Expression, innerExpr, transformedFile).trim();
    } catch (e) {
        return expression;
    }
  }

  private generateWebComponent(className: string, selector: string, templateResult: any, styles: string[], reactiveProps: any[], nonReactiveProps: any[], inputs: string[], outputs: string[], viewChildren: any[], membersCode: string[], topLevelVars: Set<string>) {
    const propertyInits = [...reactiveProps, ...nonReactiveProps].map(p => `(this as any).${p.name} = ${p.init};`).join('\n');
    const outputInits = outputs.map(o => `(this as any).${o} = { emit: (data: any) => this.dispatchEvent(new CustomEvent('${o}', { detail: data })) };`).join('\n');

    const generateBindings = (bindings: any[], localVars: Set<string>, rootContainer: string): string[] => {
      return bindings.map(b => {
        const prefExpr = this.prefixIdentifiers(b.expression, localVars, topLevelVars);
        const targetNode = b.type === 'text' || b.type === 'property' || b.type === 'event' 
            ? `${rootContainer}.querySelector('[ac-id="${b.targetId}"]')`
            : null;

        if (b.type === 'text') return `createEffect(() => { const el = ${targetNode}; if (el) el.textContent = String(${prefExpr} ?? ''); });`;
        if (b.type === 'property') {
          const target = b.target.includes('.') ? `['${b.target.split('.').join("']['")}']` : `['${b.target}']`;
          return `createEffect(() => { const el = ${targetNode}; if (el) (el as any)${target} = ${prefExpr}; });`;
        }
        if (b.type === 'event') return `${targetNode}?.addEventListener('${b.target}', ($event: any) => { ${prefExpr} });`;
        
        if (b.type === 'if') {
            const nextLocals = new Set(localVars);
            return `(function(this: any) { 
                let currentNodes: any[] = []; 
                const placeholder = Array.from(${rootContainer}.childNodes).find(n => n.nodeType === 8 && n.textContent === '${b.targetId}');
                createEffect(() => { 
                    const condition = ${prefExpr}; 
                    if (condition) { 
                        if (currentNodes.length === 0) { 
                            const container = document.createElement('div');
                            container.innerHTML = ${JSON.stringify(b.template)};
                            currentNodes = Array.from(container.childNodes);
                            ${generateBindings(b.childBindings || [], nextLocals, 'container').join('\n')}
                            currentNodes.forEach((node: any) => { placeholder.parentNode?.insertBefore(node, placeholder.nextSibling); }); 
                        } 
                    } else { 
                        currentNodes.forEach((node: any) => node.remove()); 
                        currentNodes = []; 
                    } 
                }); 
            }).call(this);`;
        }
        if (b.type === 'for') {
            const nextLocals = new Set(localVars);
            nextLocals.add(b.itemVar);
            return `(function(this: any) { 
                let currentMap = new Map<any, any[]>(); 
                const placeholder = Array.from(${rootContainer}.childNodes).find(n => n.nodeType === 8 && n.textContent === '${b.targetId}');
                createEffect(() => { 
                    const list = (${prefExpr} as any[]) || []; 
                    const newMap = new Map<any, any[]>(); 
                    list.forEach((${b.itemVar}, index) => { 
                        if (currentMap.has(${b.itemVar})) { 
                            newMap.set(${b.itemVar}, currentMap.get(${b.itemVar})!); 
                            currentMap.delete(${b.itemVar}); 
                        } else { 
                            const container = document.createElement('div');
                            container.innerHTML = ${JSON.stringify(b.template)};
                            const nodes = Array.from(container.childNodes);
                            ${generateBindings(b.childBindings || [], nextLocals, 'container').join('\n')}
                            newMap.set(${b.itemVar}, nodes); 
                        } 
                    }); 
                    currentMap.forEach(nodes => nodes.forEach(n => n.remove())); 
                    currentMap = newMap; 
                    let lastNode: any = placeholder; 
                    list.forEach(item => { 
                        const nodes = newMap.get(item)!; 
                        nodes.forEach(n => { lastNode.parentNode?.insertBefore(n, lastNode.nextSibling); lastNode = n; }); 
                    }); 
                }); 
            }).call(this);`;
        }
        return '';
      });
    };

    const viewChildAssignments = viewChildren.map(vc => {
        const internalId = templateResult.idMap[vc.selector];
        return internalId ? `(this as any).${vc.propName} = this.querySelector('[ac-id="${internalId}"]');` : `console.warn('@AcViewChild: Could not find element with id "${vc.selector}"');`;
    }).join('\n');

    const stylesCode = styles.length > 0 ? `
      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(styles.join('\n'))};
      this.appendChild(style);
    ` : '';

    return `
/** Generated by AC Runtime Compiler */

(function() {
  let activeEffect: (() => void) | null = null;
  function createSignal<T>(value: T): [() => T, (newValue: T) => void] {
    const subscribers = new Set<() => void>();
    return [() => { if (activeEffect) subscribers.add(activeEffect); return value; }, (newValue: T) => { if (value === newValue) return; value = newValue; subscribers.forEach(sub => sub()); }];
  }
  function createEffect(fn: () => void) { const effect = () => { activeEffect = effect; fn(); activeEffect = null; }; effect(); }

  class ${className}Compiled extends HTMLElement {
    constructor() {
      super();
      ${propertyInits}
      ${outputInits}
      
      // Map reactive properties to internal signals for bindings
      ${reactiveProps.map(p => `
      const [${p.name}Sig, set${p.name}Sig] = createSignal((this as any).${p.name});
      Object.defineProperty(this, '${p.name}', {
        get: () => ${p.name}Sig(),
        set: (v) => set${p.name}Sig(v),
        configurable: true
      });`).join('')}
    }
    static get observedAttributes() { return ${JSON.stringify(inputs)}; }
    attributeChangedCallback(name: string, old: string, val: string) { if (old !== val) (this as any)[name] = val; }
    connectedCallback() { this.render(); if ((this as any).acOnInit) (this as any).acOnInit(); }
    render() {
      const self = this;
      ${stylesCode}
      this.innerHTML = ${JSON.stringify(templateResult.html)};
      ${viewChildAssignments}
      ${generateBindings(templateResult.bindings, new Set(), 'this').join('\n')}
    }
    ${membersCode.join('\n\n')}
  }
  if (!customElements.get('${selector}')) customElements.define('${selector}', ${className}Compiled);
})();`;
  }
}
