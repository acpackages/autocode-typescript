/**
 * Internal metadata describing a `@AcViewChild` mapping.
 *
 * Captures the relationship between a component class property and
 * the template reference (`#ref`) it points to. Used by the compiler
 * to generate the `Object.defineProperty` getter at build time.
 */
export interface IAcElementViewChildMetadata {
  /** The class property name decorated with `@AcViewChild`. */
  propertyKey: string;

  /** The template reference key (the value after `#` in the template). */
  referenceKey: string;
}