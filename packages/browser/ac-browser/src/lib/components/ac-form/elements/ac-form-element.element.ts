/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AcContext, AcContextRegistry, AcEnumContextEvent } from "@autocode-ts/autocode";
import { acRegisterCustomElement, acWrapElementWithTag } from "../../../utils/ac-element-functions";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcForm extends AcElementBase {
  static get observedAttributes() {
    return ['ac-context'];
  }

  private _acContext?: AcContext | any;
  get acContext(): AcContext | undefined {
    return this._acContext;
  }
  set acContext(value: AcContext) {
    this._acContext = value;
    if (value) this.setAttribute('ac-context', value.__acContextName__);
    this.syncInputsWithContext();
  }

  submitted: boolean = false;
  isWrapped: boolean = false;
  formAddedManually: boolean = false;
  form!: HTMLFormElement | any;
  override autoDestroyOnDisconnect: boolean = false;
  private inputContextListeners: Map<HTMLElement, any> = new Map();

  invalidCallback: Function = () => {
    // No-op: do not set submitted to true on invalid event
  };
  resetCallback: Function = (event: any) => {
    this.submitted = false;
    if (this.form) {
      this.form.submitted = false;
    }
    const fields = this.querySelectorAll('ac-form-field');
    for (const field of Array.from(fields)) {
      if (typeof (field as any).updateState === 'function') {
        (field as any).updateState();
      }
    }
    this.dispatchEvent(new Event('reset'));
  };

  submitCallback: Function = (event: Event) => {
    event.preventDefault();
    this.submitted = true;
    if (this.form) {
      this.form.submitted = true;
    }
    if (this.validateAll()) {
      this.dispatchEvent(new Event('submit'));
    } else {
      event.stopImmediatePropagation?.();
    }
  };

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'ac-context':
        if (AcContextRegistry.exists({ name: newValue })) {
          this.acContext = AcContextRegistry.get({ name: newValue })!;
        }
        break;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.isWrapped) {
      this.isWrapped = true;
      if (this.isConnected && this.parentNode) {
        const enclosingForm = this.closest('form');
        if (enclosingForm) {
          this.form = enclosingForm;
        }
      }
      if (this.form == undefined || this.form == null) {
        this.form = acWrapElementWithTag({ element: this, wrapperTag: 'form' }) as HTMLFormElement;
        this.formAddedManually = true;
      }
      this.form.style.display = 'contents';
      this.submitted = false;
      this.form.submitted = false;
      this.form.noValidate = true;
      this.form.addEventListener('submit', this.submitCallback);
      this.form.addEventListener('invalid', this.invalidCallback);
      this.form.addEventListener("reset", this.resetCallback);
    }
  }

  override disconnectedCallback(): void {
    if (this.form) {
      this.form.removeEventListener('submit', this.submitCallback);
      this.form.removeEventListener('invalid', this.invalidCallback);
      this.form.removeEventListener("reset", this.resetCallback);
      if (this.formAddedManually) {
        this.form.remove();
      }
    }
    super.disconnectedCallback();
  }

  private getInputElements(): any[] {
    const selector = 'input, select, textarea, [name], ac-input, ac-text-input, ac-select-input, ac-textarea-input, ac-number-input, ac-datetime-picker, ac-dd-input-field';
    const all = Array.from(this.querySelectorAll<HTMLElement>(selector));
    return all.filter((el) => {
      const tagName = el.tagName.toLowerCase();
      if (tagName === 'button') return false;
      if (tagName === 'input') {
        const type = (el as HTMLInputElement).type?.toLowerCase();
        if (type === 'submit' || type === 'reset' || type === 'button' || type === 'image') return false;
      }
      // If el is an internal element of a custom input element that manages its own validity, skip it
      if (el.parentElement) {
        const parentCustomInput = el.parentElement.closest('ac-input, ac-text-input, ac-select-input, ac-textarea-input, ac-number-input, ac-datetime-picker, ac-dd-input-field');
        if (parentCustomInput && parentCustomInput !== el) {
          return false;
        }
      }
      if ((el as HTMLInputElement).disabled) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return true;
    });
  }

  reset(): void {
    this.form.reset();
  }

  private syncInputsWithContext() {
    const inputs = this.getInputElements();
    for (const input of inputs) {
      const name = input.getAttribute('name');
      if (!name) continue;
      if (this._acContext && this._acContext[name] != null) {
        (input as any).value = this._acContext[name];
      }
      if (!this.inputContextListeners.has(input) && this._acContext) {
        const listener = (args: any) => {
          if (args.property === name) (input as any).value = args.value;
        };
        this._acContext.on({event:AcEnumContextEvent.Change, callback:listener});
        this.inputContextListeners.set(input, listener);
      }
    }
  }

  submit(): void {
    if (this.form && typeof this.form.requestSubmit === 'function') {
      this.form.requestSubmit();
    } else if (this.form) {
      const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
      this.form.dispatchEvent(submitEvent);
    }
  }

  validateAll(): boolean {
    const inputs = this.getInputElements();
    let isValid = true;
    let firstInvalid: HTMLElement | null = null;
    for (const el of inputs) {
      if (typeof el.checkValidity === 'function') {
        const isElValid = el.checkValidity();
        if (!isElValid) {
          if (!firstInvalid) {
            firstInvalid = el;
          }
          isValid = false;
        }
      }
    }
    if (firstInvalid) {
      firstInvalid.focus();
      if (typeof (firstInvalid as any).reportValidity === 'function') {
        (firstInvalid as any).reportValidity();
      }
    }
    const fields = this.querySelectorAll('ac-form-field');
    for (const field of Array.from(fields)) {
      if (typeof (field as any).updateState === 'function') {
        (field as any).updateState();
      }
    }
    return isValid;
  }

  valuesFromJsonObject(values: any) {
    for (const input of this.getInputElements()) {
      const key = input.getAttribute('name') ?? '';
      if (values[key] != null) (input as any).value = values[key];
    }
  }

  valuesToJsonObject(): any {
    const result: any = {};
    for (const input of this.getInputElements()) {
      const key = input.getAttribute('name') ?? '';
      if (key && (input as any).value != null) result[key] = (input as any).value;
    }
    return result;
  }
}

acRegisterCustomElement({ tag: "ac-form", type: AcForm });
