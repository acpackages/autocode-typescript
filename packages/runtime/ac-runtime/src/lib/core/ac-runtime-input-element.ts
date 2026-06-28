import { AcRuntimeElement } from './ac-runtime-element';

export class AcRuntimeInputElement extends AcRuntimeElement {
  static formAssociated = true;
  protected internals: ElementInternals;

  get value(): any {
    let result:any = undefined;
    if(this.acRuntimeInstance && this.acRuntimeInstance.acGetValue && typeof this.acRuntimeInstance.acGetValue === 'function'){
      result = this.acRuntimeInstance.acGetValue();
    }
    return result;
  }
  // Setter: Allows programmatic DOM assignment (e.g., el.value = 5)
  set value(newValue: any) {
    // Update native form internals and validity status
    this.internals.setFormValue(newValue !== null && newValue !== undefined ? String(newValue) : '');
    this.runValidation(newValue);

    // Call user-defined CVA write value if they have custom side-effects
    if (this.acRuntimeInstance && typeof this.acRuntimeInstance.acSetValue === 'function') {
      this.acRuntimeInstance.acSetValue(newValue);
    }
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  writeValue(value: any): void {
    this.internals.setFormValue(value !== null && value !== undefined ? String(value) : '');
    this.runValidation(value);
    if (this.acRuntimeInstance && typeof this.acRuntimeInstance.acSetValue === 'function') {
      this.acRuntimeInstance.acSetValue(value);
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    if (this.acRuntimeInstance && typeof this.acRuntimeInstance.acRegisterOnChange === 'function') {
      this.acRuntimeInstance.acRegisterOnChange((newValue: any) => {
        this.internals.setFormValue(newValue !== null && newValue !== undefined ? String(newValue) : '');
        this.runValidation(newValue);
        fn(newValue);
      });
    }
  }

  registerOnTouched(fn: () => void): void {
    if (this.acRuntimeInstance && typeof this.acRuntimeInstance.acRegisterOnTouched === 'function') {
      this.acRuntimeInstance.acRegisterOnTouched(fn);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.acRuntimeInstance && typeof this.acRuntimeInstance.acSetDisabledState === 'function') {
      this.acRuntimeInstance.acSetDisabledState(isDisabled);
    }
  }

  private runValidation(value: any) {
    if (this.acRuntimeInstance && typeof this.acRuntimeInstance.acValidate === 'function') {
      const errors = this.acRuntimeInstance.acValidate(value);
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        const msg = typeof errors[firstKey] === 'string' ? errors[firstKey] : 'Invalid field';
        this.internals.setValidity({ customError: true }, msg);
      } else {
        this.internals.setValidity({});
      }
    }
  }
}
