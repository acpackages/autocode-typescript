/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acClearElement, AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDInputElement } from "./ac-dd-input-element.element";
import { AcDDInputFieldBaseElement } from "./ac-dd-input-field-base-element.element";
import { AcDDInputManager } from "../core/ac-dd-input-manager";
import { AcDDTableColumn } from "@autocode-ts/ac-data-dictionary";

export class AcDDInputFieldElement extends AcInputBase {
  static override get observedAttributes() {
    return [...super.observedAttributes, 'column-name', 'input-name', 'label', 'table-name'];
  }

  get columnName(): string {
    return this.getAttribute('column-name') ?? '';
  }
  set columnName(value: string) {
    this.setAttribute('column-name', value);
    this.setDDInput();
  }

  get tableName(): string {
    return this.getAttribute('table-name') ?? '';
  }
  set tableName(value: string) {
    this.setAttribute('table-name', value);
    this.setDDInput();
  }
  get label(): string {
    return this.getAttribute('label') ?? '';
  }
  set label(value: string) {
    this.setAttribute('label', value);
    this.setDDInput();
  }

  override get disabled(): boolean {
    return super.disabled;
  }
  override set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', "true");
    }
    else {
      this.removeAttribute('disabled');
    }
    this.ddInput.disabled = this.disabled;
  }

  get formInputName(): string {
    return this.getAttribute('form-input-name') ?? '';
  }
  set formInputName(value: string) {
    if(value){
      this.setAttribute('form-input-name', value);
    }
    else{
      this.removeAttribute('form-input-name');
    }
    this.setDDFormInputName();
  }

  get inputClass(): any {
    return this.getAttribute('input-class');
  }
  set inputClass(value: any) {
    if(value){
      this.setAttribute('input-class', value);
    }
    else{
      this.removeAttribute('input-class');
    }
    this.setDDInputClass();
  }

  get inputName(): string {
    return this.getAttribute('input-name') ?? '';
  }
  set inputName(value: string) {
    if(value){
      this.setAttribute('input-name', value);
    }
    else{
      this.removeAttribute('input-name');
    }
    this.setDDInputName();
  }

  get inputStyle(): any {
    return this.getAttribute('input-style');
  }
  set inputStyle(value: any) {
    if(value){
      this.setAttribute('input-style', value);
    }
    else{
      this.removeAttribute('input-style');
    }
    this.setDDInputStyle();
  }

  private _inputProperties: any = {};
  get inputProperties(): any {
    return this._inputProperties;
  }
  set inputProperties(value: any) {
    this._inputProperties = value;
    this.setDDInputProperties();
  }

  override get placeholder(): any {
    return this.getAttribute('placeholder');
  }
  override set placeholder(value: any) {
    if(value){
      this.setAttribute('placeholder', value);
    }
    else{
      this.removeAttribute('placeholder');
    }
    this.setDDInputPlaceholder();
  }


  override get readonly(): boolean {
    return super.readonly;
  }
  override set readonly(value: boolean) {
    if (value) {
      this.setAttribute('readonly', "true");
    }
    else {
      this.removeAttribute('readonly');
    }
    this.ddInput.readonly = value;
  }

  override get required(): boolean {
    return super.required;
  }
  override set required(value: boolean) {
    if (value) {
      this.setAttribute('required', "true");
    }
    else {
      this.removeAttribute('required');
    }
    this.ddInput.required = value;
  }

  override get validityStateFlags(): { valid: boolean; flags: Partial<ValidityState>; message: string; } {
    return this.ddInput.validityStateFlags;
  }

  containerElement = document.createElement('div');
  ddInput: AcDDInputElement = new AcDDInputElement();
  ddInputField: AcDDInputFieldBaseElement;
  ddTableColumn!: AcDDTableColumn;

  constructor() {
    super();
    this.inputElement = this.ddInput;
    this.ddInputField = new AcDDInputManager.inputFieldElementClass();
    this.ddInputField.ddInputFieldElement = this;
    this.ddInput.on({
      event: 'change', callback: () => {
        this.value = this.ddInput.value;
      }
    });
    this.ddInput.on({
      event: 'inputElementSet', callback: (args: any) => {
        const event = new CustomEvent('inputElementSet', { detail: { inputElement: this.ddInput.inputElement } });
        this.dispatchEvent(event);
      }
    });
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'column-name':
        this.columnName = newValue;
        break;
      case 'input-name':
        this.inputName = newValue;
        break;
      case 'form-input-name':
        this.formInputName = newValue;
        break;
      case 'label':
        this.label = newValue;
        break;
      case 'table-name':
        this.tableName = newValue;
        break;
      default:
        super.attributeChangedCallback(name, oldValue, newValue);
        break;
    }
  }

  override init(): void {
    super.init();
    acClearElement({element:this});
    this.append(this.ddInputField);
    this.ddInputField.ddInput = this.ddInput;
    this.setDDInput();
  }

  private setDDInput() {
    if ((this.tableName && this.columnName) || this.inputName) {
      this.ddInput.tableName = this.tableName;
      this.ddInput.columnName = this.columnName;
      this.ddInput.inputName = this.inputName;

      if (this.ddInput && this.ddInput.ddTableColumn) {
        this.ddTableColumn = this.ddInput.ddTableColumn!;
        this.ddInputField.ddInputLabel = this.ddTableColumn.getColumnTitle();
      }
      if (this.label) {
        this.ddInputField.ddInputLabel = this.label;
      }
      if (this.ddInput) {
        this.required = this.ddInput.required;
      }
      const container = this.querySelector('ac-dd-input-container');
      if (container) {
        acClearElement({element:container as HTMLElement});
        container.append(this.ddInput);
      }
      this.setDDInputClass();
      this.setDDInputName();
      this.setDDFormInputName();
      this.setDDInputPlaceholder();
      this.setDDInputProperties();
      this.setDDInputStyle();
      const event = new CustomEvent('ddInputSet', { detail: { ddInput: this.ddInput } });
      this.dispatchEvent(event);
    }
  }

  private setDDInputClass() {
    if (this.ddInput) {
      this.ddInput.inputClass = this.inputClass;
    }
  }

  private setDDInputName() {
    if (this.ddInput) {
      this.ddInput.inputName = this.inputName;
    }
  }

  private setDDFormInputName() {
    if (this.ddInput) {
      this.ddInput.formInputName = this.formInputName;
    }
  }

  private setDDInputPlaceholder() {
    if (this.ddInput && this.placeholder) {
      this.ddInput.placeholder = this.placeholder;
    }
  }

  private setDDInputProperties() {
    if (this.ddInput && this.inputProperties) {
      this.ddInput.inputProperties = this.inputProperties;
    }
  }

  private setDDInputStyle() {
    if (this.ddInput) {
      this.ddInput.inputStyle = this.inputStyle;
    }
  }

  override setValueListener() {
    Object.defineProperty(this, 'value', {
      get() {
        return this.ddInput.value;
      },

      set(value) {
        this.ddInput.value = value;
        this.inputElement.value = value;
        this.setValue(value);
      },

      enumerable: true,
      configurable: true
    });
  }
}

acRegisterCustomElement({ tag: 'ac-dd-input-field', type: AcDDInputFieldElement });
