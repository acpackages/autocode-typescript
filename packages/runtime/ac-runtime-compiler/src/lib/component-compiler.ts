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
  ConstructorParam,
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
    const importStatements: string[] = [];
    const orderedStatements: { text: string; isComponent: boolean; selector?: string; compiled?: any }[] = [];
    const topLevelVars = new Set<string>();

    for (const node of sourceFile.statements) {
      // Check if this is a component class
      if (ts.isClassDeclaration(node) && node.name) {
        const componentMetadata = getComponentMetadata(node);
        if (componentMetadata) {
          // Compile this component
          const compiled = this.compileComponent(
            node, componentMetadata, sourceCode, topLevelVars, filePath, resolveImport
          );
          orderedStatements.push({
            text: compiled.code,
            isComponent: true,
            selector: componentMetadata.selector,
            compiled
          });
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
        orderedStatements.push({ text: printed, isComponent: false });
      }
    }

    // ── Step 3: Compile and assemble code ──
    const importsCode = importStatements.join('\n');
    const pipeImport = `import { acPipeRegistry,evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';`;
    const acElementImport = `import { AcRuntimeElement,AcRuntimeElementEvent,AcElementRenderer,AcElementLoopRenderer } from '@autocode-ts/ac-runtime';`;

    const bodyCode = orderedStatements.map(s => s.text).join('\n\n');
    const combinedCode = `${pipeImport}\n${acElementImport}\n${importsCode}\n\n${bodyCode}`;

    const componentOutputs = orderedStatements.filter(s => s.isComponent);

    // ── Step 4: Handle non-component files ──
    if (componentOutputs.length === 0) {
      return [{
        selector: null,
        code: `${importsCode}\n${orderedStatements.map(s => s.text).join('\n')}`,
      }];
    }

    return componentOutputs.map(c => ({
      selector: c.selector!,
      code: combinedCode,
      subscribeChanges: c.compiled.subscribeChanges,
      listenChanges: c.compiled.listenChanges,
    }));
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
    resolveImport?: (originalPath: string, importerPath: string) => string,
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
    const classProperties = this.collectClassProperties(node, filePath);
    const resolvedConstants = this.collectResolvedConstants(node.getSourceFile(), filePath, resolveImport);
    const templateResult = this.templateCompiler.compile(template, new Set(), classProperties, topLevelVars, resolvedConstants);
    const usedInTemplate = extractUsedIdentifiers(templateResult.bindings);

    // ── Classify properties ──
    const { reactiveProps, nonReactiveProps, inputs, outputs, viewChildren, subscribeChanges, listenChanges, membersCode } =
      this.classifyMembers(node, usedInTemplate, filePath, resolveImport);

    // ── Merge base class decorated members ──
    if (baseClassName && filePath) {
      const baseMembers = this.resolveBaseClassMembers(
        baseClassName, node.getSourceFile(), filePath,
      );
      if (baseMembers) {
        for (const input of baseMembers.inputs) {
          if (!inputs.includes(input)) inputs.push(input);
        }
        for (const output of baseMembers.outputs) {
          if (!outputs.includes(output)) outputs.push(output);
        }
        for (const vc of baseMembers.viewChildren) {
          if (!viewChildren.some(v => v.propName === vc.propName)) viewChildren.push(vc);
        }
      }
    }

    // Attach class-level metadata to templateResult so element renderer can use it
    templateResult.inputs = inputs;
    templateResult.outputs = outputs;
    templateResult.viewChildren = viewChildren;
    templateResult.subscribeChanges = subscribeChanges;
    templateResult.listenChanges = listenChanges;

    // ── Extract constructor parameters ──
    const constructorParams = this.extractConstructorParams(node);

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
      classSourceCode,
      constructorParams
    });

    return { selector, code, subscribeChanges, listenChanges };
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
  private classifyMembers(
    node: ts.ClassDeclaration,
    usedInTemplate: Set<string>,
    filePath?: string,
    resolveImport?: (originalPath: string, importerPath: string) => string,
  ) {
    const inputs: string[] = [];
    const outputs: string[] = [];
    const viewChildren: ViewChildEntry[] = [];
    const reactiveProps: ReactiveProperty[] = [];
    const nonReactiveProps: ReactiveProperty[] = [];
    const subscribeChanges: { methodName: string; keys: string[] }[] = [];
    const listenChanges: string[] = [];
    let memberIndex = 0;

    for (const member of node.members) {
      if (member.name && ts.isIdentifier(member.name)) {
        const propName = member.name.text;
        const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
        if (decorators) {
          for (const d of decorators) {
            // @AcSubscribeChange is only valid on method declarations
            if (isDecorator(d, 'AcSubscribeChange') && ts.isMethodDeclaration(member)) {
              const call = d.expression as ts.CallExpression;
              const arg = call.arguments[0];
              const keys: string[] = [];
              if (arg) {
                keys.push(...resolveExpressionValue(arg, node.getSourceFile(), filePath, resolveImport));
              }
              subscribeChanges.push({ methodName: propName, keys });
            }
            // @AcListenChanges is only valid on property declarations
            if (isDecorator(d, 'AcListenChanges') && ts.isPropertyDeclaration(member)) {
              const call = d.expression as ts.CallExpression;
              const arg = call.arguments[0];
              const keys: string[] = [];
              if (arg) {
                keys.push(...resolveExpressionValue(arg, node.getSourceFile(), filePath, resolveImport));
              }
              if (keys.length === 0) {
                keys.push(propName);
              }
              listenChanges.push(...keys);
            }
          }
        }
      }

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

    return { reactiveProps, nonReactiveProps, inputs, outputs, viewChildren, subscribeChanges, listenChanges, membersCode };
  }

  // ─── Constructor Parameter Extraction ────────────────────────────────────────

  /**
   * Extract constructor parameters and their type annotations from a class.
   *
   * Inspects the class's constructor declaration (if present) and returns
   * an array of parameter descriptors. The code generator uses these to
   * determine what arguments to pass when instantiating the component class.
   *
   * For example, a constructor like:
   * ```ts
   * constructor(private element: AcRuntimeElement) {}
   * ```
   * yields `[{ name: 'element', typeName: 'AcRuntimeElement' }]`.
   */
  private extractConstructorParams(node: ts.ClassDeclaration): ConstructorParam[] {
    const params: ConstructorParam[] = [];

    for (const member of node.members) {
      if (ts.isConstructorDeclaration(member)) {
        for (const param of member.parameters) {
          const paramName = ts.isIdentifier(param.name) ? param.name.text : param.name.getText();
          let typeName: string | null = null;

          if (param.type && ts.isTypeReferenceNode(param.type) && ts.isIdentifier(param.type.typeName)) {
            typeName = param.type.typeName.text;
          }

          params.push({ name: paramName, typeName });
        }
        break; // Only one constructor per class
      }
    }

    return params;
  }

  // ─── Base Class Member Resolution ───────────────────────────────────────────

  /**
   * Resolve decorated members (@AcInput, @AcOutput, @AcViewChild) from a base
   * class by locating its source file, parsing it, and scanning its members.
   *
   * Only resolves relative imports (e.g., `./base-class`). Package imports
   * (e.g., `@autocode-ts/ac-runtime`) are skipped — their members are assumed
   * to be framework-internal and not user-level inputs/outputs.
   *
   * Recurses if the base class itself extends another class.
   */
  private resolveBaseClassMembers(
    baseClassName: string,
    sourceFile: ts.SourceFile,
    filePath: string,
  ): { inputs: string[]; outputs: string[]; viewChildren: ViewChildEntry[] } | null {
    // ── Find the import that brings in the base class ──
    let moduleSpecifierText: string | null = null;
    for (const stmt of sourceFile.statements) {
      if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
      const namedBindings = stmt.importClause.namedBindings;
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        for (const specifier of namedBindings.elements) {
          if (specifier.name.text === baseClassName) {
            moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
            break;
          }
        }
      }
      // Also check default imports: `import BaseClass from './base'`
      if (!moduleSpecifierText && stmt.importClause.name?.text === baseClassName) {
        moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
      }
      if (moduleSpecifierText) break;
    }

    // Only resolve relative imports
    if (!moduleSpecifierText || !moduleSpecifierText.startsWith('.')) return null;

    // ── Resolve the absolute file path ──
    const dir = path.dirname(filePath);
    let baseFilePath = path.resolve(dir, moduleSpecifierText);

    // Try adding .ts extension if the path has no extension
    if (!fs.existsSync(baseFilePath) && !path.extname(baseFilePath)) {
      baseFilePath = baseFilePath + '.ts';
    }
    if (!fs.existsSync(baseFilePath)) return null;

    // ── Parse the base class source file ──
    const baseSource = fs.readFileSync(baseFilePath, 'utf8');
    const baseSourceFile = ts.createSourceFile(
      baseFilePath, baseSource, ts.ScriptTarget.Latest, true,
    );

    // ── Find the class declaration matching baseClassName ──
    for (const stmt of baseSourceFile.statements) {
      if (!ts.isClassDeclaration(stmt) || stmt.name?.text !== baseClassName) continue;

      const inputs: string[] = [];
      const outputs: string[] = [];
      const viewChildren: ViewChildEntry[] = [];

      // Scan members for @AcInput, @AcOutput, @AcViewChild decorators
      for (const member of stmt.members) {
        if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) continue;
        const propName = member.name.text;
        const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
        if (!decorators) continue;

        for (const d of decorators) {
          if (isDecorator(d, 'AcInput')) inputs.push(propName);
          if (isDecorator(d, 'AcOutput')) outputs.push(propName);
          if (isDecorator(d, 'AcViewChild')) {
            const call = d.expression as ts.CallExpression;
            const viewChildSelector = (call.arguments[0] as ts.StringLiteral).text;
            viewChildren.push({ propName, selector: viewChildSelector });
          }
        }
      }

      // ── Recurse if this base class also extends another class ──
      const extendsClause = stmt.heritageClauses?.find(
        h => h.token === ts.SyntaxKind.ExtendsKeyword,
      );
      if (extendsClause) {
        const grandBaseClassName = extendsClause.types[0].expression.getText(baseSourceFile);
        const grandBaseMembers = this.resolveBaseClassMembers(
          grandBaseClassName, baseSourceFile, baseFilePath,
        );
        if (grandBaseMembers) {
          inputs.push(...grandBaseMembers.inputs);
          outputs.push(...grandBaseMembers.outputs);
          viewChildren.push(...grandBaseMembers.viewChildren);
        }
      }

      return { inputs, outputs, viewChildren };
    }

    return null;
  }

  private collectClassProperties(
    node: ts.ClassDeclaration,
    filePath?: string,
  ): { instanceProps: Set<string>; staticProps: Set<string> } {
    const instanceProps = new Set<string>();
    const staticProps = new Set<string>();

    const collectFromClassNode = (cls: ts.ClassDeclaration) => {
      for (const member of cls.members) {
        if (member.name && ts.isIdentifier(member.name)) {
          const propName = member.name.text;
          const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
          const isStatic = modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
          if (isStatic) {
            staticProps.add(propName);
          } else {
            instanceProps.add(propName);
          }
        }
      }
    };

    collectFromClassNode(node);

    // If there is inheritance, resolve base class properties recursively
    const resolveBaseProperties = (className: string, sourceFile: ts.SourceFile, currentPath: string) => {
      let moduleSpecifierText: string | null = null;
      for (const stmt of sourceFile.statements) {
        if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
        const namedBindings = stmt.importClause.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
          for (const specifier of namedBindings.elements) {
            if (specifier.name.text === className) {
              moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
              break;
            }
          }
        }
        if (!moduleSpecifierText && stmt.importClause.name?.text === className) {
          moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
        }
        if (moduleSpecifierText) break;
      }

      if (!moduleSpecifierText || !moduleSpecifierText.startsWith('.')) return;

      const dir = path.dirname(currentPath);
      let baseFilePath = path.resolve(dir, moduleSpecifierText);
      if (!fs.existsSync(baseFilePath) && !path.extname(baseFilePath)) {
        baseFilePath = baseFilePath + '.ts';
      }
      if (!fs.existsSync(baseFilePath)) return;

      const baseSource = fs.readFileSync(baseFilePath, 'utf8');
      const baseSourceFile = ts.createSourceFile(baseFilePath, baseSource, ts.ScriptTarget.Latest, true);

      for (const stmt of baseSourceFile.statements) {
        if (!ts.isClassDeclaration(stmt) || stmt.name?.text !== className) continue;

        collectFromClassNode(stmt);

        const extendsClause = stmt.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause) {
          const grandBaseClassName = extendsClause.types[0].expression.getText(baseSourceFile);
          resolveBaseProperties(grandBaseClassName, baseSourceFile, baseFilePath);
        }
        break;
      }
    };

    const extendsClause = node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
    if (extendsClause && filePath) {
      const baseClassName = extendsClause.types[0].expression.getText(node.getSourceFile());
      resolveBaseProperties(baseClassName, node.getSourceFile(), filePath);
    }

    return { instanceProps, staticProps };
  }

  // ─── Resolved Constants Collection ──────────────────────────────────────────

  /**
   * Scan the source file for enum declarations, static class properties,
   * and top-level const variables that resolve to string literal values.
   *
   * Returns a map from the source-level access expression (e.g.
   * `TblActTaxParts.IsActive`) to the resolved string value (e.g. `is_active`).
   *
   * The template compiler uses this map to resolve element-access
   * bracket expressions like `record[TblActTaxParts.IsActive]` into
   * the correct reactive property paths (`record.is_active`).
   */
  private collectResolvedConstants(
    sourceFile: ts.SourceFile,
    filePath?: string,
    resolveImport?: (originalPath: string, importerPath: string) => string,
  ): Record<string, string> {
    const constants: Record<string, string> = {};

    const processSourceFile = (sf: ts.SourceFile) => {
      for (const stmt of sf.statements) {
        // Enum declarations: enum Foo { Bar = 'baz' } → 'Foo.Bar' → 'baz'
        if (ts.isEnumDeclaration(stmt)) {
          const enumName = stmt.name.text;
          for (const member of stmt.members) {
            if (member.name && ts.isIdentifier(member.name)) {
              const memberName = member.name.text;
              const key = `${enumName}.${memberName}`;
              if (member.initializer && ts.isStringLiteral(member.initializer)) {
                constants[key] = member.initializer.text;
              } else {
                // Enum member without string initializer — use the member name itself
                constants[key] = memberName;
              }
            }
          }
        }

        // Static class properties: class Foo { static Bar = 'baz' } → 'Foo.Bar' → 'baz'
        if (ts.isClassDeclaration(stmt) && stmt.name) {
          const className = stmt.name.text;
          for (const member of stmt.members) {
            if (
              ts.isPropertyDeclaration(member) &&
              member.name &&
              ts.isIdentifier(member.name)
            ) {
              const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
              const isStatic = modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
              if (isStatic && member.initializer && ts.isStringLiteral(member.initializer)) {
                constants[`${className}.${member.name.text}`] = member.initializer.text;
              }
            }
          }
        }

        // Top-level const variables: const FOO = 'bar' → 'FOO' → 'bar'
        if (ts.isVariableStatement(stmt)) {
          const isConst = (stmt.declarationList.flags & ts.NodeFlags.Const) !== 0;
          if (isConst) {
            for (const decl of stmt.declarationList.declarations) {
              if (
                ts.isIdentifier(decl.name) &&
                decl.initializer &&
                ts.isStringLiteral(decl.initializer)
              ) {
                constants[decl.name.text] = decl.initializer.text;
              }
            }
          }
        }
      }
    };

    // Process the current source file
    processSourceFile(sourceFile);

    // Also resolve imported enums/classes/consts from local imports
    if (filePath) {
      for (const stmt of sourceFile.statements) {
        if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
        if (!stmt.moduleSpecifier || !ts.isStringLiteral(stmt.moduleSpecifier)) continue;
        const moduleSpec = stmt.moduleSpecifier.text;
        if (!moduleSpec.startsWith('.')) continue;

        // Collect imported names to know what to look for
        const importedNames = new Set<string>();
        const namedBindings = stmt.importClause.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
          for (const specifier of namedBindings.elements) {
            importedNames.add(specifier.name.text);
          }
        }
        if (stmt.importClause.name) {
          importedNames.add(stmt.importClause.name.text);
        }
        if (importedNames.size === 0) continue;

        // Resolve the import path
        const dir = path.dirname(filePath);
        let absolutePath = path.resolve(dir, moduleSpec);
        if (!fs.existsSync(absolutePath) && !path.extname(absolutePath)) {
          absolutePath = absolutePath + '.ts';
        }
        if (!fs.existsSync(absolutePath)) continue;

        try {
          const externalSource = fs.readFileSync(absolutePath, 'utf8');
          const externalSF = ts.createSourceFile(
            absolutePath, externalSource, ts.ScriptTarget.Latest, true,
          );
          processSourceFile(externalSF);
        } catch {
          // skip unreadable files
        }
      }
    }

    return constants;
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

