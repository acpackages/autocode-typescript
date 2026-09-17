/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_INPUT_TAG } from "../consts/ac-input-tags.const";
import { AcInputBase } from "../core/ac-input-base";

export class AcRangeInputElement extends AcInputBase {
  static override get observedAttributes() {
    return [...super.observedAttributes, 'min', 'max', 'step'];
  }

  get min(): number {
    return parseFloat(this.getAttribute('min') || '0');
  }
  set min(val: number) {
    this.setAttribute('min', val.toString());
    this.inputElement.min = val.toString();
  }

  get max(): number {
    return parseFloat(this.getAttribute('max') || '100');
  }
  set max(val: number) {
    this.setAttribute('max', val.toString());
    this.inputElement.max = val.toString();
  }

  get step(): number {
    return parseFloat(this.getAttribute('step') || '1');
  }
  set step(val: number) {
    this.setAttribute('step', val.toString());
    this.inputElement.step = val.toString();
  }

  override inputElement: HTMLInputElement = this.ownerDocument.createElement('input');

  override init(): void {
    super.init();
    this.inputElement.type = 'range';
    if (!this.hasAttribute('min')) this.min = 0;
    if (!this.hasAttribute('max')) this.max = 100;
    if (!this.hasAttribute('step')) this.step = 1;
    this.inputElement.min = this.min.toString();
    this.inputElement.max = this.max.toString();
    this.inputElement.step = this.step.toString();
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    if (oldValue === newValue) return;
    if (name === 'min') {
      this.inputElement.min = newValue ?? '0';
    } else if (name === 'max') {
      this.inputElement.max = newValue ?? '100';
    } else if (name === 'step') {
      this.inputElement.step = newValue ?? '1';
    } else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }
}

acRegisterCustomElement({ tag: AC_INPUT_TAG.rangeInput, type: AcRangeInputElement });
