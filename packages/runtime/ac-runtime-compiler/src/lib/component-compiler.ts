/* eslint-disable prefer-const */
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
  ConstructorParam,
  ReactiveProperty,
  ViewChildEntry,
  ComponentMetadata,
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

    // Cache the root source file to make sure recursive lookups find the in-memory version
    if (filePath) {
      const normalizedPath = path.resolve(filePath).replace(/\\/g, '/');
      sourceFileCache.set(normalizedPath, sourceFile);
    }

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
    const acElementImport = `import { AcRuntimeElement,AcRuntimeInputElement,AcRuntimeElementEvent,AcElementRenderer,AcElementArrayRenderer } from '@autocode-ts/ac-runtime';`;

    const bodyCode = orderedStatements.map(s => s.text).join('\n\n');
    let cleanedImportsCode = importsCode;
    cleanedImportsCode = cleanedImportsCode.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@autocode-ts\/ac-runtime['"]/g, (match, importsStr) => {
      let parts = importsStr.split(',').map((p: string) => p.trim());
      parts = parts.filter((p: string) => p !== 'AcRuntimeElement' && p !== 'AcRuntimeElementEvent' && p !== 'AcElementRenderer' && p !== 'AcElementArrayRenderer' && p !== '');
      if (parts.length === 0) {
        return '';
      }
      return `import { ${parts.join(', ')} } from '@autocode-ts/ac-runtime';`;
    });
    const combinedCode = `${pipeImport}\n${acElementImport}\n${cleanedImportsCode}\n\n${bodyCode}`;

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
    metadata: ComponentMetadata,
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

    // ── Merge base class decorated members and properties ──
    if (baseClassName && filePath) {
      const baseMembers = this.resolveBaseClassMembers(
        baseClassName, node.getSourceFile(), filePath, resolveImport,
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
        // Merge parent @AcSubscribeChange entries
        for (const sc of baseMembers.subscribeChanges) {
          if (!subscribeChanges.some(s => s.methodName === sc.methodName)) {
            subscribeChanges.push(sc);
          }
        }
        // Merge parent @AcListenChanges keys
        for (const key of baseMembers.listenChanges) {
          if (!listenChanges.includes(key)) listenChanges.push(key);
        }
        // Merge parent class properties into reactive/nonReactive
        const childPropNames = new Set([
          ...reactiveProps.map(p => p.name),
          ...nonReactiveProps.map(p => p.name),
          ...outputs,
          ...viewChildren.map(v => v.propName),
        ]);
        for (const baseProp of baseMembers.properties) {
          if (childPropNames.has(baseProp.name) || baseProp.name === 'element') continue;
          const memberIndex = reactiveProps.length + nonReactiveProps.length;
          if (inputs.includes(baseProp.name) || usedInTemplate.has(baseProp.name)) {
            reactiveProps.push({ name: baseProp.name, init: baseProp.init, sourceIndex: memberIndex });
          } else {
            nonReactiveProps.push({ name: baseProp.name, init: baseProp.init, sourceIndex: memberIndex });
          }
        }
      }
    }

    // Attach class-level metadata to templateResult so element renderer can use it
    templateResult.inputs = inputs;
    templateResult.outputs = outputs;
    templateResult.viewChildren = viewChildren;
    templateResult.subscribeChanges = subscribeChanges;
    templateResult.listenChanges = listenChanges;

    // Resolve elementRefId for each viewChild from the template's idMap
    for (const vc of viewChildren) {
      const selectorLower = vc.selector.toLowerCase();
      const resolvedId = templateResult.idMap[selectorLower] || templateResult.idMap[vc.selector];
      if (resolvedId) {
        vc.elementRefId = resolvedId;
      }
    }

    // Enrich viewChildren bindings with propertyName from @AcViewChild entries
    for (const binding of templateResult.bindings) {
      if (binding.type === 'viewChildren' && binding.selector) {
        const matchingVc = viewChildren.find(
          vc => vc.selector === binding.selector || vc.selector.toLowerCase() === binding.selector!.toLowerCase()
        );
        if (matchingVc) {
          binding.propertyName = matchingVc.propName;
        }
      }
    }

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
      constructorParams,
      formAssociated: metadata.formAssociated
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
    const processedPropNames = new Set<string>();

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
            // @AcListenChanges is only valid on property declarations and accessors
            if (
              isDecorator(d, 'AcListenChanges') &&
              (ts.isPropertyDeclaration(member) ||
                ts.isGetAccessorDeclaration(member) ||
                ts.isSetAccessorDeclaration(member))
            ) {
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

      if (
        (ts.isPropertyDeclaration(member) ||
          ts.isGetAccessorDeclaration(member) ||
          ts.isSetAccessorDeclaration(member)) &&
        ts.isIdentifier(member.name)
      ) {
        const propName = member.name.text;

        if (processedPropNames.has(propName)) {
          // If we have already processed this name, we might still have decorators on this accessor
          const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
          if (decorators) {
            for (const d of decorators) {
              if (isDecorator(d, 'AcInput') && !inputs.includes(propName)) {
                inputs.push(propName);
                // Since it's now an input, it must be reactive. If it was classified as non-reactive, move it.
                const nonReactiveIdx = nonReactiveProps.findIndex(p => p.name === propName);
                if (nonReactiveIdx !== -1) {
                  const [removed] = nonReactiveProps.splice(nonReactiveIdx, 1);
                  reactiveProps.push(removed);
                }
              }
              if (isDecorator(d, 'AcOutput') && !outputs.includes(propName)) {
                outputs.push(propName);
              }
            }
          }
          continue;
        }

        processedPropNames.add(propName);

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

        const init = (ts.isPropertyDeclaration(member) && member.initializer)
          ? member.initializer.getText()
          : 'undefined';

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
   * Resolve decorated members (@AcInput, @AcOutput, @AcViewChild, @AcSubscribeChange, @AcListenChanges)
   * from a base class by locating its source file, parsing it, and scanning its members.
   *
   * Handles two cases:
   * 1. Base class declared in the SAME source file (no import needed — e.g. a local mixin class).
   * 2. Base class imported from a relative file (e.g. `./base-class`).
   *
   * Package imports (e.g. `@autocode-ts/ac-runtime`) are skipped — their members are
   * assumed to be framework-internal and not user-level inputs/outputs.
   *
   * Recurses if the base class itself extends another class.
   */
  private resolveBaseClassMembers(
    baseClassName: string,
    sourceFile: ts.SourceFile,
    filePath: string,
    resolveImport?: (originalPath: string, importerPath: string) => string,
  ): { inputs: string[]; outputs: string[]; viewChildren: ViewChildEntry[]; subscribeChanges: { methodName: string; keys: string[] }[]; listenChanges: string[]; properties: { name: string; init: string }[] } | null {
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

    // ── If no import found, the base class may be declared in the same source file ──
    if (!moduleSpecifierText) {
      return this.scanClassDeclaration(baseClassName, sourceFile, filePath, resolveImport);
    }

    // Only resolve relative imports (skip package imports like '@autocode-ts/ac-runtime')
    if (!moduleSpecifierText.startsWith('.')) return null;

    // ── Resolve the absolute file path ──
    const dir = path.dirname(filePath);
    let baseFilePath = path.resolve(dir, moduleSpecifierText);

    // Try adding .ts extension if the file doesn't exist
    if (!fs.existsSync(baseFilePath)) {
      const withTs = baseFilePath + '.ts';
      if (fs.existsSync(withTs)) {
        baseFilePath = withTs;
      }
    }
    if (!fs.existsSync(baseFilePath)) return null;

    // ── Parse the external source file and scan it ──
    const baseSource = fs.readFileSync(baseFilePath, 'utf8');
    const baseSourceFile = ts.createSourceFile(
      baseFilePath, baseSource, ts.ScriptTarget.Latest, true,
    );

    return this.scanClassDeclaration(baseClassName, baseSourceFile, baseFilePath, resolveImport);
  }

  /**
   * Scan a parsed source file for a class declaration matching `className` and
   * collect all decorated members plus instance property initializers.
   * Recurses into the class's own base class chain via resolveBaseClassMembers.
   */
  private scanClassDeclaration(
    className: string,
    sourceFile: ts.SourceFile,
    filePath: string,
    resolveImport?: (originalPath: string, importerPath: string) => string,
  ): { inputs: string[]; outputs: string[]; viewChildren: ViewChildEntry[]; subscribeChanges: { methodName: string; keys: string[] }[]; listenChanges: string[]; properties: { name: string; init: string }[] } | null {
    for (const stmt of sourceFile.statements) {
      if (!ts.isClassDeclaration(stmt) || stmt.name?.text !== className) continue;

      const inputs: string[] = [];
      const outputs: string[] = [];
      const viewChildren: ViewChildEntry[] = [];
      const subscribeChanges: { methodName: string; keys: string[] }[] = [];
      const listenChanges: string[] = [];
      const properties: { name: string; init: string }[] = [];

      const collectedPropNames = new Set<string>();
      for (const member of stmt.members) {
        if (!member.name || !ts.isIdentifier(member.name)) continue;
        const propName = member.name.text;

        // Check @AcSubscribeChange on method declarations
        if (ts.isMethodDeclaration(member)) {
          const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
          if (decorators) {
            for (const d of decorators) {
              if (isDecorator(d, 'AcSubscribeChange')) {
                const call = d.expression as ts.CallExpression;
                const arg = call.arguments[0];
                const keys: string[] = [];
                if (arg) {
                  keys.push(...resolveExpressionValue(arg, sourceFile, filePath, resolveImport));
                }
                subscribeChanges.push({ methodName: propName, keys });
              }
            }
          }
        }

        // Check decorators on properties and accessors
        if (
          ts.isPropertyDeclaration(member) ||
          ts.isGetAccessorDeclaration(member) ||
          ts.isSetAccessorDeclaration(member)
        ) {
          const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;

          if (decorators) {
            for (const d of decorators) {
              if (isDecorator(d, 'AcInput')) inputs.push(propName);
              if (isDecorator(d, 'AcOutput')) outputs.push(propName);
              if (isDecorator(d, 'AcViewChild')) {
                const call = d.expression as ts.CallExpression;
                const viewChildSelector = (call.arguments[0] as ts.StringLiteral).text;
                viewChildren.push({ propName, selector: viewChildSelector });
              }
              // Check @AcListenChanges on property/accessor declarations
              if (isDecorator(d, 'AcListenChanges')) {
                const call = d.expression as ts.CallExpression;
                const arg = call.arguments[0];
                const keys: string[] = [];
                if (arg) {
                  keys.push(...resolveExpressionValue(arg, sourceFile, filePath, resolveImport));
                }
                if (keys.length === 0) {
                  keys.push(propName);
                }
                listenChanges.push(...keys);
              }
            }
          }

          // Collect the property/accessor (with initializer) regardless of decorators
          if (!collectedPropNames.has(propName)) {
            const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
            const isStatic = modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
            if (!isStatic) {
              const init = (ts.isPropertyDeclaration(member) && member.initializer)
                ? member.initializer.getText(sourceFile)
                : 'undefined';
              properties.push({ name: propName, init });
              collectedPropNames.add(propName);
            }
          }
        }
      }

      // ── Recurse if this base class also extends another class ──
      const extendsClause = stmt.heritageClauses?.find(
        h => h.token === ts.SyntaxKind.ExtendsKeyword,
      );
      if (extendsClause) {
        const grandBaseClassName = extendsClause.types[0].expression.getText(sourceFile);
        const grandBaseMembers = this.resolveBaseClassMembers(
          grandBaseClassName, sourceFile, filePath, resolveImport,
        );
        if (grandBaseMembers) {
          inputs.push(...grandBaseMembers.inputs);
          outputs.push(...grandBaseMembers.outputs);
          viewChildren.push(...grandBaseMembers.viewChildren);
          for (const sc of grandBaseMembers.subscribeChanges) {
            if (!subscribeChanges.some(s => s.methodName === sc.methodName)) {
              subscribeChanges.push(sc);
            }
          }
          for (const key of grandBaseMembers.listenChanges) {
            if (!listenChanges.includes(key)) listenChanges.push(key);
          }
          properties.push(...grandBaseMembers.properties);
        }
      }

      return { inputs, outputs, viewChildren, subscribeChanges, listenChanges, properties };
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
      if (!fs.existsSync(baseFilePath)) {
        const withTs = baseFilePath + '.ts';
        if (fs.existsSync(withTs)) {
          baseFilePath = withTs;
        }
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

    // Helper to add constants from a class or enum declaration under a prefix (e.g. "ActVwSaleInvoices")
    const addClassOrEnumConstants = (prefix: string, decl: ts.Declaration) => {
      if (ts.isClassDeclaration(decl)) {
        for (const member of decl.members) {
          if (
            ts.isPropertyDeclaration(member) &&
            member.name &&
            ts.isIdentifier(member.name)
          ) {
            const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
            const isStatic = modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
            if (isStatic && member.initializer && ts.isStringLiteral(member.initializer)) {
              constants[`${prefix}.${member.name.text}`] = member.initializer.text;
            }
          }
        }
      } else if (ts.isEnumDeclaration(decl)) {
        for (const member of decl.members) {
          if (member.name && ts.isIdentifier(member.name)) {
            const memberName = member.name.text;
            if (member.initializer && ts.isStringLiteral(member.initializer)) {
              constants[`${prefix}.${memberName}`] = member.initializer.text;
            } else {
              constants[`${prefix}.${memberName}`] = memberName;
            }
          }
        }
      }
    };

    // Helper to add constants from a variable declaration
    const addVariableConstant = (name: string, decl: ts.Declaration) => {
      if (ts.isVariableDeclaration(decl)) {
        if (decl.initializer && ts.isStringLiteral(decl.initializer)) {
          constants[name] = decl.initializer.text;
        }
      }
    };

    // 1. Process all local declarations in the current sourceFile
    for (const stmt of sourceFile.statements) {
      if (ts.isClassDeclaration(stmt) && stmt.name) {
        addClassOrEnumConstants(stmt.name.text, stmt);
      } else if (ts.isEnumDeclaration(stmt)) {
        addClassOrEnumConstants(stmt.name.text, stmt);
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            addVariableConstant(decl.name.text, decl);
          }
        }
      }
    }

    // 2. Process all imports
    if (filePath) {
      for (const stmt of sourceFile.statements) {
        if (ts.isImportDeclaration(stmt) && stmt.importClause) {
          const specifier = stmt.moduleSpecifier;
          if (ts.isStringLiteral(specifier)) {
            const modulePath = specifier.text;

            // Named imports
            const namedBindings = stmt.importClause.namedBindings;
            if (namedBindings && ts.isNamedImports(namedBindings)) {
              for (const element of namedBindings.elements) {
                const localName = element.name.text;
                // Resolve the symbol
                const resolved = resolveSymbol(localName, sourceFile, filePath, resolveImport);
                if (resolved) {
                  addClassOrEnumConstants(localName, resolved.node);
                  addVariableConstant(localName, resolved.node);
                }
              }
            }

            // Default import
            if (stmt.importClause.name) {
              const localName = stmt.importClause.name.text;
              const resolved = resolveSymbol(localName, sourceFile, filePath, resolveImport);
              if (resolved) {
                addClassOrEnumConstants(localName, resolved.node);
                addVariableConstant(localName, resolved.node);
              }
            }

            // Namespace import: import * as Dict from './module'
            if (namedBindings && ts.isNamespaceImport(namedBindings)) {
              const namespaceName = namedBindings.name.text;
              const resolvedModulePath = resolveModuleSpecifier(modulePath, filePath, resolveImport);
              if (resolvedModulePath) {
                const importedSF = getSourceFile(resolvedModulePath);
                if (importedSF) {
                  const subExports = getModuleExports(importedSF, resolvedModulePath, resolveImport);
                  for (const [exportName, exportedSymbol] of subExports.entries()) {
                    addClassOrEnumConstants(`${namespaceName}.${exportName}`, exportedSymbol.node);
                    addVariableConstant(`${namespaceName}.${exportName}`, exportedSymbol.node);
                  }
                }
              }
            }
          }
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

const sourceFileCache = new Map<string, ts.SourceFile>();

function findFileWithExtensions(basePath: string): string | null {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }
  for (const ext of ['.ts', '.tsx', '.d.ts', '.js', '.jsx']) {
    const p = basePath + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return p;
    }
  }
  return null;
}

function resolveModuleSpecifier(
  moduleSpecifier: string,
  containingFilePath: string,
  resolveImport?: (originalPath: string, importerPath: string) => string
): string | null {
  let resolvedPath = moduleSpecifier;
  if (resolveImport) {
    try {
      resolvedPath = resolveImport(moduleSpecifier, containingFilePath);
    } catch (e) {
      // fallback
    }
  }

  if (path.isAbsolute(resolvedPath)) {
    return findFileWithExtensions(resolvedPath);
  }

  if (resolvedPath.startsWith('.')) {
    const absPath = path.resolve(path.dirname(containingFilePath), resolvedPath);
    return findFileWithExtensions(absPath);
  }

  const absPath = path.resolve(path.dirname(containingFilePath), resolvedPath);
  return findFileWithExtensions(absPath);
}

function getSourceFile(
  filePath: string,
  sourceCode?: string
): ts.SourceFile | null {
  const normalizedPath = path.resolve(filePath).replace(/\\/g, '/');
  if (sourceFileCache.has(normalizedPath)) {
    return sourceFileCache.get(normalizedPath)!;
  }

  let code = sourceCode;
  if (code === undefined) {
    if (!fs.existsSync(normalizedPath)) {
      return null;
    }
    try {
      code = fs.readFileSync(normalizedPath, 'utf8');
    } catch (e) {
      return null;
    }
  }

  const sf = ts.createSourceFile(
    normalizedPath,
    code,
    ts.ScriptTarget.Latest,
    true
  );
  sourceFileCache.set(normalizedPath, sf);
  return sf;
}

interface ResolvedSymbol {
  node: ts.Declaration;
  sourceFile: ts.SourceFile;
}

function findLocalDeclaration(name: string, sourceFile: ts.SourceFile): ts.Declaration | null {
  for (const stmt of sourceFile.statements) {
    if (ts.isClassDeclaration(stmt)) {
      if (name === 'default' && stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        return stmt;
      }
      if (stmt.name && stmt.name.text === name) {
        return stmt;
      }
    }

    if (ts.isEnumDeclaration(stmt)) {
      if (name === 'default' && stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        return stmt;
      }
      if (stmt.name && stmt.name.text === name) {
        return stmt;
      }
    }

    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === name) {
          return decl;
        }
      }
    }

    if (ts.isFunctionDeclaration(stmt)) {
      if (name === 'default' && stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        return stmt;
      }
      if (stmt.name && stmt.name.text === name) {
        return stmt;
      }
    }

    if (ts.isInterfaceDeclaration(stmt) && stmt.name && stmt.name.text === name) {
      return stmt;
    }
    if (ts.isTypeAliasDeclaration(stmt) && stmt.name && stmt.name.text === name) {
      return stmt;
    }
    if (ts.isExportAssignment(stmt) && name === 'default') {
      return stmt as unknown as ts.Declaration;
    }
  }

  return null;
}

function resolveSymbol(
  name: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  resolveImport?: (originalPath: string, importerPath: string) => string,
  visitedFiles = new Set<string>()
): ResolvedSymbol | null {
  const normalizedPath = path.resolve(filePath).replace(/\\/g, '/');
  if (visitedFiles.has(normalizedPath)) {
    return null;
  }
  visitedFiles.add(normalizedPath);

  const localDecl = findLocalDeclaration(name, sourceFile);
  if (localDecl) {
    return { node: localDecl, sourceFile };
  }

  for (const stmt of sourceFile.statements) {
    if (ts.isImportDeclaration(stmt) && stmt.importClause) {
      const specifier = stmt.moduleSpecifier;
      if (ts.isStringLiteral(specifier)) {
        const modulePath = specifier.text;
        const namedBindings = stmt.importClause.namedBindings;

        if (namedBindings && ts.isNamedImports(namedBindings)) {
          for (const element of namedBindings.elements) {
            if (element.name.text === name) {
              const importName = element.propertyName ? element.propertyName.text : element.name.text;
              const resolvedModulePath = resolveModuleSpecifier(modulePath, filePath, resolveImport);
              if (resolvedModulePath) {
                const importedSF = getSourceFile(resolvedModulePath);
                if (importedSF) {
                  const nextVisited = new Set(visitedFiles);
                  const resolved = resolveSymbol(importName, importedSF, resolvedModulePath, resolveImport, nextVisited);
                  if (resolved) return resolved;
                }
              }
            }
          }
        }

        if (stmt.importClause.name && stmt.importClause.name.text === name) {
          const resolvedModulePath = resolveModuleSpecifier(modulePath, filePath, resolveImport);
          if (resolvedModulePath) {
            const importedSF = getSourceFile(resolvedModulePath);
            if (importedSF) {
              const nextVisited = new Set(visitedFiles);
              const resolved = resolveSymbol('default', importedSF, resolvedModulePath, resolveImport, nextVisited);
              if (resolved) return resolved;
            }
          }
        }

        if (namedBindings && ts.isNamespaceImport(namedBindings) && namedBindings.name.text === name) {
          return { node: namedBindings, sourceFile };
        }
      }
    }
  }

  for (const stmt of sourceFile.statements) {
    if (ts.isExportDeclaration(stmt)) {
      const specifier = stmt.moduleSpecifier;
      if (specifier && ts.isStringLiteral(specifier)) {
        const modulePath = specifier.text;
        const resolvedModulePath = resolveModuleSpecifier(modulePath, filePath, resolveImport);
        if (!resolvedModulePath) continue;
        const importedSF = getSourceFile(resolvedModulePath);
        if (!importedSF) continue;

        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
          for (const element of stmt.exportClause.elements) {
            if (element.name.text === name) {
              const exportName = element.propertyName ? element.propertyName.text : element.name.text;
              const nextVisited = new Set(visitedFiles);
              const resolved = resolveSymbol(exportName, importedSF, resolvedModulePath, resolveImport, nextVisited);
              if (resolved) return resolved;
            }
          }
        } else if (!stmt.exportClause) {
          const nextVisited = new Set(visitedFiles);
          const resolved = resolveSymbol(name, importedSF, resolvedModulePath, resolveImport, nextVisited);
          if (resolved) return resolved;
        }
      } else if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const element of stmt.exportClause.elements) {
          if (element.name.text === name) {
            const localName = element.propertyName ? element.propertyName.text : element.name.text;
            const nextVisited = new Set(visitedFiles);
            const resolved = resolveSymbol(localName, sourceFile, filePath, resolveImport, nextVisited);
            if (resolved) return resolved;
          }
        }
      }
    }
  }

  return null;
}

