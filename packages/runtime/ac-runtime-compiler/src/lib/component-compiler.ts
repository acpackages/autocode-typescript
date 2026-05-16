/**
 * @module component-compiler
 *
 * Transforms AC Runtime component classes into self-contained Web Components.
 *
 * **High-level compilation flow:**
 *
 * ```
 * TypeScript Source (.ts)
 *   │
 *   ├─ Parse with TypeScript AST
 *   ├─ Find @AcElement-decorated classes
 *   ├─ For each component:
 *   │   ├─ Extract metadata (selector, template, styles)
 *   │   ├─ Compile template via TemplateCompiler → HTML + Bindings
 *   │   ├─ Classify properties (reactive vs static, inputs, outputs, viewChildren)
 *   │   ├─ Prefix template expressions (bare identifiers → this.identifier)
 *   │   └─ Generate IIFE with:
 *   │       ├─ Signal system (createSignal, createEffect)
 *   │       ├─ Inner component class with signal-backed properties
 *   │       ├─ HTMLElement wrapper (customElements.define)
 *   │       └─ Style injection with reference counting
 *   └─ Reassemble: imports + pre-component code + IIFE + post-component code
 * ```
 *
 * **Key design decisions:**
 * - Each component is wrapped in an IIFE to encapsulate the signal system
 *   and prevent cross-component interference.
 * - Properties used in the template are automatically made reactive via
 *   `createSignal` + `Object.defineProperty` getter/setter.
 * - Properties NOT used in the template stay as plain fields for performance.
 * - The generated code is valid TypeScript (not transpiled JS) so Vite's
 *   esbuild can handle final transpilation.
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateCompiler, Binding, TemplateCompileResult } from './template-compiler.js';

// ─── Shared Constants ────────────────────────────────────────────────────────

/**
 * Global identifiers that should never be prefixed with `this.` during
 * template expression rewriting.
 *
 * When the compiler encounters an identifier like `count` in a template
 * expression `count > 5`, it rewrites it to `this.count > 5` so the
 * generated code accesses the component instance. However, built-in
 * globals (`Math`, `console`, `JSON`, etc.) and language keywords must
 * remain unmodified.
 *
 * Uses a `Set` for O(1) lookup — this check runs once per identifier
 * per binding expression, so performance matters for large templates.
 */
const GLOBAL_IDENTIFIERS = new Set([
  'true', 'false', 'null', 'undefined', 'this', 'window', 'document',
  'console', 'Math', 'Array', 'Object', 'String', 'JSON', 'NaN',
  'Infinity', '$event', 'let', 'const', 'var', 'Number', 'Boolean',
  'Date', 'RegExp', 'Error', 'Map', 'Set', 'Promise', 'parseInt',
  'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'setInterval',
  'clearTimeout', 'clearInterval', 'typeof', 'instanceof', 'void',
  'delete', 'new', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'throw', 'try', 'catch',
  'finally', 'in', 'of', 'class', 'function', 'async', 'await',
  'yield', 'super', 'import', 'export', 'default', 'from', 'as',
  'with', 'debugger',
  // Pipe helper injected by the AC Runtime compiler into every IIFE
  '__acPipe',
]);

// ─── Typed Interfaces ────────────────────────────────────────────────────────

/**
 * Parsed metadata extracted from the `@AcElement()` decorator AST node.
 * Mirrors {@link IAcElementMetadata} but represents the compiler's
 * internal working copy after AST extraction.
 */
interface ComponentMetadata {
  /** Custom element tag name (e.g., `'app-header'`). */
  selector: string;
  /** Inline template string (from `template:` property). */
  template?: string;
  /** Relative path to external template file (from `templateUrl:`). */
  templateUrl?: string;
  /** Inline styles — single string or array (from `styles:`). */
  styles?: string | string[];
  /** Relative paths to external style files (from `styleUrls:`). */
  styleUrls?: string | string[];
}

/**
 * Describes a class property that will be backed by a reactive signal
 * in the generated code. Properties become reactive if they are:
 * 1. Referenced in the component's template expressions, OR
 * 2. Decorated with `@AcInput()`.
 */
interface ReactiveProperty {
  /** The property name as declared in the source class. */
  name: string;
  /** The property's initializer expression (e.g., `"'World'"`, `"0"`, `"undefined"`). */
  init: string;
  /** Original declaration order index, used to preserve initialization order. */
  sourceIndex: number;
}

