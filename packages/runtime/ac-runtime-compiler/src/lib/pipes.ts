/**
 * @module pipes
 *
 * Pipe expression parsing utilities for AC template syntax.
 *
 * In AC templates, pipes transform values for display:
 *   `{{ amount | currency }}`          → Format as currency
 *   `{{ amount | currency:'INR' }}`    → Format as INR currency
 *   `{{ amount | currency | number:2 }}` → Chain: currency then number
 *
 * This module converts pipe syntax into `evaluateAcPipeExpression()` function calls
 * that the runtime resolves via the global pipe registry.
 *
 * **Transformation examples:**
 * ```
 * Input:  "amount | currency"
 * Output: "evaluateAcPipeExpression(amount, 'currency')"
 *
 * Input:  "amount | currency:'INR'"
 * Output: "evaluateAcPipeExpression(amount, 'currency', 'INR')"
 *
 * Input:  "amount | currency | number:2"
 * Output: "evaluateAcPipeExpression(evaluateAcPipeExpression(amount, 'currency'), 'number', 2)"
 * ```
 */

/**
 * Split a template expression string on top-level pipe `|` characters.
 *
 * This is NOT a simple `str.split('|')` because we need to handle:
 * - `||` (logical OR) — should NOT split
 * - Strings with `|` inside — should NOT split
 * - Nested brackets `(|)`, `[|]`, `{|}` — should NOT split
 *
 * @param expr - The full expression string (e.g., `"amount | currency:'INR'"`)
 * @returns Array of parts split on pipe operators
 *
 * @example
 * splitTopLevelPipes("amount | currency")      → ["amount", "currency"]
 * splitTopLevelPipes("a || b | upper")          → ["a || b", "upper"]
 * splitTopLevelPipes("fn('a|b') | upper")       → ["fn('a|b')", "upper"]
 */
export function splitTopLevelPipes(expr: string): string[] {
  const parts: string[] = [];  // Accumulates the final split parts
  let current = '';            // Current part being built character-by-character
  let depth = 0;               // Nesting depth for brackets: ( [ {
  let inString = false;        // Whether we're inside a quoted string
  let quoteChar = '';           // Which quote character started the string: ' " `

  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];

    // ── Inside a string literal: keep adding characters until we find the matching closing quote ──
    if (inString) {
      current += c;
      // Check if this character closes the string (and isn't escaped with \)
      if (c === quoteChar && expr[i - 1] !== '\\') inString = false;
      continue;
    }

    // ── Opening a new string literal ──
    if (c === "'" || c === '"' || c === '`') {
      inString = true;
      quoteChar = c;
      current += c;
      continue;
    }

    // ── Track bracket nesting depth ──
    // Inside brackets, pipe characters are part of the expression, not separators
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) depth--;

    // ── Check for pipe character ──
    if (c === '|' && depth === 0) {
      // Look ahead and behind to detect `||` (logical OR)
      const nextIsOr = expr[i + 1] === '|';
      const prevIsOr = i > 0 && expr[i - 1] === '|';

      if (nextIsOr || prevIsOr) {
        // This is part of `||`, not a pipe operator — keep it
        current += c;
        continue;
      }

      // This IS a pipe operator — save the current part and start a new one
      parts.push(current.trim());
      current = '';
    } else {
      // Regular character — add to current part
      current += c;
    }
  }

  // Don't forget the last part (after the final pipe, or the whole string if no pipes)
  if (current.trim()) parts.push(current.trim());

  return parts;
}

/**
 * Transform a template expression containing pipes into nested `evaluateAcPipeExpression()` calls.
 *
 * Each pipe is converted to a function call that wraps the previous value:
 * - Single pipe:  `value | pipeName` → `evaluateAcPipeExpression(value, 'pipeName')`
 * - With args:    `value | pipeName:arg1` → `evaluateAcPipeExpression(value, 'pipeName', arg1)`
 * - Chained:      `value | pipe1 | pipe2` → `evaluateAcPipeExpression(evaluateAcPipeExpression(value, 'pipe1'), 'pipe2')`
 *
 * @param inner - The expression string (may or may not contain pipes)
 * @returns The transformed expression, or the original if no pipes found
 */
export function transformPipeExpression(inner: string): string {
  // Split the expression on pipe operators
  const parts = splitTopLevelPipes(inner.trim());

  // No pipes found — return the expression unchanged
  if (parts.length <= 1) return inner.trim();

  // Start with the base value (the part before the first pipe)
  let result = parts[0].trim();

  // Wrap each subsequent pipe around the previous result
  for (let i = 1; i < parts.length; i++) {
    const pipePart = parts[i].trim();

    // Split pipe name from its arguments (separated by colon)
    // e.g., "currency:'INR'" → pipeName="currency", argsStr="'INR'"
    const colonIdx = pipePart.indexOf(':');
    const pipeName = (colonIdx === -1 ? pipePart : pipePart.slice(0, colonIdx)).trim();
    const argsStr = colonIdx === -1 ? '' : pipePart.slice(colonIdx + 1).trim();

    // Build the evaluateAcPipeExpression() call
    // Without args: evaluateAcPipeExpression(value, 'pipeName')
    // With args:    evaluateAcPipeExpression(value, 'pipeName', arg1, arg2)
    result = `evaluateAcPipeExpression(${result}, '${pipeName}'${argsStr ? ', ' + argsStr : ''})`;
  }

  return result;
}
