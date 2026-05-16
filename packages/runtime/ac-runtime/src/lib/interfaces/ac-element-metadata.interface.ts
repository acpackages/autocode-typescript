/**
 * Configuration object passed to the `@AcElement()` decorator.
 *
 * Describes how the component should be registered as a custom element,
 * where its template and styles come from, and how they should be applied.
 *
 * @example
 * ```ts
 * @AcElement({
 *   selector: 'app-card',
 *   templateUrl: './card.html',
 *   styleUrls: ['./card.css'],
 * })
 * ```
 */
export interface IAcElementMetadata {
  /**
   * The custom element tag name (e.g., `'app-header'`).
   * Must follow the Web Components naming convention (contain a hyphen).
   */
  selector: string;

  /**
   * Inline HTML template string. Mutually exclusive with `templateUrl`.
   * Supports AC template syntax: `{{expr}}`, `[prop]`, `(event)`,
   * `ac:if`, `ac:for`, `ac:model`, `ac:class:`, `ac:style:`, `ac:bind:`, `#ref`.
   */
  template?: string;

  /**
   * Relative path to an external HTML template file.
   * Resolved relative to the component's `.ts` file at compile time.
   */
  templateUrl?: string;

  /**
   * Inline CSS styles. Can be a single string or array of strings.
   * `:host` selectors are automatically replaced with the component's
   * tag selector for scoping.
   */
  styles?: string | string[];

  /**
   * Relative paths to external CSS/SCSS files.
   * Resolved relative to the component's `.ts` file at compile time.
   */
  styleUrls?: string[];
}