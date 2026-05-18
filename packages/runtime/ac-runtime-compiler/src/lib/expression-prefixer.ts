/**
 * @module expression-prefixer
 *
 * Rewrites template expressions so that bare identifiers are prefixed
 * with `this.` to access the component instance's signal-backed properties.
 *
 * **Why this is needed:**
 * Template expressions are written as bare names for readability:
 *   `<div>{{count > 5 ? 'many' : 'few'}}</div>`
 *
 * But the generated code runs inside a class method, so `count` must
 * become `this.count` to access the reactive property:
 *   `this.count > 5 ? 'many' : 'few'`
 *
 * **What is NOT rewritten:**
 * - Global built-ins: `Math`, `console`, `JSON`, etc. (from GLOBAL_IDENTIFIERS)
 * - Top-level file imports: `import { signal } from 'solid'` → `signal` stays
 * - Local loop variables: `item` from `ac:for="item of items"` stays
 * - Property chains: only the root is rewritten (`foo.bar` → `this.foo.bar`)
 *
 * **Why we use the TypeScript AST:**
 * A simple regex replacement would fail on complex expressions:
 * - `{name: name}` → shorthand property needs special handling
 * - `obj.method()` → only `obj` should be prefixed, not `method`
 * - Template literals with `${}` need recursive processing
 *
 * Using the TypeScript compiler's own AST transformer guarantees correctness.
 */
import * as ts from 'typescript';
import { GLOBAL_IDENTIFIERS } from './constants.js';

/**
 * Reusable TypeScript printer instance.
 * Created once and reused across all prefixIdentifiers calls for efficiency.
 */
const printer = ts.createPrinter({ removeComments: false });

/**
 * Rewrite bare identifiers in a template expression to be prefixed with `this.`.
 *
 * @param expression   - The raw expression string from the template
 *                        (e.g., `"count > 5"`, `"items.length"`, `"handleClick($event)"`)
 * @param localVars    - Variables in local scope that should NOT be prefixed
 *                        (e.g., `item` from `ac:for="item of items"`)
 * @param topLevelVars - Top-level file-scope identifiers that should NOT be prefixed
 *                        (e.g., imported names like `signal`, `computed`)
 * @returns The rewritten expression string
 *
 * @example
 * prefixIdentifiers("count > 5", new Set(), new Set())
 * // → "this.count > 5"
 *
 * prefixIdentifiers("Math.round(count)", new Set(), new Set())
 * // → "Math.round(this.count)"  (Math is a global, not prefixed)
 *
 * prefixIdentifiers("item.name", new Set(["item"]), new Set())
 * // → "item.name"  (item is a local loop variable, not prefixed)
 */
export function prefixIdentifiers(
  expression: string,
  localVars: Set<string>,
  topLevelVars: Set<string>,
): string {
  // ── Handle empty expressions ──
  // Return empty string literal if expression is blank
  if (!expression || !expression.trim()) return "''";

  // ── Handle template literals ──
  // Template literals like `Hello ${name}!` need their interpolated
  // parts processed individually while keeping the literal structure
  if (expression.startsWith('`') && expression.endsWith('`')) {
    return expression.replace(
      /\$\{([^}]+)\}/g,
      (_, inner) => '${' + prefixIdentifiers(inner, localVars, topLevelVars) + '}',
    );
  }

  try {
    // ── Parse the expression into a TypeScript AST ──
    // We wrap it in parentheses `(expr)` to make it a valid expression statement
    const sourceFile = ts.createSourceFile('expr.ts', `(${expression})`, ts.ScriptTarget.Latest, true);

    // ── Define the AST transformer ──
    // This walks every node in the expression tree and rewrites identifiers
    const transformer = (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      const visit = (node: ts.Node): ts.Node => {
        // ── Property access: `foo.bar` ──
        // Only process the left side (`foo`), NOT the right side (`bar`)
        // because `bar` is a property name, not an identifier to prefix
        if (ts.isPropertyAccessExpression(node)) {
          const newExpr = ts.visitNode(node.expression, visit) as ts.Expression;
          return ts.factory.updatePropertyAccessExpression(node, newExpr, node.name);
        }

        // ── Object property assignment: `{ key: value }` ──
        // Only process the value, NOT the key name
        if (ts.isPropertyAssignment(node)) {
          const newInitializer = ts.visitNode(node.initializer, visit) as ts.Expression;
          return ts.factory.updatePropertyAssignment(node, node.name, newInitializer);
        }

        // ── Shorthand property: `{ name }` (same as `{ name: name }`) ──
        // The identifier serves as both key and value, so we need to
        // expand it: `{ name }` → `{ name: this.name }`
        if (ts.isShorthandPropertyAssignment(node)) {
          const name = node.name.text;
          // Only expand if it's a component property (not a local/global/imported var)
          if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name) && !topLevelVars.has(name)) {
            return ts.factory.createPropertyAssignment(
              node.name, // Keep the key as-is
              ts.factory.createPropertyAccessExpression(ts.factory.createThis(), node.name), // Value becomes this.name
            );
          }
          return node;
        }

        // ── Bare identifier: `count`, `items`, `handleClick` ──
        // This is where the main rewriting happens
        if (ts.isIdentifier(node)) {
          const name = node.text;
          // Only prefix if it's NOT a local variable, global, or imported name
          if (!localVars.has(name) && !GLOBAL_IDENTIFIERS.has(name) && !topLevelVars.has(name)) {
            // `count` → `this.count`
            return ts.factory.createPropertyAccessExpression(ts.factory.createThis(), node);
          }
        }

        // For all other node types, continue traversing children
        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(rootNode, visit);
    };

    // ── Run the transformer ──
    const result = ts.transform(sourceFile, [transformer]);
    const transformedFile = result.transformed[0] as ts.SourceFile;

    // ── Extract the transformed expression ──
    // Remember we wrapped the original in `(...)`, so unwrap it
    const statement = transformedFile.statements[0] as ts.ExpressionStatement;
    const expressionNode = statement.expression;

    let innerExpr: ts.Expression = expressionNode;
    if (ts.isParenthesizedExpression(expressionNode)) {
      innerExpr = expressionNode.expression;
    }

    // ── Print the transformed AST back to a string ──
    const output = printer.printNode(ts.EmitHint.Expression, innerExpr, transformedFile).trim();

    // ── Clean up the transformation result ──
    result.dispose();

    return output;
  } catch {
    // If parsing fails (malformed expression), return the original unchanged
    // This is a safety net — should rarely happen with valid templates
    return expression;
  }
}
