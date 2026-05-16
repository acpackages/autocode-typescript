/**
 * Payload object delivered to lifecycle hooks that report property changes.
 *
 * Used by {@link IAcOnChange} and {@link IAcOnPropertyChange} to describe
 * which property changed and what its previous/new values are.
 *
 * @typeParam T - The type of the property values. Defaults to `unknown`.
 *
 * @example
 * ```ts
 * acOnChange(change: IAcChangeArgs<string>) {
 *   console.log(`${change.key} changed from ${change.oldValue} to ${change.newValue}`);
 * }
 * ```
 */
export interface IAcChangeArgs<T = unknown> {
    /** Identifier key for the change event (e.g., the property name). */
    key: string;

    /** The property name that changed (may differ from `key` in nested cases). */
    property?: string;

    /** The previous value before the change. */
    oldValue?: T;

    /** The new value after the change. */
    newValue?: T;
}