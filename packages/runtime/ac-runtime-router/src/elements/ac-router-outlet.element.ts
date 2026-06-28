import { acRouter } from "../core/ac-router";
import { IAcRouteSnapshot } from "../interfaces/ac-route-snapshot.interface";

export class AcRouterOutletElement extends HTMLElement {
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
