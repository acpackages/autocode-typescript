/**
 * @module router
 *
 * Lightweight client-side router for AC Runtime applications.
 *
 * Provides:
 * - {@link IAcRoute} — Route definition interface.
 * - {@link AcRouterElement} — `<ac-router>` custom element that renders
 *   the matched component inside itself.
 * - {@link AcRouter} — Singleton router class managing route registration,
 *   navigation, and URL matching.
 * - {@link acRouter} — Pre-created singleton instance, ready to use.
 *
 * The router listens for `popstate` events (browser back/forward) and
 * exposes a publish/subscribe model so multiple `<ac-router>` outlets
 * can react to URL changes.
 */

// ─── Route Definition ────────────────────────────────────────────────────────

/**
 * Describes a single route entry in the routing table.
 *
 * @example
 * ```ts
 * const routes: IAcRoute[] = [
 *   { path: '/dashboard', component: 'app-dashboard' },
 *   { path: '**', component: 'app-not-found' },
 * ];
 * ```
 */
export interface IAcRoute {
  /** URL path to match (exact match). Use `'*'` or `'**'` for wildcard. */
  path: string;

  /**
   * Optional class/constructor reference with a `selector` or `name`.
   * If `selector` is missing, the class `name` is converted from
   * PascalCase to kebab-case (e.g., `AppDashboard` → `app-dashboard`).
   */
  element?: { selector?: string; name?: string };

  /** Custom element tag name to create when this route is active. */
  component?: string;

  /**
   * Optional route guard. Return `false` or a `Promise<false>` to
   * prevent navigation to this route.
   */
  canActivate?: () => boolean | Promise<boolean>;
}

// ─── Router Outlet Element ───────────────────────────────────────────────────

/**
 * `<ac-router>` custom element — renders the component matching the
 * current URL inside itself.
 *
 * **Lifecycle:**
 * 1. On `connectedCallback`, subscribes to the {@link acRouter} singleton.
 * 2. On each URL change, matches the route and creates the corresponding
 *    custom element, replacing the previous one.
 * 3. On `disconnectedCallback`, unsubscribes to prevent memory leaks.
 *
 * Supports `pause()` / `resume()` to temporarily ignore route changes
 * (useful during transitions or modal overlays).
 *
 * @example
 * ```html
 * <ac-router></ac-router>
 * ```
 */
export class AcRouterElement extends HTMLElement {
  /** Reference to the currently rendered child component. */
  private currentComponent: HTMLElement | null = null;

  /** When `true`, route change notifications are ignored. */
  private _paused = false;

  /** Cleanup function returned by `acRouter.subscribe()`. */
  private _unsubscribe: (() => void) | null = null;

  /** Subscribe to route changes when the element enters the DOM. */
  connectedCallback(): void {
    this._unsubscribe = acRouter.subscribe((url: string) => {
      if (this._paused) return;
      const route = acRouter.match(url);
      if (route) {
        this.renderRoute(route);
      }
    });
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

  /**
   * Create and mount the component for the matched route.
   * Skips re-rendering if the same component tag is already mounted.
   *
   * @param route - The matched route definition.
   */
  private renderRoute(route: IAcRoute): void {
    const selector = route.component
      || (route.element
        ? route.element.selector || route.element.name?.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)
        : null);
    if (!selector) return;

    // Skip re-render if the same component is already mounted
    if (this.currentComponent?.tagName.toLowerCase() === selector.toLowerCase()) {
      return;
    }

    this.currentComponent?.remove();
    this.currentComponent = document.createElement(selector);
    this.appendChild(this.currentComponent);
  }
}

// ─── Router Singleton ────────────────────────────────────────────────────────

/**
 * Singleton router managing route registration, URL matching, and navigation.
 *
 * Uses the **Singleton pattern** — obtain the instance via
 * `AcRouter.getInstance()` or use the pre-exported {@link acRouter} constant.
 *
 * **Internal mechanics:**
 * - Maintains a `Set` of listener callbacks notified on every URL change.
 * - Listens for browser `popstate` events (back/forward button).
 * - Provides imperative `navigate()` for programmatic navigation.
 * - Matches routes via exact path comparison, falling back to wildcard
 *   routes (`'*'` or `'**'`).
 */
class AcRouter {
  /** The single shared instance. */
  private static instance: AcRouter;

  /** Registered route definitions. */
  private routes: IAcRoute[] = [];

  /** Active subscriber callbacks. Uses `Set` for O(1) unsubscribe. */
  private readonly listeners = new Set<(url: string) => void>();

  /**
   * Private constructor — listens for `popstate` to handle
   * browser back/forward navigation.
   */
  private constructor() {
    window.addEventListener('popstate', () => {
      this.notify(window.location.pathname);
    });
  }

  /**
   * Returns the singleton router instance, creating it on first call.
   */
  static getInstance(): AcRouter {
    if (!this.instance) this.instance = new AcRouter();
    return this.instance;
  }

  /**
   * Register the application's route table and trigger the initial
   * route resolution (deferred to the next microtask via `setTimeout`).
   *
   * @param routes - Array of route definitions.
   */
  registerRoutes(routes: IAcRoute[]): void {
    this.routes = routes;
    setTimeout(() => this.notify(window.location.pathname), 0);
  }

  /**
   * Programmatically navigate to a new path.
   * Pushes a new entry into `window.history` and notifies all listeners.
   *
   * @param path - The target URL path (e.g., `'/dashboard'`).
   */
  navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.notify(path);
  }

  /**
   * Subscribe to URL change notifications.
   *
   * @param callback - Invoked with the new URL path on each change.
   * @returns An unsubscribe function.
   */
  subscribe(callback: (url: string) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Find the first route whose `path` exactly matches the given URL,
   * or fall back to a wildcard route (`'*'` or `'**'`).
   *
   * @param url - The URL path to match against.
   * @returns The matched route, or `undefined` if none found.
   */
  match(url: string): IAcRoute | undefined {
    return this.routes.find(r => r.path === url)
      || this.routes.find(r => r.path === '**' || r.path === '*');
  }

  /**
   * Broadcast a URL change to all registered listeners.
   * @param url - The new URL path.
   */
  private notify(url: string): void {
    for (const listener of this.listeners) {
      listener(url);
    }
  }
}

/** Pre-created singleton router instance. */
export const acRouter = AcRouter.getInstance();

// Register <ac-router> as a custom element (idempotent)
if (!customElements.get('ac-router')) {
  customElements.define('ac-router', AcRouterElement);
}
