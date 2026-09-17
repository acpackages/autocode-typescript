import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import {
  AC_LIST_GROUP_TAG,
  AC_LIST_GROUP_ITEM_TAG,
  AcListGroupItemVariant,
} from '../consts/ac-list-group.const';

export class AcListGroupElement extends AcElementBase {
  static get observedAttributes() {
    return ['flush', 'horizontal'];
  }

  get flush(): boolean {
    return this.hasAttribute('flush');
  }
  set flush(val: boolean) {
    if (val) this.setAttribute('flush', '');
    else this.removeAttribute('flush');
  }

  get horizontal(): boolean {
    return this.hasAttribute('horizontal');
  }
  set horizontal(val: boolean) {
    if (val) this.setAttribute('horizontal', '');
    else this.removeAttribute('horizontal');
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'list');
  }
}

export class AcListGroupItemElement extends AcElementBase {
  static get observedAttributes() {
    return ['active', 'disabled', 'action', 'variant'];
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

  get action(): boolean {
    return this.hasAttribute('action');
  }
  set action(val: boolean) {
    if (val) this.setAttribute('action', '');
    else this.removeAttribute('action');
  }

  get variant(): AcListGroupItemVariant | null {
    return this.getAttribute('variant') as AcListGroupItemVariant | null;
  }
  set variant(val: AcListGroupItemVariant | null) {
    if (val) this.setAttribute('variant', val);
    else this.removeAttribute('variant');
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }
}

acRegisterCustomElement({ tag: AC_LIST_GROUP_TAG, type: AcListGroupElement });
acRegisterCustomElement({ tag: AC_LIST_GROUP_ITEM_TAG, type: AcListGroupItemElement });
