/**
 * Property/Method decorator that marks a class property or method to subscribe to changes of specified keys.
 *
 * @param keys - The keys to subscribe to (e.g. 'theme' or ['theme', 'layout']).
 * @returns A decorator (no-op at runtime).
 */
export function AcSubscribeChange(keys: string | string[]): PropertyDecorator & MethodDecorator {
    return function (_target: object, _propertyKey: string | symbol) {
      // Compile-time only — replaced by the ComponentCompiler
    };
}
