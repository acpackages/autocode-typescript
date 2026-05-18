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
      // ── String value: `selector: 'my-el'` or template literals ──
      if (
        ts.isStringLiteral(prop.initializer)
        || ts.isNoSubstitutionTemplateLiteral(prop.initializer)
        || ts.isTemplateExpression(prop.initializer)
      ) {
        // Use getText() and slice off the quotes (first and last character)
        metadata[prop.name.text] = prop.initializer.getText().slice(1, -1);
      }
      // ── Array value: `styleUrls: ['./style1.css', './style2.css']` ──
      else if (ts.isArrayLiteralExpression(prop.initializer)) {
        metadata[prop.name.text] = prop.initializer.elements
          // Only include string elements (skip non-string expressions)
          .filter((el): el is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
            ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el))
          // Extract the raw text content of each string
          .map(el => el.text);
      }
    }
  }

  // Cast to ComponentMetadata (we know the shape matches our interface)
  return metadata as unknown as ComponentMetadata;
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
  // ── Variable statements: `const x = 1`, `let y = 'hello'` ──
  else if (ts.isVariableStatement(node)) {
    for (const decl of node.declarationList.declarations) {
      // Only handle simple names (not destructuring patterns)
      if (ts.isIdentifier(decl.name)) vars.add(decl.name.text);
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
 * Extract all user-defined identifiers referenced in template binding expressions.
 *
 * Walks all binding expressions (including nested `childBindings` from
 * structural directives like `ac:if` and `ac:for`) and collects identifiers
 * that are NOT global built-ins.
 *
 * The resulting set tells the compiler which class properties need to be
 * made reactive (backed by signals). If a property name appears in this set,
 * it means the template reads from it, so changes to it must trigger re-renders.
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
   * Scan a single expression string for identifier names.
   * Uses a regex to find all word-like tokens, then filters out globals.
   */
  const processExpression = (expr: string): void => {
    if (!expr) return;

    // Match all identifier-like tokens in the expression
    // Pattern: starts with letter/underscore/$, followed by alphanumerics
    const matches = expr.matchAll(/[a-zA-Z_$][a-zA-Z0-9_$]*/g);

    for (const match of matches) {
      // Only keep identifiers that are NOT built-in globals
      // (we don't want Math, console, true, false, etc.)
      if (!GLOBAL_IDENTIFIERS.has(match[0])) {
        identifiers.add(match[0]);
      }
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
