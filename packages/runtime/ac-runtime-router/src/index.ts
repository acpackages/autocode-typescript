export interface Route {
    path: string;
    component: string; // Selector for the component
    canActivate?: () => boolean | Promise<boolean>;
}

export class AcRouter {
    private static instance: AcRouter;
    private routes: Route[] = [];
    private listeners: ((url: string) => void)[] = [];

    private constructor() {
        window.addEventListener('popstate', () => {
            this.notify(window.location.pathname);
        });
    }

    static getInstance() {
        if (!this.instance) this.instance = new AcRouter();
        return this.instance;
    }

    setRoutes(routes: Route[]) {
        this.routes = routes;
        // Trigger initial route
        setTimeout(() => this.notify(window.location.pathname), 0);
    }

    navigate(path: string) {
        window.history.pushState({}, '', path);
        this.notify(path);
    }

    subscribe(callback: (url: string) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notify(url: string) {
        this.listeners.forEach(l => l(url));
    }

    match(url: string): Route | undefined {
        // Simple exact match for now, can be upgraded to regex
        return this.routes.find(r => r.path === url) || this.routes.find(r => r.path === '*');
    }
}

// Router Outlet Component
export class AcRouterOutlet extends HTMLElement {
    private currentComponent: HTMLElement | null = null;
    private unsubscribe?: () => void;

    connectedCallback() {
        const router = AcRouter.getInstance();
        this.unsubscribe = router.subscribe(async (url) => {
            const route = router.match(url);
            if (route) {
                // Check Guard
                if (route.canActivate) {
                    const can = await route.canActivate();
                    if (!can) return;
                }
                this.renderComponent(route.component);
            }
        });
    }

    disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
    }

    private renderComponent(selector: string) {
        if (this.currentComponent && this.currentComponent.tagName.toLowerCase() === selector.toLowerCase()) {
            return;
        }

        if (this.currentComponent) {
            this.currentComponent.remove();
        }

        this.currentComponent = document.createElement(selector);
        this.appendChild(this.currentComponent);
    }
}

// Router Link Component
export class AcRouterLink extends HTMLElement {
    connectedCallback() {
        this.style.cursor = 'pointer';
        this.addEventListener('click', (e) => {
            e.preventDefault();
            const to = this.getAttribute('to');
            if (to) {
                AcRouter.getInstance().navigate(to);
            }
        });
    }
}

// Global registration helper
export function provideRouter(routes: Route[]) {
    if (!customElements.get('ac-router-outlet')) {
        customElements.define('ac-router-outlet', AcRouterOutlet);
    }
    if (!customElements.get('ac-router-link')) {
        customElements.define('ac-router-link', AcRouterLink);
    }
    AcRouter.getInstance().setRoutes(routes);
}
