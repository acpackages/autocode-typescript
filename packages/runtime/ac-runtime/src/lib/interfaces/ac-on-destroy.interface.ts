/**
 * Lifecycle hook called when the component is being removed from the DOM.
 *
 * Triggered in `disconnectedCallback`. Use this for cleanup logic
 * (e.g., removing event listeners, cancelling timers, closing
 * WebSocket connections, unsubscribing from observables).
 *
 * @example
 * ```ts
 * export class MyComponent implements IAcOnDestroy {
 *   private intervalId?: number;
 *
 *   acOnInit() {
 *     this.intervalId = setInterval(() => this.tick(), 1000);
 *   }
 *
 *   acOnDestroy() {
 *     clearInterval(this.intervalId);
 *   }
 * }
 * ```
 */
export interface IAcOnDestroy {
    /** Called when the component is removed from the DOM. */
    acOnDestroy(): void;
}