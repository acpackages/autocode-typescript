import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_BREADCRUMB_TAG, AC_BREADCRUMB_ITEM_TAG } from '../consts/ac-breadcrumb.const';

export class AcBreadcrumbElement extends AcElementBase {
  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-label', 'breadcrumb');
  }
}

export class AcBreadcrumbItemElement extends AcElementBase {
  static get observedAttributes() {
    return ['href', 'active'];
  }

  get href(): string | null {
    return this.getAttribute('href');
  }
  set href(val: string | null) {
    if (val) {
      this.setAttribute('href', val);
    } else {
      this.removeAttribute('href');
    }
  }

  get active(): boolean {
    return this.hasAttribute('active');
  }
  set active(val: boolean) {
    if (val) {
      this.setAttribute('active', '');
      this.setAttribute('aria-current', 'page');
    } else {
      this.removeAttribute('active');
      this.removeAttribute('aria-current');
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.renderContent();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'active') {
      if (newValue !== null) {
        this.setAttribute('aria-current', 'page');
      } else {
        this.removeAttribute('aria-current');
      }
    }
  }

  private renderContent(): void {
    if (this.href && !this.active && !this.querySelector('a')) {
      const text = this.textContent || '';
      const a = document.createElement('a');
      a.href = this.href;
      a.textContent = text;
      this.textContent = '';
      this.appendChild(a);
    }
  }
}

acRegisterCustomElement({ tag: AC_BREADCRUMB_TAG, type: AcBreadcrumbElement });
acRegisterCustomElement({ tag: AC_BREADCRUMB_ITEM_TAG, type: AcBreadcrumbItemElement });
