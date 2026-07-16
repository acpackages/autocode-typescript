/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcRouterOutletElement } from "../elements/ac-router-outlet.element";
import { IAcRouteSnapshot } from "../interfaces/ac-route-snapshot.interface";
import { IAcRoute } from "../interfaces/ac-route.interface";

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
  basePath: string = '';

  get currentRoute(): any {
    return this.lastSnapshot;
  }

  /**
   * Private constructor — listens for `hashchange` to handle
   * browser navigation (back/forward, hash link clicks).
   */
  private constructor() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('load', () => {
      if (!this.basePath) {
        this.basePath = window.location.origin;
      }
      let hash = window.location.href.substring(this.basePath.length);
      if (window.location.hash.length > 0) {
        hash = window.location.hash;
      }
      let queryString: string = "";
      if (hash.indexOf("?") > 0) {
        queryString = hash.substring(hash.indexOf("?")+1);
        hash = hash.substring(0, hash.indexOf('?'));
      }
      if (hash.indexOf("#") >= 0) {
        hash = hash.substring(hash.indexOf('#') + 1);
      }
      if (queryString != '') {
        hash += "?" + queryString;
      }
      window.history.replaceState({}, '', `${this.basePath}/#`);
      console.log(hash);
      this.navigateTo({ path: hash });
    });
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
  registerRoutes({ routes }: { routes: IAcRoute[] }): void {
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
  navigateTo({ path }: { path: string }): void {
    let hash: string = path;
    if (!path.startsWith("/")) {
      hash = "/" + hash;
    }
    window.location.hash = hash;
  }

  /**
   * Subscribe to URL change notifications.
   *
   * @param callback - Invoked with the new URL path on each change.
   * @returns An unsubscribe function.
   */
  subscribe({ callback }: { callback: (url: string) => void }): () => void {
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
    console.log("Route Changed", path, this.isPaused);
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
      this.navigateTo({ path: redirectRoute.redirectTo! });
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
if (!customElements.get('ac-router-outlet')) {
  customElements.define('ac-router-outlet', AcRouterOutletElement);
}
