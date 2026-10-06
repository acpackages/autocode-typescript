/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcFormFieldErrorMessage } from "./ac-form-field-error-element.element";

export class AcFormField extends AcElementBase {
  private inputElement?: HTMLInputElement | any;
  private mutationObserver!: MutationObserver;
  private inputListener: (() => void) | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.mutationObserver = new MutationObserver(() => this.bindInput());
    this.bindInput();
    this.mutationObserver.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbindInput();
    this.mutationObserver.disconnect();
  }

  private bindInput() {
    let foundInput:boolean = false;
    const input = this.querySelector(`[name], input, select, textarea, ac-input, ac-text-input, ac-select-input, ac-textarea-input, ac-number-input, ac-datetime-picker, ac-dd-input-field`);
    if(input){
      if (input == this.inputElement) return;
    }
    this.unbindInput();
    if (input) {
      foundInput = true;
      this.inputElement = input;
      const listener = () => this.updateState();
      input.addEventListener('input', listener);
      input.addEventListener('change', listener);
      input.addEventListener('blur', listener);
      input.setAttribute('novalidate', 'true');
      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        listener();
      }, true);
      this.inputListener = listener;

      this.updateState();
    }
    if(!foundInput){
      this.delayedCallback.add({callback:() => {
        this.bindInput();
      }, duration:50});
    }
  }

  private unbindInput() {
    if (this.inputElement && this.inputListener) {
      this.inputElement.removeEventListener('input', this.inputListener);
      this.inputElement.removeEventListener('change', this.inputListener);
      this.inputElement.removeEventListener('blur', this.inputListener);
    }
    this.inputElement = undefined;
    this.inputListener = null;
  }

  private isFormSubmitted(): boolean {
    const acForm = this.closest('ac-form') as any;
    if (acForm && acForm.submitted !== undefined) {
      return !!acForm.submitted;
    }
    const form = (this.inputElement as any)?.form || acForm?.form || this.closest('form');
    if (form && (form as any).submitted !== undefined) {
      return !!(form as any).submitted;
    }
    return false;
  }

  updateState() {
    if (!this.inputElement) return;
    if (this.isFormSubmitted()) {
      const validity = (this.inputElement as any).validity;
      const isValid = validity ? validity.valid : (typeof this.inputElement.checkValidity === 'function' ? this.inputElement.checkValidity() : true);
      const hasError = !isValid;
      this.setAttribute('is-valid', `${isValid}`);
      const errorMessages: AcFormFieldErrorMessage[] = Array.from(this.querySelectorAll('ac-form-field-error-message'));
      for (const msg of errorMessages) {
        if (hasError) {
          const error: string = this.inputElement.validationMessage || 'This field is invalid';
          msg.setError({message:error});
        }
        else {
          msg.setError({show:false});
        }
      }
    } else {
      this.removeAttribute('is-valid');
      const errorMessages: AcFormFieldErrorMessage[] = Array.from(this.querySelectorAll('ac-form-field-error-message'));
      for (const msg of errorMessages) {
        msg.setError({show:false});
      }
    }
  }
}

acRegisterCustomElement({ tag: "ac-form-field", type: AcFormField });
