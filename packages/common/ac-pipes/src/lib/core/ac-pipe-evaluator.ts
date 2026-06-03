import { acPipeRegistry, IAcPipe } from './ac-pipe';

export async function evaluateAcPipeExpression({
  expression,
  context,
  evaluateFunction
}: {
  expression: string;
  context: any;
  evaluateFunction:(({expression,context,}: {expression: string;context: any;}) => any)
}): Promise<any> {
  try {
    const trimmed = expression.trim();

    // Fast path: no pipes → just evaluate base expression
    if (!trimmed.includes('|')) {
      return evaluateFunction({ expression: trimmed, context });
    }

    // Parse: base | pipe1:arg1 | pipe2:{opt:val}
    const pipeChain = parsePipeChain(trimmed);

    // Evaluate the base expression (sync)
    let value: any = evaluateFunction({ expression: pipeChain.base, context });

    // Process each pipe sequentially
    for (const { name, args } of pipeChain.pipes) {
      const pipe = getPipeSafe(name);
      if (!pipe) {
        console.warn(`Unknown pipe: ${name}`);
        continue;
      }
      const evaluatedArgs = await Promise.all(
        args.map(async (arg: any) => {
          if (typeof arg === 'string' && arg.startsWith('{{') && arg.endsWith('}}')) {
            const innerExpr = arg.slice(2, -2).trim();
            return await evaluateAcPipeExpression({ expression: innerExpr, context,evaluateFunction });
          }
          return arg;
        })
      );
      const result = pipe.transform(value, ...evaluatedArgs);
      value = result instanceof Promise ? await result : result;
    }

    return value ?? '';
  } catch (ex) {
    console.error(`Expression evaluation failed: "${expression}"`, ex);
    return '';
  }
}

export async function evaluateAcPipe({
  value,
  pipe,
  args
}: {
  value: any;
  pipe: string;
  args?:any[]
}): Promise<any> {
  try {
    const pipeHandler = getPipeSafe(pipe);
    if (!pipeHandler) {
        console.warn(`Unknown pipe: ${name}`);
        return '';
      }
      const evaluatedArgs = args?args:[];
      const result = pipeHandler?.transform(value, ...evaluatedArgs);
      value = result instanceof Promise ? await result : result;
      return value ?? '';

  } catch (ex) {
    console.error(`Pipe evaluation failed: "${value}"|"${pipe}"`, ex);
    return '';
  }
}

/**
 * Get pipe from global registry safely
 */
function getPipeSafe(name: string): IAcPipe | undefined {
  try {
    return acPipeRegistry.getPipe({ name });
  } catch {
    return undefined;
  }
}

/**
 * Robust pipe chain parser
 * Supports: data | uppercase | bwipqr:{scale:5} | default:'N/A'
 */
export function parsePipeChain(
  expression: string
): { base: string; pipes: { name: string; args: any[] }[] } {
  // ── Step 1: Split top-level pipes ────────────────────────────────
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let quoteChar = '';

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (inString) {
      current += char;
      if (char === quoteChar && expression[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      inString = true;
      quoteChar = char;
      current += char;
      continue;
    }

    if ('([{'.includes(char)) depth++;
    if (')]}'.includes(char)) depth--;

    if (char === '|' && depth === 0 && !inString) {
      if ((expression[i + 1] === '|') || (i > 0 && expression[i - 1] === '|')) {
        current += char;
      } else {
        if (current.trim()) parts.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());

  if (parts.length === 0) {
    return { base: expression.trim(), pipes: [] };
  }

  const base = parts[0].trim();

  // ── Step 2: Parse each pipe ──────────────────────────────────────
  const pipes = parts.slice(1).map((pipePart) => {
    // Find pipe name (before first top-level colon)
    let nameEnd = 0;
    depth = 0;
    inString = false;
    quoteChar = '';

    while (nameEnd < pipePart.length) {
      const c = pipePart[nameEnd];

      if (inString) {
        if (c === quoteChar && pipePart[nameEnd - 1] !== '\\') inString = false;
        nameEnd++;
        continue;
      }

      if (c === "'" || c === '"') {
        inString = true;
        quoteChar = c;
        nameEnd++;
        continue;
      }

      if ('([{'.includes(c)) depth++;
      if (')]}'.includes(c)) depth--;

      if (c === ':' && depth === 0 && !inString) {
        break;
      }

      nameEnd++;
    }

    const pipeName = pipePart.slice(0, nameEnd).trim();
    const argsStr = pipePart.slice(nameEnd + 1).trim();

    if (!argsStr) {
      return { name: pipeName, args: [] };
    }

    // ── Step 3: Split arguments on top-level commas ────────────────
    const rawArgs: string[] = [];
    current = '';
    depth = 0;
    inString = false;
    quoteChar = '';

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];

      if (inString) {
        current += char;
        if (char === quoteChar && argsStr[i - 1] !== '\\') {
          inString = false;
        }
        continue;
      }

      if (char === "'" || char === '"') {
        inString = true;
        quoteChar = char;
        current += char;
        continue;
      }

      if ('([{'.includes(char)) depth++;
      if (')]}'.includes(char)) depth--;

      if (char === ',' && depth === 0 && !inString) {
        if (current.trim()) rawArgs.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) rawArgs.push(current.trim());

    // ── Step 4: Parse each argument into real value ────────────────
    const parsedArgs = rawArgs.map((raw) => {
      const s = raw.trim();

      // 1. Quoted string
      if (
        (s.startsWith("'") && s.endsWith("'")) ||
        (s.startsWith('"') && s.endsWith('"'))
      ) {
        return s.slice(1, -1).replace(/\\(.)/g, '$1'); // unescape
      }

      // 2. Special literals
      if (s === 'true') return true;
      if (s === 'false') return false;
      if (s === 'null') return null;
      if (s === 'undefined') return undefined;

      // 3. Number
      if (/^-?\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(s)) {
        return Number(s);
      }

      // 4. Object / Array literal → try JSON parse
      if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
        try {
          return JSON.parse(s);
        } catch {
          const fixed = s
            .replace(/'/g, '"')                    // ' → "
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // {abc:1} → {"abc":1}

          try {
            return JSON.parse(fixed);
          } catch (e) {
            console.warn("Failed to parse object:", s, e);
            return null;
          }
        }
      }

      // 5. Nested expression / Angular interpolation / pipe chain
      if (s.includes('|') || (s.startsWith('{{') && s.endsWith('}}'))) {
        return s;
      }

      // 6. Otherwise: treat as identifier / path / raw string
      return s;
    });

    return {
      name: pipeName,
      args: parsedArgs,
    };
  });

  return { base, pipes };
}