function searchInSourceFile(objName: string, propName: string, sourceFile: ts.SourceFile): string | null {
  for (const stmt of sourceFile.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name?.text === objName) {
      for (const member of stmt.members) {
        if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name) && member.name.text === propName) {
          const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
          const isStatic = modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
          if (isStatic && member.initializer && ts.isStringLiteral(member.initializer)) {
            return member.initializer.text;
          }
        }
      }
    }
    if (ts.isEnumDeclaration(stmt) && stmt.name.text === objName) {
      for (const member of stmt.members) {
        if (member.name && ts.isIdentifier(member.name) && member.name.text === propName) {
          if (member.initializer && ts.isStringLiteral(member.initializer)) {
            return member.initializer.text;
          }
          return member.name.text;
        }
      }
    }
  }
  return null;
}

function findStaticOrEnumValue(
  objName: string,
  propName: string,
  sourceFile: ts.SourceFile,
  filePath?: string,
  resolveImport?: (originalPath: string, importerPath: string) => string
): string | null {
  const value = searchInSourceFile(objName, propName, sourceFile);
  if (value !== null) return value;

  if (!filePath) return null;
  let moduleSpecifierText: string | null = null;

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const namedBindings = stmt.importClause.namedBindings;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const specifier of namedBindings.elements) {
        if (specifier.name.text === objName) {
          moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
          break;
        }
      }
    }
    if (!moduleSpecifierText && stmt.importClause.name?.text === objName) {
      moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
    }
    if (moduleSpecifierText) break;
  }

  if (!moduleSpecifierText || !moduleSpecifierText.startsWith('.')) return null;

  const dir = path.dirname(filePath);
  let absolutePath = path.resolve(dir, moduleSpecifierText);
  if (!fs.existsSync(absolutePath) && !path.extname(absolutePath)) {
    absolutePath = absolutePath + '.ts';
  }
  if (!fs.existsSync(absolutePath)) return null;

  try {
    const externalSource = fs.readFileSync(absolutePath, 'utf8');
    const externalSourceFile = ts.createSourceFile(
      absolutePath, externalSource, ts.ScriptTarget.Latest, true
    );
    return searchInSourceFile(objName, propName, externalSourceFile);
  } catch (e) {
    return null;
  }
}

