/**
 * @module router
 *
 * Lightweight client-side router for AC Runtime applications.
 *
 * Provides:
 * - {@link IAcRoute} — Route definition interface.
 * - {@link IAcRouteSnapshot} — Snapshot of the matched route with params.
 * - {@link AcRouterElement} — `<ac-router>` custom element that renders
 *   the matched component inside itself.
 * - {@link AcRouter} — Singleton router class managing route registration,
 *   navigation, and URL matching.
 * - {@link acRouter} — Pre-created singleton instance, ready to use.
 *
 * The router uses **hash-based routing** (`#/path`) for compatibility
 * with file:// protocol, WebView, and mobile environments. It listens
 * for `hashchange` events and exposes a publish/subscribe model so
 * multiple `<ac-router>` outlets can react to URL changes.
 */

// ─── Route Definition ────────────────────────────────────────────────────────

/**
 * Describes a single route entry in the routing table.
 *
 * @example
 * ```ts
 * const routes: IAcRoute[] = [
 *   { path: '/dashboard', element: DashboardComponent },
 *   { path: '/users/:id', element: UserDetailComponent },
 *   { path: '**', element: NotFoundComponent },
 * ];
 * ```
 */
export interface IAcRoute {
  /** URL path to match (exact or parameterized). Use `'*'` or `'**'` for wildcard/fallback. */
  path: string;

  /**
   * Component class reference. Must have a static `selector` property
   * (set by the AC Runtime Compiler) or a `name` property that will be
   * converted from PascalCase to kebab-case.
   */
  element?: { selector?: string; name?: string };

  /** Custom element tag name to create when this route is active. */
  component?: string;

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

/**
 * Snapshot of a matched route, including extracted URL parameters.
 */
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

// ─── Router Outlet Element ───────────────────────────────────────────────────

/**
 * `<ac-router>` custom element — renders the component matching the
 * current URL inside itself.
 *
 * **Lifecycle:**
 * 1. On `connectedCallback`, subscribes to the {@link acRouter} singleton.
 * 2. On each hash change, matches the route and creates the corresponding
 *    custom element, replacing the previous one.
 * 3. On `disconnectedCallback`, unsubscribes to prevent memory leaks.
 *
 * Supports `pause()` / `resume()` to temporarily ignore route changes
 * (useful during tab management or modal overlays).
 */
export class AcRouterElement extends HTMLElement {
  /** Reference to the currently rendered child component. */
  private currentComponent: HTMLElement | null = null;

  /** The selector tag of the currently rendered component. */
  private currentSelector: string | null = null;

  /** The path of the currently rendered route (for wildcard route detection). */
  private currentPath: string | null = null;

  /** When `true`, route change notifications are ignored. */
  private _paused = false;

  /** Cleanup function returned by `acRouter.routeChange.subscribe()`. */
  private _unsubscribe: (() => void) | null = null;

  /** Last handled snapshot for refresh support. */
  lastSnapshot: IAcRouteSnapshot | null = null;

  /** Subscribe to route changes when the element enters the DOM. */
  connectedCallback(): void {
    this.style.display = 'contents';
    this._unsubscribe = acRouter.routeChange.subscribe((snapshot: IAcRouteSnapshot) => {
      if (this._paused) return;
      this.handleRouteChange(snapshot);
    });
    // If router already has a last snapshot (late connection), render it
    if (acRouter.lastSnapshot) {
      this.handleRouteChange(acRouter.lastSnapshot);
    }
  }

  /** Unsubscribe from route changes when removed from the DOM. */
  disconnectedCallback(): void {
    this._unsubscribe?.();
    this._unsubscribe = null;
  }

  /** Temporarily stop reacting to route changes. */
  pause(): void {
    this._paused = true;
  }

  /** Resume reacting to route changes after a {@link pause}. */
  resume(): void {
    this._paused = false;
  }

  /** Re-handle the last snapshot (useful after pause/resume). */
  refresh(): void {
    const snapshot = this.lastSnapshot || acRouter.lastSnapshot;
    if (snapshot) {
      this.handleRouteChange(snapshot);
    }
  }

