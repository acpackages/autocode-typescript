/**
 * @module ast-helpers
 *
 * TypeScript AST utility functions for the component compiler.
 *
 * These helpers work with the TypeScript compiler API to:
 * 1. Identify `@AcElement` decorators on classes
 * 2. Extract metadata from decorator arguments
 * 3. Collect top-level identifiers for expression prefixing
 * 4. Find which identifiers are used in template expressions
 *
 * **Why we use the TypeScript AST (Abstract Syntax Tree):**
 * Instead of parsing TypeScript source code with regex (fragile and error-prone),
 * we use the official TypeScript compiler API to parse the code into a tree
 * structure. Each node in the tree represents a syntactic element (class, method,
 * decorator, etc.). This gives us reliable, correct results.
 */
import * as ts from 'typescript';
import type { ComponentMetadata, Binding } from './types.js';
import { GLOBAL_IDENTIFIERS } from './constants.js';

/**
 * Check if a decorator AST node matches a given decorator name.
 *
 * Handles both call-style and bare decorators:
 * - `@AcElement({...})` — call expression with arguments
 * - `@AcInput` — bare identifier (no arguments)
 *
 * @param d    - The decorator AST node to check
 * @param name - The decorator name to match (e.g., `'AcElement'`, `'AcInput'`)
 * @returns `true` if the decorator matches the given name
 *
 * @example
 * // For `@AcElement({...})`:
 * isDecorator(decoratorNode, 'AcElement') // → true
 * isDecorator(decoratorNode, 'AcInput')   // → false
 */
export function isDecorator(d: ts.Decorator, name: string): boolean {
  const call = d.expression;

  // ── Case 1: Call expression — `@AcElement({...})` ──
  // The expression is a CallExpression where the function being called is an Identifier
  if (ts.isCallExpression(call)) {
    return ts.isIdentifier(call.expression) && call.expression.text === name;
  }

  // ── Case 2: Bare identifier — `@AcInput` (no parentheses) ──
  if (ts.isIdentifier(call)) {
    return call.text === name;
  }

  return false;
}

/**
 * Extract the `@AcElement(...)` metadata from a class declaration's decorators.
 *
 * Reads the object literal passed to `@AcElement({...})` and extracts
 * string and array properties into a ComponentMetadata object.
 *
 * @param node - The class declaration AST node to inspect
 * @returns The extracted metadata, or `null` if not an `@AcElement` class
 *
 * @example
 * // For this source code:
 * // @AcElement({ selector: 'my-el', template: '<div>Hi</div>' })
 * // class MyEl {}
 *
 * getComponentMetadata(classNode)
 * // → { selector: 'my-el', template: '<div>Hi</div>' }
 */
export function getComponentMetadata(node: ts.ClassDeclaration): ComponentMetadata | null {
  // ── Step 1: Get the list of decorators on this class ──
  const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
  if (!decorators) return null; // No decorators at all → not a component

  // ── Step 2: Find the @AcElement decorator ──
  const acElementDecorator = decorators.find(d => isDecorator(d, 'AcElement'));
  if (!acElementDecorator) return null; // Not decorated with @AcElement → not a component

  // ── Step 3: Extract the configuration object literal ──
  // @AcElement({ selector: '...', template: '...' })
  //             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ← this is the object literal
  const call = acElementDecorator.expression as ts.CallExpression;
  const config = call.arguments[0] as ts.ObjectLiteralExpression;
  const metadata: Record<string, string | string[]> = {};

  // ── Step 4: Walk each property in the config object ──
  for (const prop of config.properties) {
    // Only handle simple property assignments like `selector: 'my-el'`
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      // ── String value: `selector: 'my-el'` ──
      // Use the `.text` property (already unquoted, unescaped) for string literals
      // and no-substitution template literals. This is more reliable than
      // getText().slice(1,-1) which is fragile for multi-line or escaped strings.
      if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
        metadata[prop.name.text] = prop.initializer.text;
      }
      // ── Template expression: `template: `<div>${expr}</div>`` ──
      // For template literals with interpolations, fall back to getText() since
      // we need the raw source including the `${}` spans.
      else if (ts.isTemplateExpression(prop.initializer)) {
        // Strip opening and closing backtick with slice(1,-1)
        metadata[prop.name.text] = prop.initializer.getText().slice(1, -1);
      }
      // ── Array value: `styleUrls: ['./style1.css', './style2.css']` ──
      else if (ts.isArrayLiteralExpression(prop.initializer)) {
        metadata[prop.name.text] = prop.initializer.elements
          // Only include string elements (skip non-string expressions)
          .filter((el): el is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
            ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el))
          // Extract the raw text content of each string
          .map(el => el.text) as any;
      }
      // ── Boolean value: `formAssociated: true` ──
      else if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword) {
        metadata[prop.name.text] = true as any;
      }
      else if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword) {
        metadata[prop.name.text] = false as any;
      }
    }
  }

  // Cast to ComponentMetadata (we know the shape matches our interface)
  return metadata as unknown as ComponentMetadata;
}

