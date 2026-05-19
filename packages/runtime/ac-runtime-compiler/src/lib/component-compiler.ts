/**
 * @module component-compiler
 *
 * Main orchestrator for the AC Runtime compiler.
 *
 * Transforms TypeScript source files containing `@AcElement`-decorated classes
 * into self-contained Web Components using an IIFE + signal-based reactivity.
 *
 * **High-level compilation flow:**
 * ```
 * TypeScript Source (.ts)
 *   │
 *   ├─ Parse with TypeScript AST
 *   ├─ Separate: imports vs component classes vs trailing code
 *   ├─ For each @AcElement component:
 *   │   ├─ Extract metadata (selector, template, styles)
 *   │   ├─ Resolve external templates/styles from disk
 *   │   ├─ Compile template → HTML + Bindings (via TemplateCompiler)
 *   │   ├─ Classify properties (reactive vs static, inputs, outputs)
 *   │   ├─ Generate IIFE code (via code-generator)
 *   │   └─ Reassemble: imports + pre-component code + IIFE + post-component
 *   └─ Return CompileResult[]
 * ```
 *
 * **This file is intentionally thin.** The actual work is delegated to:
 * - {@link TemplateCompiler} — HTML parsing and binding extraction
 * - {@link ast-helpers} — TypeScript AST utilities
 * - {@link expression-prefixer} — `this.` prefixing for template expressions
 * - {@link code-generator} — IIFE assembly
 * - {@link bindings/} — Individual binding code generators
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateCompiler } from './template-compiler.js';
import { prefixIdentifiers } from './expression-prefixer.js';
import { acGenerateCustomElement } from './code-generator.js';
import {
  isDecorator,
  getComponentMetadata,
  collectTopLevelIdentifiers,
  extractUsedIdentifiers,
} from './ast-helpers.js';
import type {
  CompileResult,
  ComponentInfo,
  ReactiveProperty,
  ViewChildEntry,
} from './types.js';

// Re-export types for backward compatibility
export type { CompileResult };

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
 * multiple files. The TemplateCompiler and TypeScript printer are created
 * once and reused across compilations.
 */
export class ComponentCompiler {
  constructor() {}

  /** Shared template compiler instance (stateless per invocation). */
  private readonly templateCompiler = new TemplateCompiler();

  /** Reusable TypeScript printer — avoids re-creation per compile call. */
  private readonly printer = ts.createPrinter({ removeComments: false });

  /**
   * Compile a TypeScript source file, extracting and transforming all
   * `@AcElement`-decorated component classes.
   *
   * @param sourceCode    - The raw TypeScript source code
   * @param filePath      - Absolute path (for template/style resolution)
   * @param resolveImport - Optional custom import path resolver
   * @returns One CompileResult per component, or a single result
   *          with `selector: null` for non-component files
   */
  compile(
    sourceCode: string,
    filePath?: string,
    resolveImport?: (originalPath: string, importerPath: string) => string,
  ): CompileResult[] {
    // ── Step 1: Parse source into a TypeScript AST ──
    const sourceFile = ts.createSourceFile(
      filePath || 'component.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true, // setParentNodes — needed for getText() calls
    );

    // ── Step 2: Categorize all top-level statements ──
    const components: ComponentInfo[] = [];
    const importStatements: string[] = [];
    const trailingStatements: { text: string; pos: number }[] = [];
    const topLevelVars = new Set<string>();

    for (const node of sourceFile.statements) {
      // Check if this is a component class
      if (ts.isClassDeclaration(node) && node.name) {
        const componentMetadata = getComponentMetadata(node);
        if (componentMetadata) {
          components.push({ node, metadata: componentMetadata });
          continue;
        }
      }

      // Collect identifiers from non-component statements
      collectTopLevelIdentifiers(node, topLevelVars);

      // Resolve import/export paths if needed
      let statement: ts.Node = node;
      const isImport = ts.isImportDeclaration(node);
      const isExport = ts.isExportDeclaration(node);

      if ((isImport || isExport) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && filePath) {
        statement = this.resolveModulePath(node, filePath, resolveImport, sourceFile);
      }

      // Print the statement and categorize it
      const printed = this.printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile);
      if (isImport || isExport) {
        importStatements.push(printed);
      } else {
        trailingStatements.push({ text: printed, pos: node.getStart() });
      }
    }