/** Maps a class property to its `#ref` template reference. */
interface ViewChildEntry {
  /** The class property name decorated with `@AcViewChild`. */
  propName: string;
  /** The template reference name (value of `#name` in the template). */
  selector: string;
}

/** Output of a single component compilation. */
interface CompileResult {
  /** The custom element selector, or `null` for non-component files. */
  selector: string | null;
  /** The complete generated TypeScript code (imports + IIFE). */
  code: string;
}

/** Intermediate pairing of a class AST node with its extracted metadata. */
interface ComponentInfo {
  /** The TypeScript class declaration AST node. */
  node: ts.ClassDeclaration;
  /** Metadata extracted from the `@AcElement()` decorator. */
  metadata: ComponentMetadata;
}

// ─── Compiler ────────────────────────────────────────────────────────────────

/**
 * The main compiler class. Takes TypeScript source code containing
 * `@AcElement`-decorated classes and produces self-contained Web
 * Component code using an IIFE + signal-based reactivity pattern.
 *
 * **Usage:**
 * ```ts
 * const compiler = new ComponentCompiler();
 * const results = compiler.compile(sourceCode, filePath);
 * // results[0].code contains the generated Web Component TypeScript
 * ```
 *
 * **Instance reuse:** A single `ComponentCompiler` instance can compile
 * multiple files. The {@link TemplateCompiler} and TypeScript printer
 * are created once and reused across compilations.
 */
export class ComponentCompiler {
  /** Shared template compiler instance (stateless per invocation). */
  private readonly templateCompiler = new TemplateCompiler();

  /** Reusable TypeScript printer — avoids re-creation per compile call. */
  private readonly printer = ts.createPrinter({ removeComments: false });

  /**
   * Compile a TypeScript source file, extracting and transforming all
   * `@AcElement`-decorated component classes.
   *
   * **What happens:**
   * 1. Parses the source into a TypeScript AST.
   * 2. Separates statements into: imports, components, and trailing code.
   * 3. Collects all top-level identifiers (used to avoid `this.` prefixing globals).
   * 4. For each component: compiles template, classifies properties, generates IIFE.
   * 5. Re-assembles: `imports → pre-component code → IIFE → post-component code`.
   *
   * If no `@AcElement` components are found, the file is returned as-is
   * with `selector: null`.
   *
   * @param sourceCode    - The raw TypeScript source code.
   * @param filePath      - Absolute path to the file (used for template/style resolution).
   * @param resolveImport - Optional custom import path resolver (used by Vite plugin
   *                        to rewrite paths into the cache directory).
   * @returns One {@link CompileResult} per component, or a single result with
   *          `selector: null` for non-component files.
   */
  compile(
    sourceCode: string,
    filePath?: string,
    resolveImport?: (originalPath: string, importerPath: string) => string,
  ): CompileResult[] {
    // Parse source into a full TypeScript AST with parent pointers
    const sourceFile = ts.createSourceFile(
      filePath || 'component.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
    );

    const components: ComponentInfo[] = [];
    const importStatements: string[] = [];
    const trailingStatements: { text: string; pos: number }[] = [];
    const topLevelVars = new Set<string>();

    for (const node of sourceFile.statements) {
      if (ts.isClassDeclaration(node) && node.name) {
        const componentMetadata = this.getComponentMetadata(node);
        if (componentMetadata) {
          components.push({ node, metadata: componentMetadata });
          continue;
        }
      }

      // Collect top-level identifiers
      this.collectTopLevelIdentifiers(node, topLevelVars);

      // If it's not a component we are compiling, keep it as-is
      let statement: ts.Node = node;
      const isImport = ts.isImportDeclaration(node);
      const isExport = ts.isExportDeclaration(node);

      if ((isImport || isExport) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && filePath) {
        const originalPath = node.moduleSpecifier.text;
        let newPath = originalPath;
        if (resolveImport) {
          newPath = resolveImport(originalPath, filePath);
        } else if (originalPath.startsWith('.')) {
          const absolutePath = path.resolve(path.dirname(filePath), originalPath);
          newPath = absolutePath.replace(/\\/g, '/');
        }
        if (newPath !== originalPath) {
          if (isImport) {
            statement = ts.factory.updateImportDeclaration(
              node as ts.ImportDeclaration,
              (node as ts.ImportDeclaration).modifiers,
              (node as ts.ImportDeclaration).importClause,
              ts.factory.createStringLiteral(newPath),
              (node as ts.ImportDeclaration).assertClause,
            );
          } else {
            statement = ts.factory.updateExportDeclaration(
              node as ts.ExportDeclaration,
              (node as ts.ExportDeclaration).modifiers,
              (node as ts.ExportDeclaration).isTypeOnly,
              (node as ts.ExportDeclaration).exportClause,
              ts.factory.createStringLiteral(newPath),
              (node as ts.ExportDeclaration).assertClause,
            );
          }
        }
      }

      const printed = this.printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile);
      if (isImport || isExport) {
        importStatements.push(printed);
      } else {
        trailingStatements.push({ text: printed, pos: node.getStart() });
      }
    }

