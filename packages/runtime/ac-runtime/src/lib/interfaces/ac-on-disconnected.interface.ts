/**
 * Lifecycle hook called when the component's host element is removed
 * from the document's DOM tree.
 *
 * This maps directly to the native `disconnectedCallback` on the
 * underlying `HTMLElement`. Note that the element may be re-connected
 * later (e.g., when moved in the DOM), so avoid irreversible cleanup
 * unless you are certain the element won't be reused.
 */
export interface IAcOnDisconnected {
    /** Called when the host element is disconnected from the DOM. */
    acOnDisconnected(): void;
}