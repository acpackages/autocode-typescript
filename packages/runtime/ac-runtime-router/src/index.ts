/**
 * @module ac-runtime-router
 *
 * Standalone router package for AC Runtime applications.
 *
 * Provides three web components and a setup function for client-side routing:
 *
 * - {@link AcRouter} — Singleton router service managing route state.
 * - {@link AcRouterOutlet} — `<ac-router-outlet>` element that renders
 *   the matched component, with support for async route guards.
 * - {@link AcRouterLink} — `<ac-router-link to="/path">` element for
 *   declarative navigation links (prevents full page reloads).
 * - {@link provideRouter} — Bootstrap function that registers custom
 *   elements and sets the initial route table.
 *
 * @example
 * ```ts
 * import { provideRouter } from 'ac-runtime-router';
 *
 * provideRouter([
 *   { path: '/', component: 'app-home' },
 *   { path: '/about', component: 'app-about' },
 *   { path: '*', component: 'app-not-found' },
 * ]);
 * ```
 */

// ─── Route Definition ────────────────────────────────────────────────────────

/**
 * Describes a single route entry in the routing table.
 *
 * @example
 * ```ts
 * const route: Route = {
 *   path: '/admin',
 *   component: 'admin-panel',
 *   canActivate: () => isLoggedIn(),
 * };
 * ```
 */
export interface Route {
    /** URL path to match. Use `'*'` as a catch-all wildcard. */
    path: string;

    /** Custom element tag name to render when this route is active. */
    component: string;

    /**
     * Optional async guard function. Return `false` or `Promise<false>`
     * to prevent navigation. The route component will not be rendered.
     */
    canActivate?: () => boolean | Promise<boolean>;
}

// ─── Router Singleton ────────────────────────────────────────────────────────

/**
 * Singleton client-side router managing route state and navigation.
 *
 * **Design:** Uses the Singleton pattern to ensure a single source of
 * truth for routing state. All `<ac-router-outlet>` elements subscribe
 * to the same instance.
 *
 * **Navigation methods:**
 * - `navigate(path)` — Programmatic navigation (pushes history state).
 * - `popstate` event — Automatically handled for browser back/forward.
 *
 * **Matching:** Currently uses exact path matching, falling back to
 * a wildcard route (`'*'`) if no exact match is found.
 */
export class AcRouter {
    /** The single shared instance. */
    private static instance: AcRouter;

    /** Registered route definitions. */
    private routes: Route[] = [];

    /** Active listener callbacks. Uses `Set` for O(1) add/remove. */
    private readonly listeners = new Set<(url: string) => void>();

    /**
     * Private constructor — sets up `popstate` listener for browser
     * back/forward button handling.
     */
    private constructor() {
        window.addEventListener('popstate', () => {
            this.notify(window.location.pathname);
        });
    }

    /** Returns the singleton router instance, creating it on first call. */
    static getInstance(): AcRouter {
        if (!this.instance) this.instance = new AcRouter();
        return this.instance;
    }

    /**
     * Register the application's route table.
     * Triggers an initial route resolution on the next microtask.
     *
     * @param routes - Array of {@link Route} definitions.
     */
    setRoutes(routes: Route[]): void {
        this.routes = routes;
        // Trigger initial route on next microtask so all elements are connected
        setTimeout(() => this.notify(window.location.pathname), 0);
    }

    /**
     * Navigate to a new URL path programmatically.
     * Pushes a new browser history entry and notifies all subscribers.
     *
     * @param path - Target URL path (e.g., `'/dashboard'`).
     */
    navigate(path: string): void {
        window.history.pushState({}, '', path);
        this.notify(path);
    }