    // ── Step 3: Compile each component ──
    const importsCode = importStatements.join('\n');
    const pipeImport = `import { acPipeRegistry,evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';`;

    const compiledComponents = components.map(c => {
      // Split non-import statements into pre-component and post-component
      const componentPos = c.node.getStart();
      const preStatements: string[] = [];
      const postStatements: string[] = [];
      for (const s of trailingStatements) {
        (s.pos < componentPos ? preStatements : postStatements).push(s.text);
      }

      // Compile this component
      const compiled = this.compileComponent(
        c.node, c.metadata, sourceCode, topLevelVars, filePath,
      );

      const standardCode = `${pipeImport}\n${importsCode}\n\n${preStatements.join('\n')}\n\n${compiled.code}\n\n${postStatements.join('\n')}`;

      return {
        selector: compiled.selector,
        code: standardCode,
      };
    });

    // ── Step 4: Handle non-component files ──
    if (compiledComponents.length === 0) {
      return [{
        selector: null,
        code: `${importsCode}\n${trailingStatements.map(s => s.text).join('\n')}`,
      }];
    }

    return compiledComponents;
  }

  // ─── Component Compilation ─────────────────────────────────────────────────

  /**
   * Compile a single `@AcElement`-decorated class into a Web Component IIFE.
   *
   * Steps:
   * 1. Resolve external templates and styles from disk
   * 2. Run the template through TemplateCompiler → HTML + bindings
   * 3. Classify each property as reactive, non-reactive, input, output, viewChild
   * 4. Extract method/accessor bodies from the AST
   * 5. Generate the full IIFE code via generateWebComponent()
   */
  private compileComponent(
    node: ts.ClassDeclaration,
    metadata: { selector: string; template?: string; templateUrl?: string; styles?: string | string[]; styleUrls?: string | string[] },
    sourceCode: string,
    topLevelVars: Set<string>,
    filePath?: string,
  ): CompileResult {
    const className = node.name!.text;
    const selector = metadata.selector;

    // ── Resolve inheritance ──
    const extendsClause = node.heritageClauses?.find(
      h => h.token === ts.SyntaxKind.ExtendsKeyword,
    );
    const baseClassName = extendsClause ? extendsClause.types[0].getText() : null;

    // ── Resolve template ──
    let template = metadata.template || '';
    if (metadata.templateUrl && filePath) {
      const templatePath = path.resolve(path.dirname(filePath), metadata.templateUrl);
      if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf8');
      }
    }

    // ── Resolve styles ──
    let styles: string[] = Array.isArray(metadata.styles)
      ? metadata.styles
      : (metadata.styles ? [metadata.styles] : []);
    if (metadata.styleUrls && filePath) {
      const styleUrls = Array.isArray(metadata.styleUrls) ? metadata.styleUrls : [metadata.styleUrls];
      for (const url of styleUrls) {
        const stylePath = path.resolve(path.dirname(filePath), url);
        if (fs.existsSync(stylePath)) {
          styles.push(fs.readFileSync(stylePath, 'utf8'));
        }
      }
    }

    // ── Compile template ──
    const templateResult = this.templateCompiler.compile(template);
    const usedInTemplate = extractUsedIdentifiers(templateResult.bindings);

    // ── Classify properties ──
    const { reactiveProps, nonReactiveProps, inputs, outputs, viewChildren, membersCode } =
      this.classifyMembers(node, usedInTemplate);

    // ── Generate the custom element code ──
    const classSourceCode = node.getSourceFile() ? node.getText(node.getSourceFile()) : node.getText();
    const code = acGenerateCustomElement({
      className,
      selector,
      templateResult,
      templateHtml: template,
      styles,
      reactiveProps,
      nonReactiveProps,
      inputs,
      outputs,
      viewChildren,
      membersCode,
      topLevelVars,
      baseClassName,
      prefixFn: prefixIdentifiers,
      classSourceCode
    });

    return { selector, code };
  }

  // ─── Member Classification ─────────────────────────────────────────────────

  /**
   * Walk the class members and classify each one:
   * - Reactive properties → backed by signals (used in template or @AcInput)
   * - Non-reactive properties → plain fields (not in template)
   * - Inputs → @AcInput() decorated (always reactive)
   * - Outputs → @AcOutput() decorated (event emitters)
   * - ViewChildren → @AcViewChild() decorated (template refs)
   * - Methods/accessors → copied verbatim into generated code
   */
  private classifyMembers(node: ts.ClassDeclaration, usedInTemplate: Set<string>) {
    const inputs: string[] = [];
    const outputs: string[] = [];
    const viewChildren: ViewChildEntry[] = [];
    const reactiveProps: ReactiveProperty[] = [];
    const nonReactiveProps: ReactiveProperty[] = [];
    let memberIndex = 0;

    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
        const propName = member.name.text;
        const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
        let isInput = false;
        let isOutput = false;
        let isViewChild = false;

        // Check decorators
        if (decorators) {
          for (const d of decorators) {
            if (isDecorator(d, 'AcInput')) { inputs.push(propName); isInput = true; }
            if (isDecorator(d, 'AcOutput')) { outputs.push(propName); isOutput = true; }
            if (isDecorator(d, 'AcViewChild')) {
              const call = d.expression as ts.CallExpression;
              const viewChildSelector = (call.arguments[0] as ts.StringLiteral).text;
              viewChildren.push({ propName, selector: viewChildSelector });
              isViewChild = true;
            }
          }
        }

        const init = member.initializer ? member.initializer.getText() : 'undefined';

        if (propName === 'element') {
          // Skip — managed by the HTMLElement wrapper
        } else if (isInput || usedInTemplate.has(propName)) {
          // Reactive: used in template or marked as input
          reactiveProps.push({ name: propName, init, sourceIndex: memberIndex });
        } else if (!isOutput && !isViewChild) {
          // Non-reactive: not in template, not an output, not a viewChild
          nonReactiveProps.push({ name: propName, init, sourceIndex: memberIndex });
        }
        memberIndex++;
      }
    }

    // Extract method and accessor source code
    const membersCode = node.members
      .filter(m => ts.isMethodDeclaration(m) || ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m))
      .map(m => m.getText());

    return { reactiveProps, nonReactiveProps, inputs, outputs, viewChildren, membersCode };
  }

  // ─── Import/Export Path Resolution ─────────────────────────────────────────

  /**
   * Resolve and rewrite module specifier paths in import/export declarations.
   *
   * Handles both custom resolvers (from the Vite plugin) and relative
   * path resolution (converting `./foo` to absolute paths).
   */
  private resolveModulePath(
    node: ts.ImportDeclaration | ts.ExportDeclaration,
    filePath: string,
    resolveImport: ((originalPath: string, importerPath: string) => string) | undefined,
    sourceFile: ts.SourceFile,
  ): ts.Node {
    const originalPath = (node.moduleSpecifier as ts.StringLiteral).text;
    let newPath = originalPath;

    if (resolveImport) {
      newPath = resolveImport(originalPath, filePath);
    } else if (originalPath.startsWith('.')) {
      const absolutePath = path.resolve(path.dirname(filePath), originalPath);
      newPath = absolutePath.replace(/\\/g, '/');
    }

    if (newPath === originalPath) return node;

    if (ts.isImportDeclaration(node)) {
      return ts.factory.updateImportDeclaration(
        node, node.modifiers, node.importClause,
        ts.factory.createStringLiteral(newPath), node.assertClause,
      );
    } else {
      return ts.factory.updateExportDeclaration(
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
