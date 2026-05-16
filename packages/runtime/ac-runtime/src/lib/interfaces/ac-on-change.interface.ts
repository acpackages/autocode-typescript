import { IAcChangeArgs } from "./ac-change-args.interface";

/**
 * Lifecycle hook called when any reactive property on the component changes.
 *
 * Receives an {@link IAcChangeArgs} payload describing which property
 * changed and its old/new values. Useful for cross-cutting change
 * detection logic.
 *
 * @example
 * ```ts
 * export class Dashboard implements IAcOnChange {
 *   acOnChange(change: IAcChangeArgs) {
 *     console.log(`Property ${change.key} changed:`, change.oldValue, '→', change.newValue);
 *   }
 * }
 * ```
 */
export interface IAcOnChange {
    /**
     * Called when any reactive property changes.
     * @param change - Describes the property name and old/new values.
     */
    acOnChange(change: IAcChangeArgs): void;
}