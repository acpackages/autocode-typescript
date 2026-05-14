/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcEnumInputType } from "../enums/ac-enum-input-type.enum";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcInputCssClassName } from "../consts/ac-input-css-class-name.const";
import { AcInputElement } from "./ac-input-element.element";
import { AC_INPUT_TAG } from "../consts/ac-input-tags.const";

export class AcOptionInputElement extends AcInputElement {
  static override get observedAttributes() {
    return [... super.observedAttributes, 'is-array', 'label-element', 'value-checked', 'value-unchecked'];
  }

  get checked(): boolean {
    return this.getAttribute('checked') == 'true';
  }
  set checked(value: boolean) {
    const currentChecked = this.checked;
    if (currentChecked != value) {
      this.inputElement.checked = value;
      if (value) {
        this.setAttribute('checked', 'true');
        this.inputElement.setAttribute('checked', 'true');
      }
      else if (!value) {
        this.removeAttribute('checked');
        this.inputElement.removeAttribute('checked');
      }
    }
  }

  get isArray(): boolean {
    return this.getAttribute('is-array') == 'true';
  }
  set isArray(value: boolean) {
    this.setAttribute('is-array', `${value}`)
  }

  private _labelElements: HTMLElement[] = [];
  get labelElement(): string | null {
    return this.getAttribute('label-element');
  }
  set labelElement(value: HTMLElement | string) {
    if (this._labelElements.length > 0) {
      for (const labelElement of this._labelElements) {
        // labelElement.removeEventListener('click');
      }
    }
    const elements: HTMLElement[] = [];
    if (typeof value == 'string') {
      for (const element of Array.from(document.querySelectorAll(value))) {
        elements.push(element as HTMLElement);
      }
    }
    else {
      elements.push(value);
    }
    for (const label of elements) {
      label.addEventListener('click', ()=>{
         this.checked = !this.checked;
      });
      this._labelElements.push(label);
    }
  }

  get valueUnchecked(): any {
    let result;
    if (this.hasAttribute('value-unchecked')) {
      result = this.getAttribute('value-unchecked')!;
    }
    return result;
  }
  set valueUnchecked(value: any) {
    this.setAttribute('value-unchecked', value);
  }

  override set type(value: string) {
    if (value == '') {
      value = 'checkbox';
    }
    this.setAttribute('type', value);
    this.inputElement.setAttribute('type', value);
    if (value.toLowerCase() == AcEnumInputType.Checkbox.toLowerCase()) {
      if (this.isArray == false) {
        this.isArray = true;
      }
    }
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    if (name == 'is-array') {
      this.isArray = newValue;
    }
    else if (name == 'label-element') {
      this.labelElement = newValue;
    }
    else if (name == 'checked') {
      this.checked = newValue;
    }
    else if (name == 'value') {
      this.value = newValue;
    }
    else if (name == 'value-unchecked') {
      this.valueUnchecked = newValue;
    }
    else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  override init(): void {
    if(!this.hasAttribute('type')){
      this.type = AcEnumInputType.Checkbox;
    }
    acAddClassToElement({ class_: AcInputCssClassName.acOptionInput, element: this });
    if (this.isArray == undefined || this.isArray == null) {
      if (this.type == AcEnumInputType.Checkbox) {
        this.isArray = true;
      }
      else {
        this.isArray = false;
      }
    }
    if (this.isArray == undefined) {
      this.isArray = false;
    }
    this.inputElement.addEventListener('change', () => {
      this.checked = this.inputElement.checked;
    });
    super.init();
  }

  setIsChecked(): void {
    const object = this;
    if (object.isArray) {
      if (Array.isArray(object.value) && object.value.includes(object.value)) {
        object.checked = true;
      }
      else {
        object.checked = false;
      }
    }
    else {
      if (object.value == object.value) {
        object.checked = true;
      }
      else {
        object.checked = false;
      }
    }
  }
}

acRegisterCustomElement({tag:AC_INPUT_TAG.optionInput,type:AcOptionInputElement});