    const importsCode = importStatements.join('\n');
    // Always inject the acPipeRegistry import so __acPipe() calls resolve at runtime.
    const pipeImport = `import { acPipeRegistry } from '@autocode-ts/ac-pipes';`;
    const compiledComponents = components.map(c => {
      const componentPos = c.node.getStart();
      const preComponentStatements: string[] = [];
      const postComponentStatements: string[] = [];
      for (const s of trailingStatements) {
        if (s.pos < componentPos) {
          preComponentStatements.push(s.text);
        } else {
          postComponentStatements.push(s.text);
        }
      }
      const compiled = this.compileComponent(c.node, c.metadata, sourceCode, topLevelVars, filePath);
      return {
        ...compiled,
        code: `${pipeImport}\n${importsCode}\n\n${preComponentStatements.join('\n')}\n\n${compiled.code}\n\n${postComponentStatements.join('\n')}`,
      };
    });

    if (compiledComponents.length === 0) {
      return [{ selector: null, code: `${importsCode}\n${trailingStatements.map(s => s.text).join('\n')}` }];
    }

    return compiledComponents;
  }

  // ─── AST Helpers ─────────────────────────────────────────────────────────

  /**
   * Scan a top-level statement and record any identifiers it introduces.
   *
   * These identifiers are needed so the expression prefixer knows NOT to
   * rewrite them as `this.identifier`. For example, if a file has
   * `import { signal } from 'solid'`, then `signal` in a template
   * expression should NOT become `this.signal`.
   *
   * Handles: default imports, named imports, namespace imports,
   * variable declarations, function declarations, and class declarations.
   */
  private collectTopLevelIdentifiers(node: ts.Statement, vars: Set<string>): void {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      if (!clause) return;
      if (clause.name) vars.add(clause.name.text);
      if (clause.namedBindings) {
        if (ts.isNamedImports(clause.namedBindings)) {
          for (const el of clause.namedBindings.elements) vars.add(el.name.text);
        } else if (ts.isNamespaceImport(clause.namedBindings)) {
          vars.add(clause.namedBindings.name.text);
        }
      }
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) vars.add(decl.name.text);
      }
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      vars.add(node.name.text);
    } else if (ts.isClassDeclaration(node) && node.name) {
      vars.add(node.name.text);
    }
  }

  /**
   * Extract the `@AcElement(...)` metadata from a class declaration's decorators.
   *
   * Reads the object literal passed to `@AcElement({...})` and extracts
   * string and array properties into a {@link ComponentMetadata} object.
   *
   * @returns The metadata, or `null` if the class is not decorated with `@AcElement`.
   */
  private getComponentMetadata(node: ts.ClassDeclaration): ComponentMetadata | null {
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
    if (!decorators) return null;
    const acElementDecorator = decorators.find(d => this.isDecorator(d, 'AcElement'));
    if (!acElementDecorator) return null;

    const call = acElementDecorator.expression as ts.CallExpression;
    const config = call.arguments[0] as ts.ObjectLiteralExpression;
    const metadata: Record<string, string | string[]> = {};

    for (const prop of config.properties) {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        if (
          ts.isStringLiteral(prop.initializer)
          || ts.isNoSubstitutionTemplateLiteral(prop.initializer)
          || ts.isTemplateExpression(prop.initializer)
        ) {
          metadata[prop.name.text] = prop.initializer.getText().slice(1, -1);
        } else if (ts.isArrayLiteralExpression(prop.initializer)) {
          metadata[prop.name.text] = prop.initializer.elements
            .filter((el): el is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
              ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el))
            .map(el => el.text);
        }
      }
    }
    return metadata as unknown as ComponentMetadata;
  }

  /**
   * Extract all user-defined identifiers referenced in template binding expressions.
   *
   * Walks all binding expressions (including nested `childBindings` from
   * structural directives) and collects identifiers that are NOT global
   * built-ins. The resulting set tells the compiler which class properties
   * need to be made reactive (signal-backed).
   *
   * @param templateBindings - The flat binding array from the template compiler.
   * @returns Set of identifier names referenced in template expressions.
   */
  private extractUsedIdentifiers(templateBindings: Binding[]): Set<string> {
    const identifiers = new Set<string>();
    const processExpression = (expr: string): void => {
      if (!expr) return;
      const matches = expr.matchAll(/[a-zA-Z_$][a-zA-Z0-9_$]*/g);
      for (const match of matches) {
        if (!GLOBAL_IDENTIFIERS.has(match[0])) {
          identifiers.add(match[0]);
        }
      }
    };
    for (const b of templateBindings) {
      processExpression(b.expression);
      if (b.childBindings) {
        for (const id of this.extractUsedIdentifiers(b.childBindings)) {
          identifiers.add(id);
        }
      }
    }
    return identifiers;
  }

  // ─── Component Compilation ───────────────────────────────────────────────

  /**
   * Compile a single `@AcElement`-decorated class into a Web Component IIFE.
   *
   * **Steps:**
   * 1. Resolve external templates and styles from disk.
   * 2. Run the template through {@link TemplateCompiler} to get HTML + bindings.
   * 3. Classify each class property as reactive, non-reactive, input, output, or viewChild.
   * 4. Extract method/accessor bodies from the AST.
   * 5. Generate the full IIFE code via {@link generateWebComponent}.
   */
  private compileComponent(
    node: ts.ClassDeclaration,
    metadata: ComponentMetadata,
    sourceCode: string,
    topLevelVars: Set<string>,
    filePath?: string,
  ): CompileResult {
    const className = node.name!.text;
    const selector = metadata.selector;
    const extendsClause = node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
    const baseClassName = extendsClause ? extendsClause.types[0].getText() : null;

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
      for (const url of styleUrls) {
        const stylePath = path.resolve(path.dirname(filePath), url);
        if (fs.existsSync(stylePath)) {
          styles.push(fs.readFileSync(stylePath, 'utf8'));
        }
      }
    }

    const templateResult = this.templateCompiler.compile(template);
    const usedInTemplate = this.extractUsedIdentifiers(templateResult.bindings);

    const inputs: string[] = [];
    const outputs: string[] = [];
    const viewChildren: ViewChildEntry[] = [];
    const reactiveProps: ReactiveProperty[] = [];
    const nonReactiveProps: ReactiveProperty[] = [];
    const reactivePropNames = new Set<string>();
    let memberIndex = 0;

    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
        const propName = member.name.text;
        const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
        let isInput = false;
        let isOutput = false;
        let isViewChild = false;

        if (decorators) {
          for (const d of decorators) {
            if (this.isDecorator(d, 'AcInput')) { inputs.push(propName); isInput = true; }
            if (this.isDecorator(d, 'AcOutput')) { outputs.push(propName); isOutput = true; }
            if (this.isDecorator(d, 'AcViewChild')) {
              const call = d.expression as ts.CallExpression;
              const viewChildSelector = (call.arguments[0] as ts.StringLiteral).text;
              viewChildren.push({ propName, selector: viewChildSelector });
              isViewChild = true;
            }
          }
        }

        const init = member.initializer ? member.initializer.getText() : 'undefined';
        if (propName === 'element') {
          // Skip - managed by the HTMLElement wrapper
        } else if (isInput || usedInTemplate.has(propName)) {
          reactiveProps.push({ name: propName, init, sourceIndex: memberIndex });
          reactivePropNames.add(propName);
        } else if (!isOutput && !isViewChild) {
          nonReactiveProps.push({ name: propName, init, sourceIndex: memberIndex });
        }
        memberIndex++;
      }
    }

    const membersCode = node.members
      .filter(m => ts.isMethodDeclaration(m) || ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m))
      .map(m => m.getText());

    const code = this.generateWebComponent(
      className, selector, templateResult, styles,
      reactiveProps, nonReactiveProps, inputs, outputs,
      viewChildren, membersCode, topLevelVars, baseClassName,
    );

    return { selector, code };
  }

  /** Check if a decorator AST node matches a given decorator name (e.g., `'AcInput'`). */
  private isDecorator(d: ts.Decorator, name: string): boolean {
    const call = d.expression;
    if (ts.isCallExpression(call)) return ts.isIdentifier(call.expression) && call.expression.text === name;
    if (ts.isIdentifier(call)) return call.text === name;
    return false;
  }

  // ─── Expression Prefixing ───────────────────────────────────────────────

  /**
   * Rewrite bare identifiers in a template expression to be prefixed with `this.`.
   *
   * For example, `count > 5` becomes `this.count > 5`, ensuring the
   * generated code accesses the component instance's signal-backed property.
   *
   * **Identifiers that are NOT rewritten:**
   * - Global built-ins (from {@link GLOBAL_IDENTIFIERS}): `Math`, `console`, etc.
   * - Top-level variables from the source file: imported values, constants.
   * - Local variables: loop iteration variables from `ac:for` directives.
   * - Property access chains: only the root is rewritten (`foo.bar` → `this.foo.bar`).
   *
   * Uses the TypeScript compiler's own AST transformer for correctness —
   * simple regex replacement would fail on complex expressions.
   *
   * @param expression   - The raw expression string from the template.
   * @param localVars    - Variables in local scope (e.g., `item` from `ac:for`).
   * @param topLevelVars - Top-level file-scope identifiers.
   * @returns The rewritten expression string.
   */
  private prefixIdentifiers(expression: string, localVars: Set<string>, topLevelVars: Set<string>): string {
    if (!expression || !expression.trim()) return "''";

    if (expression.startsWith('`') && expression.endsWith('`')) {
      return expression.replace(/\$\{([^}]+)\}/g, (_, inner) => '${' + this.prefixIdentifiers(inner, localVars, topLevelVars) + '}');
    }

    try {
      const sourceFile = ts.createSourceFile('expr.ts', `(${expression})`, ts.ScriptTarget.Latest, true);

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
            if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name) && !topLevelVars.has(name)) {
              return ts.factory.createPropertyAssignment(
                node.name,
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), node.name),
              );
            }
            return node;
          }

          if (ts.isIdentifier(node)) {
            const name = node.text;
            if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name) && !topLevelVars.has(name)) {
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

      let innerExpr: ts.Expression = expressionNode;
      if (ts.isParenthesizedExpression(expressionNode)) {
        innerExpr = expressionNode.expression;
      }

      const output = this.printer.printNode(ts.EmitHint.Expression, innerExpr, transformedFile).trim();
      result.dispose();
      return output;
    } catch {
      return expression;
    }
  }

  // ─── Code Generation ────────────────────────────────────────────────────

  /**
   * Generate the complete IIFE-wrapped Web Component code string.
   *
   * The generated code contains:
   * 1. **Signal system** — `createSignal<T>()` and `createEffect()` functions
   *    scoped inside the IIFE to avoid global pollution.
   * 2. **Inner component class** — mirrors the original class with:
   *    - Signal-backed reactive properties (via `Object.defineProperty`).
   *    - `render()` method that sets `innerHTML` and wires up bindings.
   *    - All original methods, getters, and setters copied verbatim.
   * 3. **HTMLElement wrapper** — `${className}Element extends HTMLElement`:
   *    - Creates the inner class instance in its constructor.
   *    - Forwards `observedAttributes` / `attributeChangedCallback` for inputs.
   *    - Calls `render()` + `acOnInit()` on `connectedCallback`.
   *    - Calls `acOnDestroy()` on `disconnectedCallback`.
   *    - Manages scoped style injection with reference counting.
   * 4. **Custom element registration** — `customElements.define(selector, Element)`.
   *
   * @returns The complete IIFE code string (valid TypeScript).
   */
  private generateWebComponent(
    className: string,
    selector: string,
    templateResult: TemplateCompileResult,
    styles: string[],
    reactiveProps: ReactiveProperty[],
    nonReactiveProps: ReactiveProperty[],
    inputs: string[],
    outputs: string[],
    viewChildren: ViewChildEntry[],
    membersCode: string[],
    topLevelVars: Set<string>,
    baseClassName: string | null,
  ): string {
    const allProps = [...reactiveProps, ...nonReactiveProps].sort((a, b) => a.sourceIndex - b.sourceIndex);
    const propertyInits = allProps.map(p => `(this as any).${p.name} = ${p.init};`).join('\n');
    const outputInits = outputs.map(o =>
      `(this as any).${o} = { 
        emit: (data: any) => this.element.dispatchEvent(new CustomEvent('${o}', { detail: data, bubbles: true })),
        subscribe: (fn: (data: any) => void) => {
          const handler = (e: any) => fn(e.detail);
          this.element.addEventListener('${o}', handler);
          return { unsubscribe: () => this.element.removeEventListener('${o}', handler) };
        }
      };`,
    ).join('\n');

    const generateBindings = (bindings: Binding[], localVars: Set<string>, rootContainer: string): string[] => {
      return bindings.map(b => {
        const prefExpr = this.prefixIdentifiers(b.expression, localVars, topLevelVars);
        const targetNode =
          b.type === 'text' || b.type === 'property' || b.type === 'event'
          || b.type === 'class' || b.type === 'model' || b.type === 'style'
          || b.type === 'attribute'
            ? `${rootContainer}.querySelector('[ac-ref="${b.targetId}"]')`
            : null;

        switch (b.type) {
          case 'text':
            return `createEffect(() => { const el = ${targetNode}; if (el) el.textContent = String(${prefExpr} ?? ''); });`;

          case 'property': {
            const target = b.target!.includes('.')
              ? `['${b.target!.split('.').join("']['")}']`
              : `['${b.target}']`;
            return `createEffect(() => { const el = ${targetNode}; if (el) { const __t = (el as any).acRuntimeInstance || el; (__t as any)${target} = ${prefExpr}; } });`;
          }

          case 'attribute':
            return `createEffect(() => { const el = ${targetNode}; if (el) { const v = ${prefExpr}; if (v != null && v !== false) { el.setAttribute('${b.target}', String(v)); const __t = (el as any).acRuntimeInstance; if (__t) { const camelKey = '${b.target}'.replace(/-([a-z])/g, (_: any, c: string) => c.toUpperCase()); __t[camelKey] = v; } } else { el.removeAttribute('${b.target}'); } } });`;

          case 'event':
            return `${targetNode}?.addEventListener('${b.target}', ($event: any) => { ${prefExpr} });`;

          case 'class':
            return `createEffect(() => { const el = ${targetNode}; if (el) { if (${prefExpr}) { el.classList.add('${b.target}'); } else { el.classList.remove('${b.target}'); } } });`;

          case 'style':
            return `createEffect(() => { const el = ${targetNode}; if (el) (el as HTMLElement).style['${b.target}'] = ${prefExpr} ?? ''; });`;

          case 'model': {
            const [prop, event] = (b.target || 'value:input').split(':');
            return `(function(this: any) {
            const el = ${targetNode} as any;
            if (!el) return;
            createEffect(() => { el.${prop} = ${prefExpr}; });
            el.addEventListener('${event}', ($event: any) => { ${prefExpr} = el.${prop}; });
          }).call(this);`;
          }

          case 'if': {
            const nextLocals = new Set(localVars);
            return `(function(this: any) { 
                let currentNodes: any[] = []; 
                const placeholder = findComment(${rootContainer}, '${b.targetId}');
                createEffect(() => { 
                    const condition = ${prefExpr}; 
                    if (condition) { 
                        if (currentNodes.length === 0) { 
                            const container = document.createElement('div');
                            container.innerHTML = ${JSON.stringify(b.template)};
                            currentNodes = Array.from(container.childNodes);
                            if (placeholder && placeholder.parentNode) {
                              let lastInserted: any = placeholder;
                              currentNodes.forEach((node: any) => { lastInserted.parentNode?.insertBefore(node, lastInserted.nextSibling); lastInserted = node; }); 
                            }
                            const __parentNode = placeholder?.parentNode || ${rootContainer};
                            ${generateBindings(b.childBindings || [], nextLocals, '__parentNode').join('\n')}
                        } 
                    } else { 
                        currentNodes.forEach((node: any) => node.remove()); 
                        currentNodes = []; 
                    } 
                }); 
            }).call(this);`;
          }

          case 'for': {
            const nextLocals = new Set(localVars);
            nextLocals.add(b.itemVar!);
            nextLocals.add('index');
            return `(function(this: any) { 
                let currentMap = new Map<any, any[]>(); 
                const placeholder = findComment(${rootContainer}, '${b.targetId}');
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
                    if (placeholder && placeholder.parentNode) {
                        let lastNode: any = placeholder; 
                        list.forEach(item => { 
                            const nodes = newMap.get(item)!; 
                            nodes.forEach(n => { lastNode.parentNode?.insertBefore(n, lastNode.nextSibling); lastNode = n; }); 
                        }); 
                    }
                }); 
            }).call(this);`;
          }

          case 'template-outlet': {
            const prefixed = this.prefixIdentifiers(b.expression, localVars, topLevelVars);
            const contextExpr = b.contextExpression ? this.prefixIdentifiers(b.contextExpression, localVars, topLevelVars) : 'null';
            return `createEffect(() => {
              const __outlet = ${rootContainer}.querySelector('[ac-ref="${b.targetId}"]');
              const __tmpl: any = ${prefixed};
              const __ctx: any = ${contextExpr};
              if (__outlet && __tmpl && __tmpl.innerHTML !== undefined) {
                if ((__outlet as any).__lastTmplSrc !== __tmpl.innerHTML) {
                  (__outlet as any).__lastTmplSrc = __tmpl.innerHTML;
                  __outlet.innerHTML = __tmpl.innerHTML;
                  if (__ctx) (__outlet as any).__acContext = __ctx;
                }
              }
            });`;
          }

          default:
            return '';
        }
      });
    };

    const definedProps = new Set<string>();
    const viewChildAssignments = viewChildren.map(vc => {
      definedProps.add(vc.propName);
      // htmlparser2 lowercases attributes, so do case-insensitive lookup
      const selectorLower = vc.selector.toLowerCase();
      const internalId = templateResult.idMap[selectorLower] || templateResult.idMap[vc.selector];
      if (internalId) {
        return `Object.defineProperty(this, '${vc.propName}', { get: () => { const el = this.element.querySelector('[ac-ref="${internalId}"]'); return el ? ((el as any).acRuntimeInstance || el) : null; }, configurable: true });`;
      }
      return `console.warn('@AcViewChild: Could not find template ref #${vc.selector}');`;
    });

    // Automatically add getters for all other #refs in the template
    for (const [refName, id] of Object.entries(templateResult.idMap)) {
      if (!definedProps.has(refName)) {
        viewChildAssignments.push(`Object.defineProperty(this, '${refName}', { get: () => { const el = this.element.querySelector('[ac-ref="${id}"]'); return el ? ((el as any).acRuntimeInstance || el) : null; }, configurable: true });`);
        definedProps.add(refName);
      }
    }

    const viewChildAssignmentsCode = viewChildAssignments.join('\n');

    const hasStyles = styles.length > 0;
    let scopedStyles = '';
    if (hasStyles) {
      // Replace :host with the tag selector and wrap all styles inside the tag
      const rawStyles = styles.join('\n').replace(/:host/g, '&');
      scopedStyles = `${selector} {\n${rawStyles}\n}`;
    }
    const stylesConstant = hasStyles ? `const __styles = ${JSON.stringify(scopedStyles)};` : '';

    return `
/** Generated by AC Runtime Compiler */

export const ${className} = (function() {
  let activeEffect: (() => void) | null = null;
  const effectStack: (() => void)[] = [];
  const __allEffects: Set<{ fn: () => void; deps: Set<Set<() => void>> }> = new Set();

  /** Resolve and apply an ac-pipe transform: value | pipeName:arg1:arg2 */
  function __acPipe(value: any, pipeName: string, ...args: any[]): any {
    try {
      return (acPipeRegistry as any).getPipe({ name: pipeName }).transform(value, ...args);
    } catch {
      console.warn('[AC Runtime] Unknown pipe:', pipeName);
      return value;
    }
  }

  function createSignal<T>(value: T): [() => T, (newValue: T) => void, () => void] {
    const subscribers = new Set<() => void>();
    return [
      () => { if (activeEffect) subscribers.add(activeEffect); return value; },
      (newValue: T) => { if (value === newValue) return; value = newValue; const subs = Array.from(subscribers); for (let i = 0; i < subs.length; i++) subs[i](); },
      () => { subscribers.clear(); } // cleanup function
    ];
  }
  const __signalCleanups: (() => void)[] = [];

  function createEffect(fn: () => void) {
    const effect = () => {
      const prev = activeEffect;
      activeEffect = effect;
      effectStack.push(effect);
      try { fn(); } finally { effectStack.pop(); activeEffect = prev; }
    };
    effect();
  }

  function __destroyAllEffects() {
    __signalCleanups.length = 0;
    __allEffects.clear();
  }

  function findComment(root: any, text: string): Comment | null {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    while (walker.nextNode()) {
      if ((walker.currentNode as Comment).textContent === text) return walker.currentNode as Comment;
    }
    return null;
  }
  ${stylesConstant}
  let __styleRefCount = 0;
  let __styleElement: HTMLStyleElement | null = null;

  class ${className}${baseClassName ? ` extends ${baseClassName}` : ''} {
    static selector = '${selector}';
    element!: HTMLElement;

    constructor() {
      ${baseClassName ? 'super();' : ''}
      ${propertyInits}
      ${outputInits}
      
      // Map reactive properties to internal signals for bindings
      ${reactiveProps.map(p => {
        const isInput = inputs.includes(p.name);
        const signalSetterBody = isInput
          ? `(v: any) => { const old = ${p.name}Sig(); set${p.name}Sig(v); if ((this as any).acOnChange && old !== v) (this as any).acOnChange({ key: '${p.name}', oldValue: old, newValue: v, firstChange: false }); }`
          : `(v: any) => set${p.name}Sig(v)`;
        return `
      const [${p.name}Sig, set${p.name}Sig, cleanup${p.name}Sig] = createSignal((this as any).${p.name});
      __signalCleanups.push(cleanup${p.name}Sig);
      Object.defineProperty(this, '${p.name}', {
        get: () => ${p.name}Sig(),
        set: ${signalSetterBody},
        configurable: true
      });`;
      }).join('')}
    }

    render() {
      const self = this;
      this.element.innerHTML = ${JSON.stringify(templateResult.html)};
      ${viewChildAssignmentsCode}
      ${generateBindings(templateResult.bindings, new Set(), 'this.element').join('\n')}
    }

    __destroy() {
      // Clean up all signal subscribers
      for (let i = 0; i < __signalCleanups.length; i++) __signalCleanups[i]();
      __destroyAllEffects();
    }

    ${membersCode.join('\n\n')}
  }

  class ${className}Element extends HTMLElement {
    acRuntimeInstance: ${className};

    constructor() {
      super();
      this.acRuntimeInstance = new ${className}();
      this.acRuntimeInstance.element = this;
    }

    static get observedAttributes() { return ${JSON.stringify(inputs.map(i => i.replace(/([A-Z])/g, '-$1').toLowerCase()))}; }
    attributeChangedCallback(name: string, old: string, val: string) { if (old !== val) { const camelKey = name.replace(/-([a-z])/g, (_: any, c: string) => c.toUpperCase()); (this.acRuntimeInstance as any)[camelKey] = val; } }
    connectedCallback() {
      this.style.display = 'contents';
      const __lightNodes = Array.from(this.childNodes);
      ${hasStyles ? `
      __styleRefCount++;
      if (!__styleElement) {
        __styleElement = document.createElement('style');
        __styleElement.setAttribute('data-ac-style', '${selector}');
        __styleElement.textContent = __styles;
        document.head.appendChild(__styleElement);
      }` : ''}
      this.acRuntimeInstance.render();
      const __slot = this.querySelector('slot');
      if (__slot) {
        __slot.replaceWith(...__lightNodes);
      }
      if ((this.acRuntimeInstance as any).acOnInit) (this.acRuntimeInstance as any).acOnInit();
    }
    disconnectedCallback() {
      ${hasStyles ? `
      __styleRefCount--;
      if (__styleRefCount <= 0 && __styleElement) {
        __styleElement.remove();
        __styleElement = null;
        __styleRefCount = 0;
      }` : ''}
      if ((this.acRuntimeInstance as any).acOnDestroy) (this.acRuntimeInstance as any).acOnDestroy();
      (this.acRuntimeInstance as any).__destroy();
    }
  }

  if (!customElements.get('${selector}')) customElements.define('${selector}', ${className}Element);
  return ${className};
})();`;
  }
}
