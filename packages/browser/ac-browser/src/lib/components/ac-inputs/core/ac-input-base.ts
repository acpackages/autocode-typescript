/* eslint-disable no-unused-private-class-members */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcHooks, AcContext, AcContextRegistry, AcEnumContextEvent } from "@autocode-ts/autocode";
import { AcEnumInputEvent } from "../enums/ac-enum-input-event.enum";
import { AcElementBase } from "../../../core/ac-element-base";
import { acListenElementEvents } from "../../../utils/ac-element-functions";

export class AcInputBase extends AcElementBase {
  static formAssociated = true;
  static get observedAttributes() {
    return ['ac-context', 'ac-context-key', 'class', 'value', 'placeholder', 'disabled', 'readonly', 'name', 'style', 'required'];
  }

  get inputReflectedAttributes() {
    return ['class', 'value', 'placeholder', 'disabled', 'readonly', 'required'];
  }

  _acContext?: any;
  get acContext(): any {
    return this._acContext;
  }
  set acContext(value: AcContext) {
    this._acContext = value;
    if (value) {
      this.setAttribute('ac-context', value.__acContextName__);
    }
    this.setValueFromAcContext();
  }

  get acContextKey(): string | null {
    return this.getAttribute('ac-context-key');
  }
  set acContextKey(value: string) {
    this.setAttribute('ac-context-key', value);
    this.setValueFromAcContext();
  }

