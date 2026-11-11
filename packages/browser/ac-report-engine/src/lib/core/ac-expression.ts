// ac-expression.ts
import { AcReportEngine } from "./ac-report-engine";
import { evaluateAcPipeExpression } from '@autocode-ts/ac-pipes';

export class AcExpression {
  private static fnCache: Map<string, Function> = new Map();
  private static maxCacheSize = 2000;

  static clearCache(): void {
    AcExpression.fnCache.clear();
  }

  /**
   * Evaluate an expression with full async pipe support and compiled function caching
   */
  static async evaluate({
    expression,
    context,
  }: {
    expression: string;
    context: any;
  }): Promise<any> {
    try {
      return await evaluateAcPipeExpression({
        expression,
        context,
        evaluateFunction: ({ expression, context }: { expression: string; context: any }) => {
          const keys = Object.keys(context);
          const cacheKey = `${keys.join(',')}|${expression}`;

          let fn = AcExpression.fnCache.get(cacheKey);
          if (!fn) {
            if (AcExpression.fnCache.size >= AcExpression.maxCacheSize) {
              AcExpression.fnCache.clear();
            }
            fn = new Function(...keys, `return (${expression});`);
            AcExpression.fnCache.set(cacheKey, fn);
          }

          return fn(...Object.values(context));
        },
      });
    } catch (ex) {
      AcReportEngine.logError(`Expression evaluation failed: "${expression}"`, ex);
      return '';
    }
  }
}
