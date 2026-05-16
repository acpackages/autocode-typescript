/**
 * Property decorator that marks a class property as an external input.
 *
 * At **build time** the compiler:
 * 1. Makes this property **reactive** (signal-backed), so template
 *    bindings that reference it will automatically re-render.
 * 2. Adds the property name to `observedAttributes` on the generated
 *    `HTMLElement` subclass, enabling attribute-to-property forwarding.
 *
 * @param alias - (Reserved) Optional alias for the attribute name.
 *                Currently unused — the property name is used as-is.
 * @returns A property decorator (no-op at runtime).
 *
 * @example
 * ```ts
 * export class UserCard {
 *   @AcInput() name = 'Anonymous';
 *   // Usage: <user-card name="Alice"></user-card>
 * }
 * ```
 */
export function AcInput(alias?: string): PropertyDecorator {
    return function (_target: object, _propertyKey: string | symbol) {
      // Compile-time only — replaced by the ComponentCompiler
    };
}