  get disabled(): boolean {
    return this.getAttribute('disabled') == 'true';
  }
  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', "true");
    }
    else {
      this.removeAttribute('disabled');
    }
  }

  get form() { return this.elementInternals.form; }

  get name(): string | null {
    return this.getAttribute('name');
  }
  set name(value: string) {
    if (value != '') {
      this.setAttribute('name', value);
    }
    else {
      this.removeAttribute(value);
    }
  }

  get placeholder(): string | null {
    return this.getAttribute('placeholder');
  }
  set placeholder(value: string) {
    if (value != '') {
      this.setAttribute('placeholder', value);
    }
    else {
      this.removeAttribute(value);
    }
  }

  get readonly(): boolean {
    return this.getAttribute('readonly') == 'true';
  }
  set readonly(value: boolean) {
    if (value) {
      this.setAttribute('readonly', "true");
    }
    else {
      this.removeAttribute('readonly');
    }
  }

  get required(): boolean {
    return this.getAttribute('required') == 'true';
  }
  set required(value: boolean) {
    if (value) {
      this.setAttribute('required', "true");
    }
    else {
      this.removeAttribute('required');
    }
  }

  get validity() { return this.inputElement.validity; }

  get isValidRequired(): boolean {
    let value = this.value ?? '';
    if (typeof value == 'string') {
      value = value.trim();
    }
    if (this.hasAttribute('required') && !value) {
      return false;
    }
    return true;
  }
  get validityStateFlags(): { valid: boolean; flags: Partial<ValidityState>; message: string } {
    if (this.isInputElementValidHtmlInput) {
      const validityState: ValidityState = this.inputElement.validity;
      const validityFlags = {
        badInput: validityState.badInput,
        customError: validityState.customError,
        patternMismatch: validityState.patternMismatch,
        rangeOverflow: validityState.rangeOverflow,
        rangeUnderflow: validityState.rangeUnderflow,
        stepMismatch: validityState.stepMismatch,
        tooLong: validityState.tooLong,
        tooShort: validityState.tooShort,
        typeMismatch: validityState.typeMismatch,
        valueMissing: validityState.valueMissing
      };
      return { valid: this.inputElement.validity.valid, flags: validityFlags, message: this.getValidationMessageFromValidityState(validityState) };
    }
    else {
      const validityFlags: Partial<ValidityState> | any = {};
      if (!this.isValidRequired) {
        validityFlags.valueMissing = true;
      }
      const valid = Object.keys(validityFlags).length === 0;

      return { valid, flags: validityFlags, message: this.getValidationMessageFromValidityState(validityFlags) };
    }
  }

  get validationMessage() { return this.elementInternals.validationMessage; }

  protected _value: any;
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    this.setValue(value);
  }

  elementInternals: ElementInternals;
  hooks: AcHooks = new AcHooks();
  inputElement: HTMLElement | any = this.ownerDocument.createElement('input');
  isInputElementValidHtmlInput: boolean = true;
  reflectValueAttribute: boolean = true;

  constructor() {
    super();
    this.elementInternals = this.attachInternals();
    this.inputElement.formAssociated = false;
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'ac-context':
        if (AcContextRegistry.exists({ name: newValue })) {
          this.acContext = AcContextRegistry.get({ name: newValue })!;
        }
        break;
      case 'ac-context-key':
        this.acContextKey = newValue;
        break;
      case 'value':
        this.value = newValue;
        break;
      case 'placeholder':
        this.placeholder = newValue;
        break;
      case 'disabled':
        this.disabled = newValue == 'true';
        break;
      case 'class':
        this.className = newValue;
        this.inputElement.className = newValue;
        break;
      case 'readonly':
        this.readonly = newValue == 'true';
        break;
      case 'required':
        this.required = newValue == 'true';
        break;
      case 'name':
        this.name = newValue;
        break;
      case 'type':
        this.inputElement.setAttribute('type', newValue);
        break;
    }
    if (this.inputReflectedAttributes.includes(name)) {
      this.refreshReflectedAttributes({ attribute: name });
    }
  }

  checkValidity() { return this.elementInternals.checkValidity(); }

  override destroy() {
    this.hooks.clearSubscriptions();
    this.inputElement.removeEventListener('input', this.handleInput);
    this.inputElement.removeEventListener('change', this.handleChange);
    super.destroy();
  }

  override focus(options?: FocusOptions): void {
    this.inputElement.focus();
  }

  getValidationMessageFromValidityState(
    validity: ValidityState,
    customMessage?: string
  ): string {
    if (!validity) return '';

    if (validity.customError && customMessage) {
      return customMessage;
    }
    if (validity.valueMissing) {
      return 'This field is required.';
    }
    if (validity.typeMismatch) {
      return 'Please enter a valid value.';
    }
    if (validity.patternMismatch) {
      return 'Value does not match the required pattern.';
    }
    if (validity.tooLong) {
      return 'Please shorten this value.';
    }
    if (validity.tooShort) {
      return 'Please lengthen this value.';
    }
    if (validity.rangeUnderflow) {
      return 'Value is too low.';
    }
    if (validity.rangeOverflow) {
      return 'Value is too high.';
    }
    if (validity.stepMismatch) {
      return 'Please enter a valid step value.';
    }
    if (validity.badInput) {
      return 'Please enter a valid input.';
    }

    return '';
  }

  handleChange(e: Event) {
    this.setValue(this.inputElement.value);
    if(this.dispatchEvent){
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
    this.events.execute({ event: AcEnumInputEvent.Change, args: this.value });
  }

  handleInput(e: Event) {
    this.setValue(this.inputElement.value);
    if(this.dispatchEvent){
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }
    this.events.execute({ event: AcEnumInputEvent.Input, args: this.value });
  }

  override init(): void {
    super.init();
    if (this.hasAttribute('required')) {
      this.required = true;
    }
    if (this.hasAttribute('disabled')) {
      this.disabled = true;
    }
    if (this.hasAttribute('readonly')) {
      this.readonly = true;
    }
    if (this.elementInternals.form) {
      this.elementInternals.form.addEventListener('submit', () => {
        this.validate();
      });
    }
    this.style.display = 'contents';
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.refreshReflectedAttributes();
    this.inputElement.addEventListener('input', this.handleInput);
    this.inputElement.addEventListener('change', this.handleChange);
    this.innerHTML = '';
    this.appendChild(this.inputElement);
    acListenElementEvents({element: this.inputElement, callback: ({ name, event }: { name: string, event: Event }) => {
      if(this.dispatchEvent){
        this.dispatchEvent(event);
      }
      },mouse:true,keyboard:true,pointer:true,focus:true,form:true,touch:true,viewport:true
    });
  }

  reportValidity() { return this.elementInternals.reportValidity(); }

  setValue(value: any) {
    const oldValue: any = this._value;
    if (oldValue != value) {
      this._value = value;
      const inputElement: HTMLInputElement = this.inputElement as HTMLInputElement;
      inputElement.value = value;
      if (this.reflectValueAttribute) {
        this.setAttribute('value', value);
      }
      if (this.isConnected) {
        this.setValueToAcContext();
      }
      this.elementInternals.setFormValue(this.value);
      if(this.dispatchEvent){
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      }
      this.events.execute({ event: AcEnumInputEvent.Change, args: this.value });
      this.validate();
    }
  }

  protected setValueFromAcContext() {
    if (this.acContextKey && this.acContext) {
      this.value = this.acContext[this.acContextKey];
      this.acContext.on({
        event: AcEnumContextEvent.Change, callback: (args: any) => {
          if (args.property == this.acContextKey) {
            this.setValue(args.value);
          }
        }
      });
    }
  }

  protected setValueToAcContext() {
    if (this.acContextKey && this.acContext) {
      this.acContext[this.acContextKey] = this.value;
    }
  }

  validate() {
    const validityState = this.validityStateFlags;
    this.elementInternals.setValidity(
      validityState.valid ? {} : validityState.flags,
      validityState.message,
      this
    );
    if (!validityState.valid) {
      if(this.dispatchEvent){
        this.dispatchEvent(new CustomEvent('invalid', {
          detail: { message: this.validationMessage, validity: this.validity },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  upgradeProperty(prop: string) {
    if (this.hasOwnProperty(prop)) {
      const instance: any = this;
      const val = instance[prop];
      delete instance[prop];
      instance[prop] = val;
    }
  }

  refreshReflectedAttributes({ attribute }: { attribute?: string } = {}) {
    const setAttributeFromThis = (attributeName: string) => {
      if (this.hasAttribute(attributeName)) {
        this.inputElement.setAttribute(attributeName, this.getAttribute(attributeName)!);
      }
      else {
        this.inputElement.removeAttribute(attributeName);
      }
    };
    if (attribute) {
      for (const attributeName of this.inputReflectedAttributes) {
        setAttributeFromThis(attribute);
      }
    }
    else {
      for (const attributeName of this.inputReflectedAttributes) {
        setAttributeFromThis(attributeName);
      }
    }
  }

}