  /**
   * Handle a route change by creating and mounting the matched component.
   *
   * @param snapshot - The matched route snapshot.
   */
  private handleRouteChange(snapshot: IAcRouteSnapshot): void {
    this.lastSnapshot = snapshot;
    const ComponentClass = snapshot.element;
    if (!ComponentClass) return;

    // Resolve the custom element tag name
    const selector = this.resolveSelector(ComponentClass);
    if (!selector) return;

    // Skip re-render ONLY if the same component AND same path are already mounted
    // (path must be checked because wildcard routes use the same selector for all pages)
    if (this.currentSelector === selector && this.currentPath === snapshot.path && this.currentComponent) {
      return;
    }

    // Clear current content
    this.clearContent();

    // Create and mount the new component
    this.currentSelector = selector;
    this.currentPath = snapshot.path;
    this.currentComponent = document.createElement(selector);
    this.appendChild(this.currentComponent);
  }

  /**
   * Resolve the custom element tag name from a component class.
   * Checks `selector` static property first (set by compiler),
   * then falls back to PascalCase → kebab-case conversion.
   */
  private resolveSelector(componentClass: any): string | null {
    if (!componentClass) return null;

    // 1. Direct component string
    if (typeof componentClass === 'string') return componentClass;

    // 2. Static `selector` property (set by AC Runtime Compiler)
    if (componentClass.selector) return componentClass.selector;

    // 3. Derive from class name: PascalCase → kebab-case
    if (componentClass.name) {
      return componentClass.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1); // Remove leading dash
    }

    return null;
  }

  /** Remove current child component from the DOM. */
  private clearContent(): void {
    if (this.currentComponent) {
      this.currentComponent.remove();
      this.currentComponent = null;
      this.currentSelector = null;
      this.currentPath = null;
    }
    // Also clear any remaining children
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
  }
}

// ─── Lightweight Event Emitter ───────────────────────────────────────────────

/**
 * Minimal typed event emitter used internally by the router.
 * Uses `Set` for O(1) add/delete of subscribers.
 */
class RouterEventEmitter<T> {
  private readonly listeners = new Set<(value: T) => void>();

  emit(value: T): void {
    for (const fn of this.listeners) {
      fn(value);
    }
  }

  subscribe(fn: (value: T) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
}

// ─── Router Singleton ────────────────────────────────────────────────────────

/**
 * Singleton router managing route registration, URL matching, and navigation.
 *
 * Uses **hash-based routing** (`#/path`) for maximum compatibility with
 * file:// protocol, Android WebView, iOS Safari, and in-app webviews.
 *
 * Uses the **Singleton pattern** — obtain the instance via
 * `AcRouter.getInstance()` or use the pre-exported {@link acRouter} constant.
 *
 * **Internal mechanics:**
 * - Listens for `hashchange` events on the window.
 * - Extracts the path from `window.location.hash`.
 * - Matches routes via regex-based path comparison with parameter extraction.
 * - Falls back to wildcard routes (`'*'` or `'**'`) if no exact match.
 * - Emits `IAcRouteSnapshot` objects to all subscribers.
 */
export class AcRouter {
  /** The single shared instance. */
  private static instance: AcRouter;

  /** Registered route definitions. */
  private routes: IAcRoute[] = [];

  /** Typed event emitter for route changes. */
  readonly routeChange = new RouterEventEmitter<IAcRouteSnapshot>();

  /** Whether route processing is paused. */
  private isPaused = false;

  /** The last emitted route snapshot (for late subscribers). */
  lastSnapshot?: IAcRouteSnapshot;

  /**
   * Private constructor — listens for `hashchange` to handle
   * browser navigation (back/forward, hash link clicks).
   */
  private constructor() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('load', () => this.handleHashChange());
  }

  /**
   * Returns the singleton router instance, creating it on first call.
   */
  static getInstance(): AcRouter {
    if (!this.instance) this.instance = new AcRouter();
    return this.instance;
  }

  /** Temporarily pause route processing. */
  pause(): void {
    this.isPaused = true;
  }

