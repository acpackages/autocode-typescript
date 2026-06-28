export interface IAcRoute {
  /** URL path to match (exact or parameterized). Use `'*'` or `'**'` for wildcard/fallback. */
  path: string;

  /**
   * Component class reference. Must have a static `selector` property
   * (set by the AC Runtime Compiler) or a `name` property that will be
   * converted from PascalCase to kebab-case.
   */
  element?: { selector?: string; name?: string };
  /** Optional static data passed to the route snapshot. */
  data?: Record<string, any>;

  /** Named outlet this route targets. Defaults to `'primary'`. */
  outlet?: string;

  /** If set, navigates to this path instead of rendering. */
  redirectTo?: string;

  /**
   * Optional route guard. Return `false` or a `Promise<false>` to
   * prevent navigation to this route.
   */
  canActivate?: () => boolean | Promise<boolean>;
}
