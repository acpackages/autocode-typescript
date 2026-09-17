import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_CLOSE_BUTTON_TAG } from '../consts/ac-close-button.const';

export class AcCloseButtonElement extends AcElementBase {
  static get observedAttributes() {
    return ['disabled', 'white'];
  }

  private btnEl!: HTMLButtonElement;

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(val: boolean) {
    if (val) {
      this.setAttribute('disabled', '');
      if (this.btnEl) this.btnEl.disabled = true;
    } else {
      this.removeAttribute('disabled');
      if (this.btnEl) this.btnEl.disabled = false;
    }
  }

  get white(): boolean {
    return this.hasAttribute('white');
  }
  set white(val: boolean) {
    if (val) this.setAttribute('white', '');
    else this.removeAttribute('white');
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.btnEl) {
      this.btnEl = document.createElement('button');
      this.btnEl.type = 'button';
      this.btnEl.setAttribute('aria-label', 'Close');
      this.btnEl.disabled = this.disabled;
      this.appendChild(this.btnEl);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'disabled') {
      if (this.btnEl) this.btnEl.disabled = newValue !== null;
    }
  }
}

acRegisterCustomElement({ tag: AC_CLOSE_BUTTON_TAG, type: AcCloseButtonElement });