  /** Resume route processing after a pause. */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Register the application's route table and trigger the initial
   * route resolution if the document is already loaded.
   *
   * @param routes - Array of route definitions.
   */
  registerRoutes(routes: IAcRoute[]): void {
    this.routes = routes;
    // Trigger initial check if already loaded
    if (document.readyState === 'complete' && !this.isPaused) {
      this.handleHashChange();
    }
  }

  /**
   * Programmatically navigate to a new hash path.
   *
   * @param path - The target path (e.g., `'/dashboard'`).
   */
  navigateTo(path: string): void {
    window.location.hash = path;
  }

  /**
   * Programmatically navigate using history API with hash.
   *
   * @param path - The target URL path (e.g., `'/dashboard'`).
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Subscribe to URL change notifications.
   *
   * @param callback - Invoked with the new URL path on each change.
   * @returns An unsubscribe function.
   */
  subscribe(callback: (url: string) => void): () => void {
    return this.routeChange.subscribe((snapshot) => {
      callback(snapshot.path);
    });
  }

  /**
   * Find the first route whose `path` matches the given URL,
   * supporting parameterized routes (`:id`) and wildcards (`**`).
   *
   * @param url - The URL path to match against.
   * @returns The matched route, or `undefined` if none found.
   */
  match(url: string): IAcRoute | undefined {
    // Try exact/parameterized match first
    for (const route of this.routes) {
      if (route.path === '**' || route.path === '*') continue;
      const regexPath = route.path.replace(/:([^/]+)/g, '([^/]+)');
      const regex = new RegExp(`^${regexPath}$`);
      if (regex.test(url)) return route;
    }
    // Fallback to wildcard
    return this.routes.find(r => r.path === '**' || r.path === '*');
  }

  /**
   * Extract the current path from the URL hash.
   * @returns The path portion of the hash (without query params).
   */
  private getCurrentPath(): string {
    const hash = window.location.hash.slice(1) || '/';
    const [path] = hash.split('?');
    return path;
  }

  /**
   * Handle a hash change event by matching the route and emitting snapshots.
   */
  private handleHashChange(): void {

    const path = this.getCurrentPath();
    console.log("Route Changed",path,this.isPaused);
    if (this.isPaused) return;
    this.matchRoute(path);
  }

  /**
   * Match the given URL path against registered routes, extract parameters,
   * handle redirects, and emit route snapshots.
   *
   * @param url - The URL path to match.
   */
  private matchRoute(url: string): void {
    // Find all matching routes (supports multiple outlets)
    let matchedRoutes = this.routes.filter(route => {
      if (route.path === '**' || route.path === '*') return false;
      const regexPath = route.path.replace(/:([^/]+)/g, '([^/]+)');
      const regex = new RegExp(`^${regexPath}$`);
      return regex.test(url);
    });

    // Fallback to wildcard if no match
    if (matchedRoutes.length === 0) {
      matchedRoutes = this.routes.filter(r => r.path === '**' || r.path === '*');
      if (matchedRoutes.length === 0) {
        console.warn(`[AcRouter] No route found for ${url}`);
        return;
      }
    }

    // Handle redirects
    const redirectRoute = matchedRoutes.find(r => r.redirectTo !== undefined);
    if (redirectRoute) {
      this.navigateTo(redirectRoute.redirectTo!);
      return;
    }

    // Emit a snapshot for each matched route
    for (const route of matchedRoutes) {
      const params: Record<string, string> = {};

      if (route.path !== '**' && route.path !== '*') {
        const regexPath = route.path.replace(/:([^/]+)/g, '([^/]+)');
        const regex = new RegExp(`^${regexPath}$`);
        const match = url.match(regex);

        if (match) {
          const paramNames = (route.path.match(/:([^/]+)/g) || []).map(s => s.slice(1));
          paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });
        }
      }

      const snapshot: IAcRouteSnapshot = {
        path: url,
        element: route.element,
        params,
        data: route.data || {},
        outlet: route.outlet || 'primary',
      };
      this.lastSnapshot = snapshot;
      this.routeChange.emit(snapshot);
    }
  }
}

/** Pre-created singleton router instance. */
export const acRouter = AcRouter.getInstance();

// Register <ac-router> as a custom element (idempotent)
if (!customElements.get('ac-router')) {
  customElements.define('ac-router', AcRouterElement);
}