interface ExportedSymbol {
  name: string;
  node: ts.Declaration;
  sourceFile: ts.SourceFile;
}

function getModuleExports(
  sourceFile: ts.SourceFile,
  filePath: string,
  resolveImport?: (originalPath: string, importerPath: string) => string,
  visitedFiles = new Set<string>()
): Map<string, ExportedSymbol> {
  const exportsMap = new Map<string, ExportedSymbol>();
  const normalizedPath = path.resolve(filePath).replace(/\\/g, '/');
  if (visitedFiles.has(normalizedPath)) {
    return exportsMap;
  }
  visitedFiles.add(normalizedPath);

  const addIfExported = (name: string, decl: ts.Declaration) => {
    const hasExport = decl.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    if (hasExport) {
      exportsMap.set(name, { name, node: decl, sourceFile });
    }
  };

  for (const stmt of sourceFile.statements) {
    if (ts.isClassDeclaration(stmt)) {
      if (stmt.name) {
        addIfExported(stmt.name.text, stmt);
      }
      if (stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        exportsMap.set('default', { name: 'default', node: stmt, sourceFile });
      }
    } else if (ts.isEnumDeclaration(stmt)) {
      if (stmt.name) {
        addIfExported(stmt.name.text, stmt);
      }
      if (stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        exportsMap.set('default', { name: 'default', node: stmt, sourceFile });
      }
    } else if (ts.isVariableStatement(stmt)) {
      const hasExport = stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (hasExport) {
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            exportsMap.set(decl.name.text, { name: decl.name.text, node: decl, sourceFile });
          }
        }
      }
    } else if (ts.isFunctionDeclaration(stmt)) {
      if (stmt.name) {
        addIfExported(stmt.name.text, stmt);
      }
      if (stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        exportsMap.set('default', { name: 'default', node: stmt, sourceFile });
      }
    } else if (ts.isInterfaceDeclaration(stmt) && stmt.name) {
      addIfExported(stmt.name.text, stmt);
    } else if (ts.isTypeAliasDeclaration(stmt) && stmt.name) {
      addIfExported(stmt.name.text, stmt);
    } else if (ts.isExportDeclaration(stmt)) {
      const specifier = stmt.moduleSpecifier;
      if (specifier && ts.isStringLiteral(specifier)) {
        const modulePath = specifier.text;
        const resolvedModulePath = resolveModuleSpecifier(modulePath, filePath, resolveImport);
        if (resolvedModulePath) {
          const importedSF = getSourceFile(resolvedModulePath);
          if (importedSF) {
            if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
              for (const element of stmt.exportClause.elements) {
                const exportedName = element.name.text;
                const localName = element.propertyName ? element.propertyName.text : element.name.text;
                const nextVisited = new Set(visitedFiles);
                const resolved = resolveSymbol(localName, importedSF, resolvedModulePath, resolveImport, nextVisited);
                if (resolved) {
                  exportsMap.set(exportedName, { name: exportedName, node: resolved.node, sourceFile: resolved.sourceFile });
                }
              }
            } else if (!stmt.exportClause) {
              const nextVisited = new Set(visitedFiles);
              const subExports = getModuleExports(importedSF, resolvedModulePath, resolveImport, nextVisited);
              for (const [key, val] of subExports.entries()) {
                if (key !== 'default') {
                  exportsMap.set(key, val);
                }
              }
            }
          }
        }
      } else if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const element of stmt.exportClause.elements) {
          const exportedName = element.name.text;
          const localName = element.propertyName ? element.propertyName.text : element.name.text;
          const nextVisited = new Set(visitedFiles);
          const resolved = resolveSymbol(localName, sourceFile, filePath, resolveImport, nextVisited);
          if (resolved) {
            exportsMap.set(exportedName, { name: exportedName, node: resolved.node, sourceFile: resolved.sourceFile });
          }
        }
      }
    }
  }

  return exportsMap;
}

