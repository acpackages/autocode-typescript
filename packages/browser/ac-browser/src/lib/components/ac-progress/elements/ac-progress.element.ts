import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import {
  AC_PROGRESS_TAG,
  AC_PROGRESS_BAR_TAG,
  AcProgressVariant,
} from '../consts/ac-progress.const';

export class AcProgressElement extends AcElementBase {
  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'progressbar');
  }
}

export class AcProgressBarElement extends AcElementBase {
  static get observedAttributes() {
    return ['value', 'min', 'max', 'striped', 'animated', 'variant', 'label'];
  }

  get value(): number {
    return parseFloat(this.getAttribute('value') || '0');
  }
  set value(val: number) {
    this.setValue({ value: val });
  }

  get min(): number {
    return parseFloat(this.getAttribute('min') || '0');
  }
  set min(val: number) {
    this.setAttribute('min', val.toString());
    this.updateWidth();
  }

  get max(): number {
    return parseFloat(this.getAttribute('max') || '100');
  }
  set max(val: number) {
    this.setAttribute('max', val.toString());
    this.updateWidth();
  }

  get striped(): boolean {
    return this.hasAttribute('striped');
  }
  set striped(val: boolean) {
    if (val) this.setAttribute('striped', '');
    else this.removeAttribute('striped');
  }

  get animated(): boolean {
    return this.hasAttribute('animated');
  }
  set animated(val: boolean) {
    if (val) this.setAttribute('animated', '');
    else this.removeAttribute('animated');
  }

  get variant(): AcProgressVariant {
    return (this.getAttribute('variant') as AcProgressVariant) || 'primary';
  }
  set variant(val: AcProgressVariant) {
    this.setAttribute('variant', val);
  }

  get label(): string | null {
    return this.getAttribute('label');
  }
  set label(val: string | null) {
    if (val) {
      this.setAttribute('label', val);
      this.textContent = val;
    } else {
      this.removeAttribute('label');
      this.textContent = '';
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateWidth();
    if (this.label) {
      this.textContent = this.label;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'value' || name === 'min' || name === 'max') {
      this.updateWidth();
    } else if (name === 'label') {
      this.textContent = newValue ?? '';
    }
  }

  setValue({ value }: { value: number }): void {
    this.setAttribute('value', value.toString());
    this.updateWidth();
  }

  private updateWidth(): void {
    const min = this.min;
    const max = this.max;
    const val = this.value;
    const range = max - min;
    const percentage = range > 0 ? Math.min(100, Math.max(0, ((val - min) / range) * 100)) : 0;
    this.style.setProperty('--ac-progress-width', `${percentage}%`);
    this.setAttribute('aria-valuenow', val.toString());
    this.setAttribute('aria-valuemin', min.toString());
    this.setAttribute('aria-valuemax', max.toString());
  }
}

acRegisterCustomElement({ tag: AC_PROGRESS_TAG, type: AcProgressElement });
acRegisterCustomElement({ tag: AC_PROGRESS_BAR_TAG, type: AcProgressBarElement });
