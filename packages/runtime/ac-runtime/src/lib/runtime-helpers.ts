/**
 * @module runtime-helpers
 *
 * Provides runtime utility classes used alongside AC Runtime decorators.
 * Currently exports {@link AcEventEmitter}, the typed event emitter used
 * with `@AcOutput()` decorated properties.
 */

/**
 * A lightweight, typed event emitter used as the development-time API
 * for `@AcOutput()` decorated properties.
 *
 * At **compile time** the {@link ComponentCompiler} replaces this with
 * native `CustomEvent` dispatching on the host `HTMLElement`. This class
 * exists solely to provide a type-safe authoring experience during
 * development.
 *
 * @typeParam T - The payload type carried by emitted events.
 *               Defaults to `void` (no payload) to enforce explicit typing.
 *
 * @example
 * ```ts
 * import { AcOutput, AcEventEmitter } from 'ac-runtime';
 *
 * export class MyButton {
 *   @AcOutput() clicked = new AcEventEmitter<MouseEvent>();
 *
 *   handleClick(e: MouseEvent) {
 *     this.clicked.emit(e); // Compiled to: this.element.dispatchEvent(...)
 *   }
 * }
 * ```
 */
export class AcEventEmitter<T = void> {
  /** Internal set of subscriber callbacks. Uses `Set` for O(1) add/delete. */
  private readonly listeners = new Set<(value: T) => void>();

  /**
   * Emit an event, invoking all current subscribers synchronously.
   *
   * @param value - The payload to deliver. Optional when `T` is `void`.
   */
  emit(value?: T): void {
    for (const fn of this.listeners) {
      fn(value as T);
    }
  }

  /**
   * Register a callback to be invoked on each {@link emit} call.
   *
   * @param fn - The subscriber function.
   * @returns An unsubscribe function. Call it to remove the listener.
   *
   * @example
   * ```ts
   * const unsub = emitter.subscribe(val => console.log(val));
   * // Later:
   * unsub(); // Removes the listener
   * ```
   */
  subscribe(fn: (value: T) => void): { unsubscribe: () => void } {
    this.listeners.add(fn);
    return {
      unsubscribe: () => {
        this.listeners.delete(fn);
      }
    };
  }
}
