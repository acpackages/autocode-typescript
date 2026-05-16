/**
 * Property decorator that provides a reference to a template element
 * identified by a `#ref` marker in the component's template.
 *
 * At **build time** the compiler:
 * 1. Scans the template for `#selector` attributes and maps them to
 *    internally-generated `ac-ref` IDs.
 * 2. Generates an `Object.defineProperty` getter on the component
 *    instance that calls `this.element.querySelector('[ac-ref="..."]')`
 *    each time the property is accessed.
 *
 * This provides lazy, always-fresh DOM references without manual
 * `querySelector` calls in component code.
 *
 * @param selector - The template reference name (without the `#` prefix).
 *                   Must match a `#name` attribute in the template.
 * @returns A property decorator (no-op at runtime).
 *
 * @example
 * ```ts
 * @AcElement({
 *   selector: 'my-form',
 *   template: '<input #nameInput type="text" />'
 * })
 * export class MyForm {
 *   @AcViewChild('nameInput') nameInput!: HTMLInputElement;
 *
 *   acOnInit() {
 *     this.nameInput.focus(); // Direct DOM access
 *   }
 * }
 * ```
 */
export function AcViewChild(selector: string): PropertyDecorator {
    return function (_target: object, _propertyKey: string | symbol) {
      // Compile-time only — replaced by the ComponentCompiler
    };
}