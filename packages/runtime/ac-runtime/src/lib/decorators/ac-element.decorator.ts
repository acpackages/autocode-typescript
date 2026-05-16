import { IAcElementMetadata } from "../interfaces/ac-element-metadata.interface";

/**
 * Class decorator that marks a class as an AC Runtime component.
 *
 * At **development time** this is a no-op — it exists only to provide
 * type-safe metadata for the IDE and TypeScript compiler.
 *
 * At **build time** the {@link ComponentCompiler} reads the `@AcElement`
 * decorator from the AST, extracts the metadata (selector, template,
 * styles), and generates a self-contained Web Component IIFE that:
 * 1. Creates a signal-backed reactive class from the original class body.
 * 2. Registers a `customElements.define()` call with the given selector.
 * 3. Injects scoped styles into `<head>` with reference counting.
 *
 * @param metadata - Configuration object describing the component's
 *                   selector, template, and styles.
 * @returns A class decorator (no-op at runtime).
 *
 * @example
 * ```ts
 * @AcElement({
 *   selector: 'app-header',
 *   template: '<h1>{{title}}</h1>',
 *   styles: ':host { display: block; }'
 * })
 * export class AppHeader {
 *   title = 'Hello';
 * }
 * ```
 */
export function AcElement(metadata: IAcElementMetadata): ClassDecorator {
  return function (_constructor: Function) {
    // Compile-time only — replaced by the ComponentCompiler
  };
}