/**
 * Collect all binding names introduced by a destructuring pattern
 * (object or array) into `vars`. Used by `collectTopLevelIdentifiers`
 * to handle `const { a, b } = obj` and `const [x, y] = arr`.
 */
function collectBindingNames(pattern: ts.BindingName, vars: Set<string>): void {
  if (ts.isIdentifier(pattern)) {
    vars.add(pattern.text);
  } else if (ts.isObjectBindingPattern(pattern)) {
    for (const el of pattern.elements) {
      collectBindingNames(el.name, vars);
    }
  } else if (ts.isArrayBindingPattern(pattern)) {
    for (const el of pattern.elements) {
      if (!ts.isOmittedExpression(el)) {
        collectBindingNames(el.name, vars);
      }
    }
  }
}

/**
 * Scan a top-level statement and record any identifiers it introduces.
 *
 * These identifiers are needed so the expression prefixer knows NOT to
 * rewrite them as `this.identifier`. For example, if a file has
 * `import { signal } from 'solid'`, then `signal` in a template
 * expression should NOT become `this.signal`.
 *
 * **Handles these declaration types:**
 * - `import Foo from '...'` → collects `Foo` (default import)
 * - `import { a, b } from '...'` → collects `a`, `b` (named imports)
 * - `import * as ns from '...'` → collects `ns` (namespace import)
 * - `const x = ...` / `let y = ...` → collects `x`, `y` (variables)
 * - `const { a, b } = obj` → collects `a`, `b` (destructured variables)
 * - `const [x, y] = arr` → collects `x`, `y` (destructured array)
 * - `function fn() {...}` → collects `fn` (function declaration)
 * - `class Cls {...}` → collects `Cls` (class declaration)
 *
 * @param node - A top-level AST statement node
 * @param vars - The Set to add discovered identifiers to
 */
export function collectTopLevelIdentifiers(node: ts.Statement, vars: Set<string>): void {
  // ── Import declarations ──
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (!clause) return; // Side-effect import like `import './polyfill'`

    // Default import: `import Foo from '...'`
    if (clause.name) vars.add(clause.name.text);

    // Named or namespace imports
    if (clause.namedBindings) {
      // Named imports: `import { a, b } from '...'`
      if (ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) vars.add(el.name.text);
      }
      // Namespace import: `import * as ns from '...'`
      else if (ts.isNamespaceImport(clause.namedBindings)) {
        vars.add(clause.namedBindings.name.text);
      }
    }
  }
  // ── Variable statements: `const x = 1`, `let { a, b } = obj`, `const [x] = arr` ──
  else if (ts.isVariableStatement(node)) {
    for (const decl of node.declarationList.declarations) {
      // collectBindingNames handles both simple identifiers and destructuring patterns
      collectBindingNames(decl.name, vars);
    }
  }
  // ── Function declarations: `function helper() {...}` ──
  else if (ts.isFunctionDeclaration(node) && node.name) {
    vars.add(node.name.text);
  }
  // ── Class declarations: `class BaseComponent {...}` ──
  else if (ts.isClassDeclaration(node) && node.name) {
    vars.add(node.name.text);
  }
}

