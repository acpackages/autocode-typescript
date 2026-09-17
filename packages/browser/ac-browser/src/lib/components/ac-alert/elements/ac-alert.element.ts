import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_ALERT_TAG, AcAlertVariant } from '../consts/ac-alert.const';

export class AcAlertElement extends AcElementBase {
  static get observedAttributes() {
    return ['variant', 'dismissible', 'fade'];
  }

  private closeBtn?: HTMLButtonElement;

  get variant(): AcAlertVariant {
    return (this.getAttribute('variant') as AcAlertVariant) || 'primary';
  }
  set variant(val: AcAlertVariant) {
    this.setAttribute('variant', val);
  }

  get dismissible(): boolean {
    return this.hasAttribute('dismissible');
  }
  set dismissible(val: boolean) {
    if (val) {
      this.setAttribute('dismissible', '');
    } else {
      this.removeAttribute('dismissible');
    }
  }

  get fade(): boolean {
    return this.hasAttribute('fade');
  }
  set fade(val: boolean) {
    if (val) {
      this.setAttribute('fade', '');
      this.classList.add('fade');
    } else {
      this.removeAttribute('fade');
      this.classList.remove('fade');
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'alert');
    if (!this.hasAttribute('variant')) {
      this.variant = 'primary';
    }
    this.setupDismissibleButton();
    this.classList.add('show');
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'dismissible') {
      this.setupDismissibleButton();
    } else if (name === 'fade') {
      if (newValue !== null) {
        this.classList.add('fade');
      } else {
        this.classList.remove('fade');
      }
    }
  }

  private setupDismissibleButton(): void {
    if (this.dismissible) {
      if (!this.closeBtn) {
        this.closeBtn = document.createElement('button');
        this.closeBtn.type = 'button';
        this.closeBtn.className = 'ac-alert-close';
        this.closeBtn.setAttribute('aria-label', 'Close');
        this.closeBtn.innerHTML = '&times;';
        this.closeBtn.addEventListener('click', () => this.close());
        this.appendChild(this.closeBtn);
      }
    } else if (this.closeBtn) {
      this.closeBtn.remove();
      this.closeBtn = undefined;
    }
  }

  close({ animated = true }: { animated?: boolean } = {}): void {
    const closeEvent = new CustomEvent('close', { bubbles: true, cancelable: true });
    this.dispatchEvent(closeEvent);
    if (closeEvent.defaultPrevented) return;

    if (animated && this.fade) {
      this.classList.remove('show');
      setTimeout(() => {
        this.remove();
        this.dispatchEvent(new CustomEvent('closed', { bubbles: true }));
      }, 150);
    } else {
      this.remove();
      this.dispatchEvent(new CustomEvent('closed', { bubbles: true }));
    }
  }

  show(): void {
    this.removeAttribute('hidden');
    this.classList.add('show');
  }
}

acRegisterCustomElement({ tag: AC_ALERT_TAG, type: AcAlertElement });
