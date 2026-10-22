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
 * Parse cache: maps raw expression strings to their parsed SourceFile.
 * Avoids re-parsing the same expression (e.g. `items.length`) across
 * multiple components. Keyed by the raw expression string before wrapping.
 *
 * Note: the cache stores the unwrapped expression so that localVars /
 * topLevelVars differences still go through the transformer — only the
 * *parse* step is cached, not the transform result.
 */
const parseCache = new Map<string, ts.SourceFile>();

/**
 * Parse `expression` into a SourceFile, returning a cached result when
 * the same expression string was seen before.
 */
function getOrParseSourceFile(expression: string): ts.SourceFile {
  let sf = parseCache.get(expression);
  if (!sf) {
    sf = ts.createSourceFile('expr.ts', `(${expression})`, ts.ScriptTarget.Latest, true);
    parseCache.set(expression, sf);
  }
  return sf;
}

/**
 * Extract the spans of `${...}` interpolations from a template literal,
 * correctly handling nested braces.
 *
 * Returns an array of [start, end] indices (inclusive of `${` and `}`)
 * within the full template literal string.
 *
 * Unlike a simple regex, this counts brace depth so that nested object
 * literals and function calls inside `${}` are handled correctly.
 */
function extractTemplateLiteralSpans(tpl: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  let i = 1; // skip opening backtick
  const end = tpl.length - 1; // skip closing backtick
  while (i < end) {
    if (tpl[i] === '\\') { i += 2; continue; } // skip escape sequence
    if (tpl[i] === '$' && tpl[i + 1] === '{') {
      const start = i;
      let depth = 1;
      i += 2; // skip `${`
      while (i < end && depth > 0) {
        if (tpl[i] === '\\') { i += 2; continue; }
        if (tpl[i] === '{') depth++;
        else if (tpl[i] === '}') depth--;
        i++;
      }
      // i now points just past the closing `}`
      spans.push([start, i - 1]);
    } else {
      i++;
    }
  }
  return spans;
}

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
  // parts processed individually while keeping the literal structure.
  // We use a brace-depth counter instead of regex to correctly handle
  // nested `{}` inside interpolations (e.g. `${{ key: val }.key}`).
  if (expression.startsWith('`') && expression.endsWith('`')) {
    const spans = extractTemplateLiteralSpans(expression);
    if (spans.length === 0) return expression; // no interpolations
    let result = '';
    let cursor = 0;
    for (const [spanStart, spanEnd] of spans) {
      // Append literal text before this `${`
      result += expression.slice(cursor, spanStart + 2); // include `${`
      // Recursively rewrite the expression inside `${...}`
      const inner = expression.slice(spanStart + 2, spanEnd);
      result += prefixIdentifiers(inner, localVars, topLevelVars);
      result += '}';
      cursor = spanEnd + 1;
    }
    // Append any remaining literal text (including closing backtick)
    result += expression.slice(cursor);
    return result;
  }

  try {
    // ── Parse the expression into a TypeScript AST ──
    // We wrap it in parentheses `(expr)` to make it a valid expression statement.
    // The parse result is cached so repeated identical expressions are free.
    const sourceFile = getOrParseSourceFile(expression);

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

        // ── Computed / element access: `foo[key]` ──
        // Both sides must be visited: `foo` (the object) and `key` (the index expression)
        if (ts.isElementAccessExpression(node)) {
          const newExpr = ts.visitNode(node.expression, visit) as ts.Expression;
          const newArg = ts.visitNode(node.argumentExpression, visit) as ts.Expression;
          return ts.factory.updateElementAccessExpression(node, newExpr, newArg);
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
    try {
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
      return printer.printNode(ts.EmitHint.Expression, innerExpr, transformedFile).trim();
    } finally {
      // ── Clean up the transformation result (always, even on error) ──
      result.dispose();
    }
  } catch {
    // If parsing fails (malformed expression), return the original unchanged
    // This is a safety net — should rarely happen with valid templates
    return expression;
  }
}