/**
 * Extract all user-defined identifiers referenced in template binding expressions
 * using the TypeScript AST for precision.
 *
 * Walks all binding expressions (including nested `childBindings` from
 * structural directives like `ac:if` and `ac:for`) and collects identifiers
 * that are NOT global built-ins.
 *
 * The resulting set tells the compiler which class properties need to be
 * made reactive (backed by signals). If a property name appears in this set,
 * it means the template reads from it, so changes to it must trigger re-renders.
 *
 * Uses AST parsing to correctly distinguish:
 * - Top-level identifiers: `count`, `items` (collected — need reactivity)
 * - Property names after `.`: `items.length` → only `items` collected
 * - Local variable names inside object literals: `{ active: isActive }` → only `isActive`
 * - String literal words: `"hello world"` → NOT collected
 *
 * @param templateBindings - The flat binding array from the template compiler
 * @returns Set of identifier names referenced in template expressions
 *
 * @example
 * // Template: `<div>{{count}}</div><span [class.active]="isActive">...</span>`
 * // Bindings contain expressions: "`${count}`" and "isActive"
 * extractUsedIdentifiers(bindings)
 * // → Set { 'count', 'isActive' }
 */
export function extractUsedIdentifiers(templateBindings: Binding[]): Set<string> {
  const identifiers = new Set<string>();

  /**
   * Walk a TypeScript AST node and collect all top-level identifier references
   * that are not globals, property names, or object keys.
   */
  const collectFromNode = (node: ts.Node): void => {
    // ── Property access: `foo.bar` — only collect `foo`, skip `bar` ──
    if (ts.isPropertyAccessExpression(node)) {
      collectFromNode(node.expression);
      // do NOT visit node.name — it's a property key, not a variable reference
      return;
    }

    // ── Computed access: `foo[key]` — collect both `foo` and `key` ──
    if (ts.isElementAccessExpression(node)) {
      collectFromNode(node.expression);
      collectFromNode(node.argumentExpression);
      return;
    }

    // ── Object property: `{ key: value }` — collect value only, not key ──
    if (ts.isPropertyAssignment(node)) {
      collectFromNode(node.initializer);
      return;
    }

    // ── Shorthand property: `{ name }` — `name` is used as a value ──
    if (ts.isShorthandPropertyAssignment(node)) {
      const name = node.name.text;
      if (!GLOBAL_IDENTIFIERS.has(name)) identifiers.add(name);
      return;
    }

    // ── Bare identifier ──
    if (ts.isIdentifier(node)) {
      const name = node.text;
      if (!GLOBAL_IDENTIFIERS.has(name)) identifiers.add(name);
      return;
    }

    // ── Skip string / template literal text content ──
    // (We don't want words inside strings collected as identifiers)
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return;
    }

    // For everything else, recurse into children
    ts.forEachChild(node, collectFromNode);
  };

  /**
   * Parse an expression string and collect identifiers from its AST.
   */
  const processExpression = (expr: string): void => {
    if (!expr) return;
    try {
      const sf = ts.createSourceFile('expr.ts', `(${expr})`, ts.ScriptTarget.Latest, true);
      ts.forEachChild(sf, collectFromNode);
    } catch {
      // Malformed expression — skip silently
    }
  };

  // ── Walk each binding, including nested child bindings ──
  for (const b of templateBindings) {
    // Process the binding's own expression
    processExpression(b.expression);

    // Recursively process child bindings (from ac:if, ac:for directives)
    if (b.childBindings) {
      for (const id of extractUsedIdentifiers(b.childBindings)) {
        identifiers.add(id);
      }
    }
  }

  return identifiers;
}