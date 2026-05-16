/**
 * Lifecycle hook called once after the component's first render.
 *
 * Triggered in `connectedCallback` after `render()` completes.
 * Use this for initialization logic that requires DOM access
 * (e.g., fetching data, setting up subscriptions, focusing elements).
 *
 * @example
 * ```ts
 * export class MyComponent implements IAcOnInit {
 *   acOnInit() {
 *     console.log('Component mounted and rendered');
 *   }
 * }
 * ```
 */
export interface IAcOnInit {
    /** Called once after the component's first render. */
    acOnInit(): void;
}