    /**
     * Subscribe to route change notifications.
     *
     * @param callback - Function called with the new URL path.
     * @returns Unsubscribe function — call to remove the listener.
     */
    subscribe(callback: (url: string) => void): () => void {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
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

    /**
     * Find the first route matching the given URL path.
     * Falls back to a wildcard route (`'*'`) if no exact match is found.
     *
     * @param url - The URL path to match.
     * @returns The matched route, or `undefined` if none found.
     */
    match(url: string): Route | undefined {
        // Simple exact match for now, can be upgraded to regex
        return this.routes.find(r => r.path === url)
            || this.routes.find(r => r.path === '*');
    }
}

// ─── Router Outlet Component ─────────────────────────────────────────────────

/**
 * `<ac-router-outlet>` — Custom element that renders the component
 * matching the current URL.
 *
 * **Lifecycle:**
 * 1. `connectedCallback` — Subscribes to the {@link AcRouter} singleton.
 * 2. On each URL change, matches the route, runs the optional guard,
 *    and creates/replaces the active component element.
 * 3. `disconnectedCallback` — Unsubscribes to prevent memory leaks.
 *
 * Skips re-rendering if the same component tag is already mounted
 * (e.g., navigating to a different sub-path handled by the same component).
 */
export class AcRouterOutlet extends HTMLElement {
    /** Reference to the currently rendered child component. */
    private currentComponent: HTMLElement | null = null;

    /** Cleanup function from router subscription. */
    private unsubscribe?: () => void;

    /** Subscribe to route changes when connected to the DOM. */
    connectedCallback(): void {
        const router = AcRouter.getInstance();
        this.unsubscribe = router.subscribe(async (url) => {
            const route = router.match(url);
            if (route) {
                // Check guard before rendering
                if (route.canActivate) {
                    const can = await route.canActivate();
                    if (!can) return;
                }
                this.renderComponent(route.component);
            }
        });
    }

    /** Unsubscribe from route changes when removed from the DOM. */
    disconnectedCallback(): void {
        this.unsubscribe?.();
        this.unsubscribe = undefined;
    }

    /**
     * Create and mount the component for the matched route.
     * No-ops if the same component is already active.
     *
     * @param selector - The custom element tag name to create.
     */
    private renderComponent(selector: string): void {
        if (this.currentComponent?.tagName.toLowerCase() === selector.toLowerCase()) {
            return;
        }

        this.currentComponent?.remove();
        this.currentComponent = document.createElement(selector);
        this.appendChild(this.currentComponent);
    }
}

// ─── Router Link Component ───────────────────────────────────────────────────

/**
 * `<ac-router-link to="/path">` — Declarative navigation element.
 *
 * Prevents the default browser navigation (full page reload) and
 * instead uses the {@link AcRouter} to perform client-side navigation.
 *
 * Automatically manages its click listener lifecycle:
 * - Adds the listener on `connectedCallback`.
 * - Removes it on `disconnectedCallback` to prevent memory leaks.
 *
 * @example
 * ```html
 * <ac-router-link to="/settings">Settings</ac-router-link>
 * ```
 */
export class AcRouterLink extends HTMLElement {
    /** Bound click handler — stored as a class field for proper cleanup. */
    private handleClick = (e: Event): void => {
        e.preventDefault();
        const to = this.getAttribute('to');
        if (to) {
            AcRouter.getInstance().navigate(to);
        }
    };

    /** Register click handler and set cursor style. */
    connectedCallback(): void {
        this.style.cursor = 'pointer';
        this.addEventListener('click', this.handleClick);
    }

    /** Remove click handler to prevent memory leaks. */
    disconnectedCallback(): void {
        this.removeEventListener('click', this.handleClick);
    }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * One-call bootstrap function for the AC router system.
 *
 * Registers `<ac-router-outlet>` and `<ac-router-link>` as custom
 * elements (idempotent) and sets the route table on the singleton router.
 *
 * @param routes - The application's route definitions.
 *
 * @example
 * ```ts
 * provideRouter([
 *   { path: '/', component: 'app-home' },
 *   { path: '/about', component: 'app-about' },
 *   { path: '*', component: 'app-not-found' },
 * ]);
 * ```
 */
export function provideRouter(routes: Route[]): void {
    if (!customElements.get('ac-router-outlet')) {
        customElements.define('ac-router-outlet', AcRouterOutlet);
    }
    if (!customElements.get('ac-router-link')) {
        customElements.define('ac-router-link', AcRouterLink);
    }
    AcRouter.getInstance().setRoutes(routes);
}
