import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_BADGE_TAG, AcBadgeVariant } from '../consts/ac-badge.const';

export class AcBadgeElement extends AcElementBase {
  static get observedAttributes() {
    return ['variant', 'pill'];
  }

  get variant(): AcBadgeVariant {
    return (this.getAttribute('variant') as AcBadgeVariant) || 'primary';
  }
  set variant(val: AcBadgeVariant) {
    this.setAttribute('variant', val);
  }

  get pill(): boolean {
    return this.hasAttribute('pill');
  }
  set pill(val: boolean) {
    if (val) {
      this.setAttribute('pill', '');
    } else {
      this.removeAttribute('pill');
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('variant')) {
      this.variant = 'primary';
    }
  }
}

acRegisterCustomElement({ tag: AC_BADGE_TAG, type: AcBadgeElement });
