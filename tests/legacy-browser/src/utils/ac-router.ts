export interface IAcRoute {
  label: string;
  path: string;
  componentTag: string;
  component: any;
}

export interface IAcRouteGroup {
  label: string;
  routes: IAcRoute[]
}

export class AcRouter {
  static routeGroups: IAcRouteGroup[] = [];
  static routes: IAcRoute[] = [];

  static registerRoute(route: IAcRoute) {
    this.routes.push(route);
    customElements.define(route.componentTag, route.component);
  }

  static registerRouteGroup(routeGroup: IAcRouteGroup) {
    this.routeGroups.push(routeGroup);
    for (const route of routeGroup.routes) {
      this.registerRoute(route);
    }
  }

  static defineRoutes(routes: IAcRoute[]) {
    this.routes = routes;
    window.addEventListener('popstate', () => this.loadRoute(location.pathname));
    document.addEventListener('click', this.interceptLinks);
    this.loadRoute(location.pathname);
  }

  private static interceptLinks = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.hasAttribute('href')) {
      const href = target.getAttribute('href')!;
      console.log(href);
      if (href.startsWith('/')) {
        e.preventDefault();
        this.navigate(href);
      }
    }
  };

  static navigate(path: string) {
    history.pushState({}, '', path);
    this.loadRoute(path);
  }

  static loadRoute(path: string) {
    const match = this.routes.find(route => route.path === path || (route.path === '' && path === '/'));
    const outlet = document.querySelector('ac-router-outlet') as HTMLElement;
    outlet.style.display = 'contents';
    if (!match || !outlet) return;
    outlet.innerHTML = '';
    const el = document.createElement(match.componentTag);
    outlet.appendChild(el);
  }
}
