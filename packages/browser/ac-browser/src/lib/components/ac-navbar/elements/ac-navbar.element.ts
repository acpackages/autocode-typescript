import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import {
  AC_NAVBAR_TAG,
  AC_NAVBAR_BRAND_TAG,
  AC_NAVBAR_NAV_TAG,
  AC_NAVBAR_ITEM_TAG,
  AcNavbarExpand,
  AcNavbarTheme,
} from '../consts/ac-navbar.const';

export class AcNavbarElement extends AcElementBase {
  static get observedAttributes() {
    return ['expand', 'theme'];
  }

  get expand(): AcNavbarExpand | null {
    return this.getAttribute('expand') as AcNavbarExpand | null;
  }
  set expand(val: AcNavbarExpand | null) {
    if (val) this.setAttribute('expand', val);
    else this.removeAttribute('expand');
  }

  get theme(): AcNavbarTheme {
    return (this.getAttribute('theme') as AcNavbarTheme) || 'light';
  }
  set theme(val: AcNavbarTheme) {
    this.setAttribute('theme', val);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'navigation');
    if (!this.hasAttribute('theme')) {
      this.theme = 'light';
    }
  }
}

export class AcNavbarBrandElement extends AcElementBase {
  static get observedAttributes() {
    return ['href'];
  }

  get href(): string | null {
    return this.getAttribute('href');
  }
  set href(val: string | null) {
    if (val) this.setAttribute('href', val);
    else this.removeAttribute('href');
  }
}

export class AcNavbarNavElement extends AcElementBase {
  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menubar');
  }
}

export class AcNavbarItemElement extends AcElementBase {
  static get observedAttributes() {
    return ['href', 'active', 'disabled'];
  }

  get href(): string | null {
    return this.getAttribute('href');
  }
  set href(val: string | null) {
    if (val) this.setAttribute('href', val);
    else this.removeAttribute('href');
  }

  get active(): boolean {
    return this.hasAttribute('active');
  }
  set active(val: boolean) {
    if (val) this.setAttribute('active', '');
    else this.removeAttribute('active');
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(val: boolean) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
  }
}

acRegisterCustomElement({ tag: AC_NAVBAR_TAG, type: AcNavbarElement });
acRegisterCustomElement({ tag: AC_NAVBAR_BRAND_TAG, type: AcNavbarBrandElement });
acRegisterCustomElement({ tag: AC_NAVBAR_NAV_TAG, type: AcNavbarNavElement });
acRegisterCustomElement({ tag: AC_NAVBAR_ITEM_TAG, type: AcNavbarItemElement });
