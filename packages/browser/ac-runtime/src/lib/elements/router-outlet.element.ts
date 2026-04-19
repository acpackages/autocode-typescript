/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AC_RUNTIME_CONFIG } from '../consts/ac-runtime-config.const';
import { acRouter } from '../core/router';
import { AcElement, getAcElementMetadata } from '../decorators/ac-element.decorator';
import { AcInput } from '../decorators/ac-input.decorator';
import { IAcRouteSnapshot } from '../interfaces/ac-route-snapshot.interface';

@AcElement({
  selector: 'ac-router',
  template: '', // Empty by default, content injected by router
})
export class AcRouterElement {
  @AcInput() name?: string;
  element!: HTMLElement;
  private isPaused: boolean = false;
  private routerSub?: () => void;
  lastSnapshot: any;

  async acOnInit() {
    // Subscribe to router
    this.routerSub = acRouter.routeChange.subscribe((snapshot: IAcRouteSnapshot) => {
      if (!this.isPaused) {
        this.handleRouteChange(snapshot);
      }
    });
    if (this.element) {
      if (acRouter.lastSnapshot) {
        this.handleRouteChange(acRouter.lastSnapshot);
      }
    }
  }

  acOnDestroy() {
    if (this.routerSub) {
      this.routerSub();
    }
  }

  async handleRouteChange(snapshot: IAcRouteSnapshot) {
    if (this.name) {
      if (snapshot.outlet !== this.name) {
        return; // Not for this outlet
      }
    }
    // Clear current content
    if (!this.element) {
      AC_RUNTIME_CONFIG.logError('[AcRouter] handleRouteChange called but this.element is undefined on instance:', this);
      return;
    }
    this.element.innerHTML = '';

    const ComponentClass = snapshot.element;
    if (!ComponentClass) return;

    // 1. Instantiate the component container element based on its selector
    const metadata = getAcElementMetadata(ComponentClass);
    if (!metadata) {
      AC_RUNTIME_CONFIG.logError(`[AcRouter] No metadata found for component ${ComponentClass.name}`);
      return;
    }

    // Determine the tag or attribute to create
    const selectors = metadata.selector.split(',').map((s: string) => s.trim());
    let hostElement: HTMLElement | null = null;

    const tagSelector = selectors.find((s: string) => /^[a-z][a-z0-9-]*$/i.test(s));
    if (tagSelector) {
      hostElement = document.createElement(tagSelector);
    }

    if (!hostElement) {
      const attrSelector = selectors.find((s: string) => s.startsWith('[') && s.endsWith(']'));
      if (attrSelector) {
        hostElement = document.createElement('div');
        const attrName = attrSelector.slice(1, -1);
        hostElement.setAttribute(attrName, '');
      }
    }

    // Add other selector support if needed (class, ID etc.)
    if (!hostElement) {
      hostElement = document.createElement('div');
      // Fallback: use first selector or generic div
      const first = selectors[0];
      if (first.startsWith('.')) hostElement.className = first.slice(1);
      else if (first.startsWith('#')) hostElement.id = first.slice(1);
    }

    if (hostElement) {
      // Append to router - MutationObserver will handle bootstrapping
      this.element.appendChild(hostElement);
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  refresh() {
    if (this.lastSnapshot) {
      this.handleRouteChange(this.lastSnapshot);
    }
    else if (acRouter.lastSnapshot) {
      this.handleRouteChange(acRouter.lastSnapshot);
    }
  }

}
