import { IAcChangeArgs } from "./ac-change-args.interface";

/**
 * Lifecycle hook called when a specific reactive property changes.
 *
 * Similar to {@link IAcOnChange} but intended for fine-grained,
 * property-specific reactions. Receives the same {@link IAcChangeArgs}
 * payload.
 *
 * @example
 * ```ts
 * export class UserProfile implements IAcOnPropertyChange {
 *   acOnPropertyChange(change: IAcChangeArgs) {
 *     if (change.key === 'userId') {
 *       this.loadUserData(change.newValue);
 *     }
 *   }
 * }
 * ```
 */
export interface IAcOnPropertyChange {
    /**
     * Called when a specific reactive property changes.
     * @param change - Describes the property name and old/new values.
     */
    acOnPropertyChange(change: IAcChangeArgs): void;
}