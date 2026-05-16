/**
 * Property decorator that marks a class property as an event output.
 *
 * At **development time** the property should be initialized with an
 * {@link AcEventEmitter} instance for type-safe `emit()` calls.
 *
 * At **build time** the compiler replaces the `AcEventEmitter` with
 * an inline object whose `emit()` method dispatches a native
 * `CustomEvent` on the host element, enabling parent components to
 * listen via `(eventName)="handler($event)"` syntax.
 *
 * @param alias - (Reserved) Optional alias for the event name.
 *                Currently unused — the property name is used as-is.
 * @returns A property decorator (no-op at runtime).
 *
 * @example
 * ```ts
 * export class ConfirmButton {
 *   @AcOutput() confirmed = new AcEventEmitter<boolean>();
 *
 *   onConfirm() {
 *     this.confirmed.emit(true);
 *     // Compiled to: this.element.dispatchEvent(new CustomEvent('confirmed', { detail: true }))
 *   }
 * }
 * ```
 */
export function AcOutput(alias?: string): PropertyDecorator {
    return function (_target: object, _propertyKey: string | symbol) {
      // Compile-time only — replaced by the ComponentCompiler
    };
}