function getConstantValueFromDeclaration(decl: ts.Declaration): string | null {
  if (ts.isVariableDeclaration(decl)) {
    if (decl.initializer && ts.isStringLiteral(decl.initializer)) {
      return decl.initializer.text;
    }
  }
  return null;
}

function getStaticOrEnumMemberValue(decl: ts.Declaration, propName: string): string | null {
  if (ts.isClassDeclaration(decl)) {
    for (const member of decl.members) {
      if (
        ts.isPropertyDeclaration(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.name.text === propName
      ) {
        const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
        const isStatic = modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false;
        if (isStatic && member.initializer && ts.isStringLiteral(member.initializer)) {
          return member.initializer.text;
        }
      }
    }
  }

  if (ts.isEnumDeclaration(decl)) {
    for (const member of decl.members) {
      if (member.name && ts.isIdentifier(member.name) && member.name.text === propName) {
        if (member.initializer && ts.isStringLiteral(member.initializer)) {
          return member.initializer.text;
        }
        return member.name.text;
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
  if (!filePath) {
    const localDecl = findLocalDeclaration(objName, sourceFile);
    if (localDecl) {
      return getStaticOrEnumMemberValue(localDecl, propName);
    }
    return null;
  }

  const resolved = resolveSymbol(objName, sourceFile, filePath, resolveImport);
  if (!resolved) return null;

  const value = getStaticOrEnumMemberValue(resolved.node, propName);
  if (value !== null) return value;

  if (ts.isNamespaceImport(resolved.node)) {
    const importDecl = resolved.node.parent.parent as ts.ImportDeclaration;
    if (importDecl && importDecl.moduleSpecifier && ts.isStringLiteral(importDecl.moduleSpecifier)) {
      const modulePath = importDecl.moduleSpecifier.text;
      const resolvedModulePath = resolveModuleSpecifier(modulePath, resolved.sourceFile.fileName, resolveImport);
      if (resolvedModulePath) {
        const importedSF = getSourceFile(resolvedModulePath);
        if (importedSF) {
          const propResolved = resolveSymbol(propName, importedSF, resolvedModulePath, resolveImport);
          if (propResolved) {
            const val = getConstantValueFromDeclaration(propResolved.node);
            if (val !== null) return val;
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
  if (!filePath) {
    const localDecl = findLocalDeclaration(name, sourceFile);
    if (localDecl) {
      return getConstantValueFromDeclaration(localDecl);
    }
    return null;
  }

  const resolved = resolveSymbol(name, sourceFile, filePath, resolveImport);
  if (!resolved) return null;

  return getConstantValueFromDeclaration(resolved.node);
}

function resolvePropertyAccessValue(
  node: ts.PropertyAccessExpression,
  sourceFile: ts.SourceFile,
  filePath?: string,
  resolveImport?: (originalPath: string, importerPath: string) => string
): string | null {
  const parts: string[] = [];
  let curr: ts.Expression = node;
  while (ts.isPropertyAccessExpression(curr)) {
    parts.unshift(curr.name.text);
    curr = curr.expression;
  }
  if (ts.isIdentifier(curr)) {
    parts.unshift(curr.text);
  } else {
    return null;
  }

  if (parts.length === 2) {
    return findStaticOrEnumValue(parts[0], parts[1], sourceFile, filePath, resolveImport);
  }
  if (parts.length === 3) {
    if (!filePath) return null;
    const resolved = resolveSymbol(parts[0], sourceFile, filePath, resolveImport);
    if (resolved && ts.isNamespaceImport(resolved.node)) {
      const importDecl = resolved.node.parent.parent as ts.ImportDeclaration;
      if (importDecl && importDecl.moduleSpecifier && ts.isStringLiteral(importDecl.moduleSpecifier)) {
        const modulePath = importDecl.moduleSpecifier.text;
        const resolvedModulePath = resolveModuleSpecifier(modulePath, resolved.sourceFile.fileName, resolveImport);
        if (resolvedModulePath) {
          const importedSF = getSourceFile(resolvedModulePath);
          if (importedSF) {
            const classResolved = resolveSymbol(parts[1], importedSF, resolvedModulePath, resolveImport);
            if (classResolved) {
              return getStaticOrEnumMemberValue(classResolved.node, parts[2]);
            }
          }
        }
      }
    }
  }
  return null;
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
    const value = resolvePropertyAccessValue(node, sourceFile, filePath, resolveImport);
    if (value) return [value];
  }
  return [];
}
