import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_FLOATING_LABEL_TAG } from '../consts/ac-floating-label.const';

export class AcFloatingLabelElement extends AcElementBase {
  static get observedAttributes() {
    return ['label'];
  }

  private labelEl?: HTMLLabelElement;

  get label(): string {
    return this.getAttribute('label') ?? '';
  }
  set label(val: string) {
    this.setAttribute('label', val);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupLabel();
    this.setupInputListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'label') {
      if (this.labelEl) this.labelEl.textContent = newValue ?? '';
    }
  }

  private setupLabel(): void {
    if (this.label && !this.labelEl) {
      this.labelEl = document.createElement('label');
      this.labelEl.textContent = this.label;
      this.appendChild(this.labelEl);
    }
  }

  private setupInputListeners(): void {
    const input = this.querySelector('input, textarea, select') as HTMLInputElement | null;
    if (input) {
      const checkValue = () => {
        if (input.value && input.value.trim() !== '') {
          this.classList.add('floating');
        } else {
          this.classList.remove('floating');
        }
      };
      input.addEventListener('input', checkValue);
      input.addEventListener('change', checkValue);
      checkValue();
    }
  }
}

acRegisterCustomElement({ tag: AC_FLOATING_LABEL_TAG, type: AcFloatingLabelElement });
