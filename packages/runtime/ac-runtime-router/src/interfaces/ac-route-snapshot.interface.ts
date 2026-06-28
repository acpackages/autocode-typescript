export interface IAcRouteSnapshot {
  /** The matched URL path (without query params). */
  path: string;
  /** The component class reference from the route definition. */
  element?: { selector?: string; name?: string };
  /** Extracted URL parameters (e.g., `{ id: '123' }` from `/users/:id`). */
  params: Record<string, string>;
  /** Static data from the route definition. */
  data: Record<string, any>;
  /** The outlet name this route targets. */
  outlet: string;
}
