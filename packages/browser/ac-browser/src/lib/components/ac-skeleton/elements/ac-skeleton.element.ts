import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import {
  AC_SKELETON_TAG,
  AcSkeletonType,
  AcSkeletonAnimation,
} from '../consts/ac-skeleton.const';

export class AcSkeletonElement extends AcElementBase {
  static get observedAttributes() {
    return ['type', 'animation', 'width', 'height'];
  }

  get type(): AcSkeletonType {
    return (this.getAttribute('type') as AcSkeletonType) || 'text';
  }
  set type(val: AcSkeletonType) {
    this.setAttribute('type', val);
  }

  get animation(): AcSkeletonAnimation {
    return (this.getAttribute('animation') as AcSkeletonAnimation) || 'pulse';
  }
  set animation(val: AcSkeletonAnimation) {
    this.setAttribute('animation', val);
  }

  get width(): string | null {
    return this.getAttribute('width');
  }
  set width(val: string | null) {
    if (val) {
      this.setAttribute('width', val);
      this.style.width = val;
    } else {
      this.removeAttribute('width');
      this.style.width = '';
    }
  }

  get height(): string | null {
    return this.getAttribute('height');
  }
  set height(val: string | null) {
    if (val) {
      this.setAttribute('height', val);
      this.style.height = val;
    } else {
      this.removeAttribute('height');
      this.style.height = '';
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
    if (this.width) this.style.width = this.width;
    if (this.height) this.style.height = this.height;
    if (!this.hasAttribute('type')) this.type = 'text';
    if (!this.hasAttribute('animation')) this.animation = 'pulse';
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'width') {
      this.style.width = newValue ?? '';
    } else if (name === 'height') {
      this.style.height = newValue ?? '';
    }
  }
}

acRegisterCustomElement({ tag: AC_SKELETON_TAG, type: AcSkeletonElement });
