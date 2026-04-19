/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import { IAcRouteSnapshot } from "../interfaces/ac-route-snapshot.interface";
import { IAcRoute } from "../interfaces/ac-route.interface";
import { AcEventEmitter } from "./ac-event-emitter";

class AcRouter {
    private routes: IAcRoute[] = [];
    public routeChange = new AcEventEmitter<IAcRouteSnapshot>();
    private isPaused: boolean = false;
    lastSnapshot?:IAcRouteSnapshot;

    constructor() {
        window.addEventListener('hashchange', () => this.handleHashChange());
        window.addEventListener('load', () => this.handleHashChange());
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    registerRoutes(routes: IAcRoute[]) {
        this.routes = routes;
        // Trigger initial check if loaded
        if (document.readyState === 'complete' && !this.isPaused) {
            this.handleHashChange();
        }
    }

    navigateTo(path: string) {
        window.location.hash = path;
    }

    private handleHashChange() {
        if (this.isPaused) return;

        const hash = window.location.hash.slice(1) || '/'; // Default to '/' if empty
        // Remove query params for matching (basic support)
        const [path] = hash.split('?');

        this.matchRoute(path);
    }

    private matchRoute(url: string) {
        // Simple matching logic.
        // We need to find ALL routes that match (if we support multiple outlets for same path? No, path is unique).
        // Actually, usually one URL matches one main component.
        // Named outlets are usually for auxiliary routes or the route config defines multiple components for one path.
        // Standard Angular router: config has `component` OR `children`.
        // My plan: config has `component` and `outlet`.

        // Support for:
        // { path: '/home', component: HomeComponent } -> outlet: primary
        // { path: '/home', component: SidebarComponent, outlet: 'sidebar' } -> this implies TWO routes with same path?

        // Yes, if we want multiple outlets updating on same URL, we filter by path.

        // Let's iterate all routes and find ALL that match the current URL.

        let matchedRoutes = this.routes.filter(route => {
            if (route.path === '**' || route.path === '*') return false;
            // Simple exact match for now, or regex for params
            // Convert route path to regex: /users/:id -> /users/([^/]+)
            const regexPath = route.path.replace(/:([^\/]+)/g, '([^/]+)');
            const regex = new RegExp(`^${regexPath}$`);
            return regex.test(url);
        });

        if (matchedRoutes.length === 0) {
            // Try fallback
            matchedRoutes = this.routes.filter(route => route.path === '**' || route.path === '*');
            if (matchedRoutes.length === 0) {
                console.warn(`No route found for ${url}`);
                return;
            }
        }

        // Check for redirects
        const redirectRoute = matchedRoutes.find(r => r.redirectTo !== undefined);
        if (redirectRoute) {
            this.navigateTo(redirectRoute.redirectTo!);
            return;
        }

        // For each matched route, emit an event (or one event with multiple snapshots)
        // Actually, `AcRouter` (the component) will subscribe and filter by outlet name.

        matchedRoutes.forEach(route => {
            const params: Record<string, string> = {};

            if (route.path !== '**' && route.path !== '*') {
                const regexPath = route.path.replace(/:([^\/]+)/g, '([^/]+)');
                const regex = new RegExp(`^${regexPath}$`);
                const match = url.match(regex);

                if (match) {
                    // Extract param names
                    const paramNames = (route.path.match(/:([^\/]+)/g) || []).map(s => s.slice(1));
                    paramNames.forEach((name, index) => {
                        params[name] = match[index + 1];
                    });
                }
            }

            const snapshot: IAcRouteSnapshot = {
                path: url,
                element: route.element,
                params: params,
                data: route.data || {},
                outlet: route.outlet || 'primary'
            };
            this.lastSnapshot = snapshot;
            this.routeChange.emit(snapshot);
        });
    }
}

export const acRouter = new AcRouter();
