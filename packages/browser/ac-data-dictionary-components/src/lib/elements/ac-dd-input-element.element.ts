import { AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDInputManager } from "../core/ac-dd-input-manager";
import { AcDataDictionary, AcDDTableColumn } from "@autocode-ts/ac-data-dictionary";
import { IAcDDInputDefinition } from "../interfaces/ac-dd-input-definition.interface";

export class AcDDInputElement extends AcInputBase {
  static override get observedAttributes() {
    return [...super.observedAttributes, 'column-name', 'input-name', 'table-name'];
  }

  get columnName(): string {
    return this.getAttribute('column-name') ?? '';
  }
  set columnName(value: string) {
    this.setAttribute('column-name', value);
    this.setInputElement();
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
    this.inputElement.disabled = this.disabled;
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
    this.setInputElementName();
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
    this.setInputElementClass();
  }

  get inputName(): string {
    return this.getAttribute('input-name') ?? '';
  }
  set inputName(value: string) {
    this.setAttribute('input-name', value);
    this.setInputElement();
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
    this.setInputElementStyle();
  }

  private _inputProperties: any = {};
  get inputProperties(): any {
    return this._inputProperties;
  }
  set inputProperties(value: any) {
    this._inputProperties = value;
    this.setInputElementProperties();
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
    this.setInputElementPlaceholder();
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
    this.inputElement.readonly = this.readonly;
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
    this.inputElement.required = value;
  }


  get tableName(): string {
    return this.getAttribute('table-name') ?? '';
  }
  set tableName(value: string) {
    this.setAttribute('table-name', value);
    this.setInputElement();
  }

  override get validity() {
    if (this.inputElement) {
      return this.inputElement.validity;
    }
    return { valid: true };
  }

  override get validationMessage() {
    if (this.inputElement) {
      return this.inputElement.validationMessage;
    }
    return '';
  }

  override get validityStateFlags(): { valid: boolean; flags: Partial<ValidityState>; message: string; } {
    return this.inputElement.validityStateFlags;
  }

  ddTableColumn?: AcDDTableColumn;
  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'column-name':
        this.columnName = newValue;
        break;
      case 'form-input-name':
        this.formInputName = newValue;
        break;
      case 'input-class':
        this.inputClass = newValue;
        break;
      case 'input-name':
        this.inputName = newValue;
        break;
      case 'input-style':
        this.inputStyle = newValue;
        break;
      case 'placeholder':
        this.placeholder = newValue;
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
    this.innerHTML = "";
    this.setInputElement();
  }

  private setInputElement() {
    if ((this.tableName && this.columnName) || this.inputName) {
      let inputDefinition: IAcDDInputDefinition | undefined;
      if (this.tableName && this.columnName) {
        const column = AcDataDictionary.getTableColumn({ tableName: this.tableName, columnName: this.columnName });
        if (column) {
          this.ddTableColumn = column;
        }
        inputDefinition = AcDDInputManager.getColumnInputDefinition({ tableName: this.tableName, columnName: this.columnName });
      }
      if (this.inputName) {
        inputDefinition = AcDDInputManager.getInputDefinition({ name: this.inputName });
      }
      if (inputDefinition) {
        this.inputElement = new inputDefinition.inputElement();
        if(this.ddTableColumn){
          const defaultValue:any = this.ddTableColumn.getDefaultValue();
          if(defaultValue && !this.value){
            this.inputElement.value = defaultValue;
          }
        }
        if (inputDefinition.defaultProperties) {
          for (const key in inputDefinition.defaultProperties) {
            this.inputElement[key] = inputDefinition.defaultProperties[key];
          }
        }
        if (this.ddTableColumn) {
          if (this.ddTableColumn.isRequired()) {
            this.setAttribute('required', `true`);
          }
        }
        this.innerHTML = "";
        this.append(this.inputElement);
        this.inputElement.addEventListener('input', () => {
          this.value = this.inputElement.value;
        });
        this.inputElement.addEventListener('change', () => {
          this.value = this.inputElement.value;
        });
        if (this.value) {
          this.inputElement.value = this.value;
        }
        if (this.disabled) {
          this.inputElement.disabled = this.disabled;
        }
        this.inputElement.required = this.required;
        this.setInputElementClass();
        this.setInputElementName();
        this.setInputElementPlaceholder();
        this.setInputElementProperties();
        this.setInputElementStyle();
        const event = new CustomEvent('inputElementSet', { detail: { inputElement: this.inputElement } });
        this.dispatchEvent(event);
      }
    }
  }

  private setInputElementClass() {
    if (this.inputElement) {
      const cssClass = this.inputClass ?? '';
      if (cssClass && cssClass != '') {
        this.inputElement.setAttribute('class', cssClass);
      }
    }
  }

  private setInputElementName() {
    if (this.inputElement) {
      const name = this.formInputName ?? '';
      if (name && name != '') {
        this.inputElement.setAttribute('name', name);
      }
    }
  }

  private setInputElementPlaceholder() {
    if (this.inputElement && this.placeholder) {
      this.inputElement.setAttribute('placeholder', this.placeholder);
    }
  }

  private setInputElementProperties() {
    if (this.inputElement && this.inputProperties) {
      const properties = this.inputProperties;
      for (const propertyName of Object.keys(properties)) {
        (this.inputElement as any)[propertyName] = properties[propertyName];
      }
    }
  }

  private setInputElementStyle() {
    if (this.inputElement) {
      const style = this.inputStyle ?? '';
      if (style && style != '') {
        // this.inputElement.setAttribute('style', style);
      }
    }
  }


}

acRegisterCustomElement({ tag: 'ac-dd-input', type: AcDDInputElement });
