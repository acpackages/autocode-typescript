/* eslint-disable no-unused-private-class-members */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcHooks } from "@autocode-ts/autocode";
import { AcEnumInputEvent } from "../enums/ac-enum-input-event.enum";
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddElementEventsListener, acCloneEvent } from "../../../utils/ac-element-functions";

export class AcInputBase extends AcElementBase {
  static formAssociated = true;
  static get observedAttributes() {
    return ['ac-context', 'ac-context-key', 'class', 'value', 'placeholder', 'disabled', 'readonly', 'name', 'style', 'required'];
  }

  get value(): any {
    return this._value;
  }
  set value(val: any) {
    this.setValue({ value: val, emitEvent: false });
  }

  get inputReflectedAttributes() {
    return ['class', 'placeholder', 'disabled', 'readonly', 'required'];
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled') && this.getAttribute('disabled') !== 'false';
  }
  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', "true");
    }
    else {
      this.removeAttribute('disabled');
    }
  }

  get form() { return this.elementInternals ? this.elementInternals.form:null; }

  get name(): string | null {
    return this.getAttribute('name');
  }
  set name(value: string) {
    if (value != '') {
      this.setAttribute('name', value);
    }
    else {
      this.removeAttribute('name');
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
      this.removeAttribute('placeholder');
    }
  }

  get readonly(): boolean {
    return this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false';
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
    return this.hasAttribute('required') && this.getAttribute('required') !== 'false';
  }
  set required(value: boolean) {
    if (value) {
      this.setAttribute('required', "true");
    }
    else {
      this.removeAttribute('required');
    }
    if (this.inputElement && typeof this.inputElement.setAttribute === 'function') {
      if (value) {
        this.inputElement.setAttribute('required', 'true');
      } else {
        this.inputElement.removeAttribute('required');
      }
    }
    this.validate();
  }

  get validity(): ValidityState | any {
    if (this.isInputElementValidHtmlInput && this.inputElement && this.inputElement.validity) {
      return {
        ...this.validityStateFlags.flags,
        valid: this.validityStateFlags.valid
      };
    }
    return this.elementInternals?.validity || {
      ...this.validityStateFlags.flags,
      valid: this.validityStateFlags.valid
    };
  }

  get isValidRequired(): boolean {
    let value = this._value ?? '';
    if (typeof value == 'string') {
      value = value.trim();
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if ('start' in value || 'end' in value) {
        return !!(value.start && value.end);
      }
    }
    if (this.hasAttribute('required') && !value) {
      return false;
    }
    return true;
  }
  get validityStateFlags(): { valid: boolean; flags: Partial<ValidityState>; message: string } {
    if (this.isInputElementValidHtmlInput && this.inputElement) {
      const validityState: ValidityState = this.inputElement.validity || {};
      const isReqValid = this.isValidRequired;
      const valueMissing = (validityState.valueMissing ?? false) || !isReqValid;
      const validityFlags = {
        badInput: validityState.badInput ?? false,
        customError: validityState.customError ?? false,
        patternMismatch: validityState.patternMismatch ?? false,
        rangeOverflow: validityState.rangeOverflow ?? false,
        rangeUnderflow: validityState.rangeUnderflow ?? false,
        stepMismatch: validityState.stepMismatch ?? false,
        tooLong: validityState.tooLong ?? false,
        tooShort: validityState.tooShort ?? false,
        typeMismatch: validityState.typeMismatch ?? false,
        valueMissing: valueMissing
      };
      const valid = (validityState.valid !== false) && isReqValid &&
        !validityFlags.badInput && !validityFlags.customError && !validityFlags.patternMismatch &&
        !validityFlags.rangeOverflow && !validityFlags.rangeUnderflow && !validityFlags.stepMismatch &&
        !validityFlags.tooLong && !validityFlags.tooShort && !validityFlags.typeMismatch && !valueMissing;
      const message = this.getValidationMessageFromValidityState(validityFlags as any) || this.inputElement.validationMessage || (valid ? '' : 'This field is required.');
      return { valid, flags: validityFlags, message };
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

  get validationMessage(): string {
    if (this.isInputElementValidHtmlInput && this.inputElement && this.inputElement.validationMessage) {
      return this.inputElement.validationMessage;
    }
    if (this.elementInternals && this.elementInternals.validationMessage) {
      return this.elementInternals.validationMessage;
    }
    return this.validityStateFlags.message || '';
  }

  protected _value: any;

  elementInternals: ElementInternals;
  override autoDestroyOnDisconnect: boolean = false;
  hooks: AcHooks = new AcHooks();
  private eventListenerRemover: any;
  inputElement: HTMLElement | any = this.ownerDocument.createElement('input');
  isInputElementValidHtmlInput: boolean = true;
  reflectValueAttribute: boolean = true;

  constructor() {
    super();
    this.elementInternals = this.attachInternals();
    this.inputElement.formAssociated = false;
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (!this.isDestroyed) {
      if (oldValue === newValue) return;
      switch (name) {
        case 'value': {
          const currentValStr = typeof this._value === 'object' && this._value !== null ? JSON.stringify(this._value) : (this._value != null ? `${this._value}` : null);
          if (newValue !== currentValStr) {
            this.setValue({ value: newValue, emitEvent: false });
          }
          break;
        }
        case 'placeholder':
          this.placeholder = newValue;
          break;
        case 'disabled':
          this.disabled = newValue !== null && newValue !== 'false';
          break;
        case 'class':
          this.className = newValue;
          this.inputElement.className = newValue;
          break;
        case 'readonly':
          this.readonly = newValue !== null && newValue !== 'false';
          break;
        case 'required':
          this.required = newValue !== null && newValue !== 'false';
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
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.isInputElementValidHtmlInput && this.inputElement) {
      this.inputElement.removeEventListener('input', this.handleInput);
      this.inputElement.removeEventListener('change', this.handleChange);
      this.inputElement.addEventListener('input', this.handleInput);
      this.inputElement.addEventListener('change', this.handleChange);
      if (!this.contains(this.inputElement)) {
        this.innerHTML = '';
        this.appendChild(this.inputElement);
      }
      if (!this.eventListenerRemover) {
        this.eventListenerRemover = acAddElementEventsListener({
          element: this.inputElement,
          callback: ({ name, event }: { name: string, event: Event }) => {
            if (this.events) {
              this.events.execute({ event: name, args: event });
            }
            if (this.dispatchEvent) {
              if (this.contains(this.inputElement) && event.bubbles) {
                // Event is already bubbling up to this element naturally through the DOM tree.
                // Re-dispatching would cause duplicate events on this and parent elements.
                return;
              }
              this.dispatchEvent(acCloneEvent(event));
            }
          },
          mouse: true,
          keyboard: true,
          pointer: true,
          focus: true,
          form: true,
          touch: true,
          viewport: true
        });
      }
    }
  }

  checkValidity(): boolean {
    this.validate();
    if (this.isInputElementValidHtmlInput && this.inputElement && typeof this.inputElement.checkValidity === 'function') {
      return this.inputElement.checkValidity() && this.isValidRequired;
    }
    if (this.elementInternals && typeof this.elementInternals.checkValidity === 'function') {
      return this.elementInternals.checkValidity();
    }
    return this.validityStateFlags.valid;
  }

  override disconnectedCallback(): void {
    if (this.isInputElementValidHtmlInput && this.inputElement) {
      this.inputElement.removeEventListener('input', this.handleInput);
      this.inputElement.removeEventListener('change', this.handleChange);
    }
    if (this.eventListenerRemover) {
      this.eventListenerRemover();
      this.eventListenerRemover = undefined;
    }
    super.disconnectedCallback();
  }

  override destroy() {
    this.hooks.clearSubscriptions();
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
    let dispatch:boolean = true;
    if(e && e.target == this){
      dispatch = false;
    }
    if(dispatch){
      this.setValue({ value: this.inputElement.value, emitEvent: false });
    if (this.dispatchEvent) {
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
    this.events.execute({ event: AcEnumInputEvent.Change, args: this._value });
    }
  }

  handleInput(e: Event) {
    this.setValue({ value: this.inputElement.value, emitEvent: false });
    if (this.dispatchEvent) {
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }
    this.events.execute({ event: AcEnumInputEvent.Input, args: this._value });
  }

  override init(): void {
    super.init();
    if (this.hasAttribute('required')) {
      this.required = this.getAttribute('required') !== 'false';
    }
    if (this.hasAttribute('disabled')) {
      this.disabled = this.getAttribute('disabled') !== 'false';
    }
    if (this.hasAttribute('readonly')) {
      this.readonly = this.getAttribute('readonly') !== 'false';
    }
    if (this.elementInternals && this.elementInternals.form) {
      this.elementInternals.form.addEventListener('submit', () => {
        this.validate();
      });
    }
    this.style.display = 'contents';
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.refreshReflectedAttributes();
  }

  refreshReflectedAttributes({ attribute }: { attribute?: string } = {}) {
    const setAttributeFromThis = (attributeName: string) => {
      if (!this.inputElement || typeof this.inputElement.setAttribute !== 'function') return;
      if (this.hasAttribute(attributeName)) {
        const val = this.getAttribute(attributeName)!;
        if (this.inputElement.getAttribute(attributeName) !== val) {
          this.inputElement.setAttribute(attributeName, val);
        }
      }
      else {
        if (this.inputElement.hasAttribute(attributeName)) {
          this.inputElement.removeAttribute(attributeName);
        }
      }
    };
    if (attribute) {
      setAttributeFromThis(attribute);
    }
    else {
      for (const attributeName of this.inputReflectedAttributes) {
        setAttributeFromThis(attributeName);
      }
    }
  }

  reportValidity(): boolean {
    this.validate();
    let valid = this.validityStateFlags.valid;
    if (this.isInputElementValidHtmlInput && this.inputElement && typeof this.inputElement.reportValidity === 'function') {
      valid = this.inputElement.reportValidity() && this.isValidRequired;
    } else if (this.elementInternals && typeof this.elementInternals.reportValidity === 'function') {
      valid = this.elementInternals.reportValidity();
    }
    if (!valid) {
      if (this.dispatchEvent) {
        this.dispatchEvent(new CustomEvent('invalid', {
          detail: { message: this.validationMessage, validity: this.validity },
          bubbles: false,
          cancelable: true
        }));
      }
    }
    return valid;
  }

  setValue({value,emitEvent = true}:{value: any, emitEvent?: boolean}): void {
    if (!this.isDestroyed) {
      const oldValue: any = this._value;
      if (oldValue != value) {
        this._value = value;
        if (this.inputElement) {
          if (typeof (this.inputElement as any).setValue === 'function') {
            if ((this.inputElement as any).value !== value) {
              (this.inputElement as any).setValue({ value: value, emitEvent: false });
            }
          } else {
            const inputElement: HTMLInputElement = this.inputElement as HTMLInputElement;
            if (value == undefined) {
              inputElement.value = '';
            }
            else if (typeof value === 'object') {
              inputElement.value = '';
            }
            else {
              inputElement.value = value;
            }
          }
        }
        if (this.reflectValueAttribute) {
          const newAttrVal = typeof value === 'object' && value !== null ? JSON.stringify(value) : (value !== undefined && value !== null ? `${value}` : null);
          const currentAttrVal = this.getAttribute('value');
          if (newAttrVal === null) {
            if (this.hasAttribute('value')) {
              this.removeAttribute('value');
            }
          } else if (currentAttrVal !== newAttrVal) {
            this.setAttribute('value', newAttrVal);
          }
        }
        if (this.elementInternals) {
          if (typeof value === 'object' && value !== null) {
            this.elementInternals.setFormValue(JSON.stringify(value));
          } else {
            this.elementInternals.setFormValue(this._value ?? '');
          }
        }
        if (this.dispatchEvent) {
            this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
          }
          this.events.execute({ event: AcEnumInputEvent.Change, args: this._value });
        this.validate();
      }
    }
  }

  validate() {
    if (!this.isDestroyed && this.elementInternals) {
      const validityState = this.validityStateFlags;
      if (validityState) {
        const flags = validityState.valid ? {} : validityState.flags;
        const message = validityState.valid ? '' : (validityState.message || 'Invalid value');
        try {
          this.elementInternals.setValidity(flags, message);
        } catch (e) {
          // Ignore browser or mock environment specific setValidity errors
        }
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


}
