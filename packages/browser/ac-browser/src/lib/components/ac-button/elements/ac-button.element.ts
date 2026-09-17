import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_BUTTON_TAG, AC_BUTTON_GROUP_TAG, AcButtonVariant, AcButtonSize } from '../consts/ac-button.const';

export class AcButtonElement extends AcElementBase {
  static get observedAttributes() {
    return ['variant', 'outline', 'size', 'disabled', 'type', 'loading'];
  }

  private buttonEl!: HTMLButtonElement;

  get variant(): AcButtonVariant {
    return (this.getAttribute('variant') as AcButtonVariant) || 'primary';
  }
  set variant(val: AcButtonVariant) {
    this.setAttribute('variant', val);
  }

  get outline(): boolean {
    return this.hasAttribute('outline');
  }
  set outline(val: boolean) {
    if (val) this.setAttribute('outline', '');
    else this.removeAttribute('outline');
  }

  get size(): AcButtonSize {
    return (this.getAttribute('size') as AcButtonSize) || 'md';
  }
  set size(val: AcButtonSize) {
    this.setAttribute('size', val);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(val: boolean) {
    if (val) {
      this.setAttribute('disabled', '');
      if (this.buttonEl) this.buttonEl.disabled = true;
    } else {
      this.removeAttribute('disabled');
      if (this.buttonEl) this.buttonEl.disabled = false;
    }
  }

  get type(): 'button' | 'submit' | 'reset' {
    return (this.getAttribute('type') as any) || 'button';
  }
  set type(val: 'button' | 'submit' | 'reset') {
    this.setAttribute('type', val);
    if (this.buttonEl) this.buttonEl.type = val;
  }

  get loading(): boolean {
    return this.hasAttribute('loading');
  }
  set loading(val: boolean) {
    this.setLoading({ loading: val });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.buttonEl) {
      this.buttonEl = document.createElement('button');
      this.buttonEl.type = this.type;
      this.buttonEl.disabled = this.disabled;

      while (this.firstChild) {
        this.buttonEl.appendChild(this.firstChild);
      }
      this.appendChild(this.buttonEl);
    }
    if (!this.hasAttribute('variant')) {
      this.variant = 'primary';
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'disabled') {
      if (this.buttonEl) this.buttonEl.disabled = newValue !== null;
    } else if (name === 'type') {
      if (this.buttonEl) this.buttonEl.type = (newValue as any) || 'button';
    }
  }

  setLoading({ loading }: { loading: boolean }): void {
    if (loading) {
      this.setAttribute('loading', '');
      this.disabled = true;
    } else {
      this.removeAttribute('loading');
      this.disabled = false;
    }
  }
}

export class AcButtonGroupElement extends AcElementBase {
  static get observedAttributes() {
    return ['vertical', 'size'];
  }

  get vertical(): boolean {
    return this.hasAttribute('vertical');
  }
  set vertical(val: boolean) {
    if (val) this.setAttribute('vertical', '');
    else this.removeAttribute('vertical');
  }

  get size(): AcButtonSize {
    return (this.getAttribute('size') as AcButtonSize) || 'md';
  }
  set size(val: AcButtonSize) {
    this.setAttribute('size', val);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'group');
  }
}

acRegisterCustomElement({ tag: AC_BUTTON_TAG, type: AcButtonElement });
acRegisterCustomElement({ tag: AC_BUTTON_GROUP_TAG, type: AcButtonGroupElement });