function searchVarInSourceFile(name: string, sourceFile: ts.SourceFile): string | null {
  for (const stmt of sourceFile.statements) {
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === name) {
          if (decl.initializer && ts.isStringLiteral(decl.initializer)) {
            return decl.initializer.text;
          }
        }
      }
    }
  }
  return null;
}

function findVariableOrConstantValue(
  name: string,
  sourceFile: ts.SourceFile,
  filePath?: string,
  resolveImport?: (originalPath: string, importerPath: string) => string
): string | null {
  const value = searchVarInSourceFile(name, sourceFile);
  if (value !== null) return value;

  if (!filePath) return null;
  let moduleSpecifierText: string | null = null;

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const namedBindings = stmt.importClause.namedBindings;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const specifier of namedBindings.elements) {
        if (specifier.name.text === name) {
          moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
          break;
        }
      }
    }
    if (!moduleSpecifierText && stmt.importClause.name?.text === name) {
      moduleSpecifierText = (stmt.moduleSpecifier as ts.StringLiteral).text;
    }
    if (moduleSpecifierText) break;
  }

  if (!moduleSpecifierText || !moduleSpecifierText.startsWith('.')) return null;

  const dir = path.dirname(filePath);
  let absolutePath = path.resolve(dir, moduleSpecifierText);
  if (!fs.existsSync(absolutePath) && !path.extname(absolutePath)) {
    absolutePath = absolutePath + '.ts';
  }
  if (!fs.existsSync(absolutePath)) return null;

  try {
    const externalSource = fs.readFileSync(absolutePath, 'utf8');
    const externalSourceFile = ts.createSourceFile(
      absolutePath, externalSource, ts.ScriptTarget.Latest, true
    );
    return searchVarInSourceFile(name, externalSourceFile);
  } catch (e) {
    return null;
  }
}

function resolveExpressionValue(
  node: ts.Expression,
  sourceFile: ts.SourceFile,
  filePath?: string,
  resolveImport?: (originalPath: string, importerPath: string) => string
): string[] {
  if (ts.isStringLiteral(node)) {
    return [node.text];
  }
  if (ts.isArrayLiteralExpression(node)) {
    const keys: string[] = [];
    for (const el of node.elements) {
      keys.push(...resolveExpressionValue(el, sourceFile, filePath, resolveImport));
    }
    return keys;
  }
  if (ts.isIdentifier(node)) {
    const name = node.text;
    const value = findVariableOrConstantValue(name, sourceFile, filePath, resolveImport);
    if (value) return [value];
  }
  if (ts.isPropertyAccessExpression(node)) {
    if (ts.isIdentifier(node.expression)) {
      const objName = node.expression.text;
      const propName = ts.isIdentifier(node.name) ? node.name.text : node.name.getText(sourceFile);
      const value = findStaticOrEnumValue(objName, propName, sourceFile, filePath, resolveImport);
      if (value) return [value];
    }
  }
  return [];
}
