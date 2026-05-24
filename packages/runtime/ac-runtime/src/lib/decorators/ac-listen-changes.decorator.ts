/**
 * Property decorator that marks a property as a change listener key list.
 *
 * The property value should be an array of keys to listen to.
 * The compiler extracts the property name and its initializer keys.
 *
 * @example
 * ```ts
 * @AcListenChanges()
 * themeListeners = ['theme', 'layout'];
 * ```
 *
 * @returns A property decorator (no-op at runtime).
 */
export function AcListenChanges(): PropertyDecorator {
    return function (_target: object, _propertyKey: string | symbol) {
      // Compile-time only — replaced by the ComponentCompiler
    };
}
