/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_INPUT_TAG } from "../consts/ac-input-tags.const";
import { AcInputElement } from "./ac-input-element.element";

export class AcNumberInput extends AcInputElement {

  static override get observedAttributes() {
    return [... super.observedAttributes, 'min', 'max', 'step'];
  }

  override get inputReflectedAttributes() {
    return [... super.inputReflectedAttributes, 'min', 'max', 'step'];
  }

  get min(): number {
    let result: number = 0;
    if (this.hasAttribute("min")) {
      result = parseFloat(this.getAttribute('min')!);
    }
    return result;
  }
  set min(value: number | string) {
    if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
      this.setAttribute('min', `${value}`);
      this.inputElement.setAttribute('min', `${value}`);
    }
    else {
      this.removeAttribute('min');
      this.inputElement.removeAttribute('min');
    }
  }

  get max(): number {
    let result: number = 0;
    if (this.hasAttribute("max")) {
      result = parseFloat(this.getAttribute('max')!);
    }
    return result;
  }
  set max(value: number | string) {
    if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
      this.setAttribute('max', `${value}`);
      this.inputElement.setAttribute('max', `${value}`);
    }
    else {
      this.removeAttribute('max');
      this.inputElement.removeAttribute('max');
    }
  }

  get step(): number | string {
    let result: number | string = 'any';
    if (this.hasAttribute("step")) {
      const s = this.getAttribute('step')!;
      if (s === 'any') {
        result = 'any';
      } else {
        const parsed = parseFloat(s);
        result = isNaN(parsed) ? 'any' : parsed;
      }
    }
    return result;
  }

  set step(value: number | string) {
    if (value === 'any' || (value !== null && value !== undefined && value !== '' && !isNaN(Number(value)) && Number(value) > 0)) {
      this.setAttribute('step', `${value}`);
      this.inputElement.setAttribute('step', `${value}`);
    }
    else {
      this.removeAttribute('step');
      this.inputElement.setAttribute('step', 'any');
    }
  }

  constructor() {
    super();
    this.inputElement.type = 'number';
    this.inputElement.setAttribute('step', 'any');
  }

  override init() {
    if(!this.hasAttribute('type')){
      this.type = 'number';
    }
    super.init();
    if (!this.hasAttribute('step')) {
      this.inputElement.setAttribute('step', 'any');
    }
  }

  override refreshReflectedAttributes({ attribute }: { attribute?: string } = {}) {
    super.refreshReflectedAttributes({ attribute });
    if (!attribute || attribute === 'step') {
      if (!this.hasAttribute('step')) {
        this.inputElement.setAttribute('step', 'any');
      }
    }
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    if (name == 'min') {
      this.min = newValue;
    }
    else if (name == 'max') {
      this.max = newValue;
    }
    else if (name == 'step') {
      this.step = newValue;
    }
    else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

}

acRegisterCustomElement({ tag: AC_INPUT_TAG.numberInput, type: AcNumberInput });
