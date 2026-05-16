/**
 * Lifecycle hook called when the component's host element is inserted
 * into the document's DOM tree.
 *
 * This maps directly to the native `connectedCallback` on the
 * underlying `HTMLElement`. Use this when you need to know the exact
 * moment the element enters the DOM (before rendering).
 */
export interface IAcOnConnected {
    /** Called when the host element is connected to the DOM. */
    acOnConnected(): void;
}