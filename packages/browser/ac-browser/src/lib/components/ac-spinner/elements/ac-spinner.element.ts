import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import {
  AC_SPINNER_TAG,
  AcSpinnerType,
  AcSpinnerSize,
  AcSpinnerVariant,
} from '../consts/ac-spinner.const';

export class AcSpinnerElement extends AcElementBase {
  static get observedAttributes() {
    return ['type', 'size', 'variant'];
  }

  get type(): AcSpinnerType {
    return (this.getAttribute('type') as AcSpinnerType) || 'border';
  }
  set type(val: AcSpinnerType) {
    this.setAttribute('type', val);
  }

  get size(): AcSpinnerSize {
    return (this.getAttribute('size') as AcSpinnerSize) || 'md';
  }
  set size(val: AcSpinnerSize) {
    this.setAttribute('size', val);
  }

  get variant(): AcSpinnerVariant {
    return (this.getAttribute('variant') as AcSpinnerVariant) || 'primary';
  }
  set variant(val: AcSpinnerVariant) {
    this.setAttribute('variant', val);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'status');
    if (!this.hasAttribute('type')) this.type = 'border';
    if (!this.hasAttribute('variant')) this.variant = 'primary';
  }
}

acRegisterCustomElement({ tag: AC_SPINNER_TAG, type: AcSpinnerElement });
