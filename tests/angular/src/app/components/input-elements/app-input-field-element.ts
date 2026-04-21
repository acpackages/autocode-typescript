/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acClearElement, AcElementBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDInputElement, AcDDInputFieldElement } from "@autocode-ts/ac-data-dictionary-components";
import { Autocode } from "@autocode-ts/autocode";

export class AppInputFieldElement extends AcElementBase {

  inputElement = document.createElement('div');
  private _ddInput?: AcDDInputElement;
  get ddInput(): AcDDInputElement | undefined {
    return this._ddInput;
  }
  set ddInput(value: AcDDInputElement | any) {
    this._ddInput = value;
    value.inputElement.classList.add('form-control');
    value.setAttribute('name',Autocode.uuid());
    const container: HTMLElement = this.querySelector('[ac-dd-input-container]')!;
    if (container) {
      acClearElement({element:container});
      container.append(value);
    }
    this.setDDInputStyle();
    value.on({
      event: 'inputElementSet', callback: () => {
        this.setDDInputStyle();
      }
    });
    value.on({event:'change',callback:()=>{
      this.setDDInputStyle();
    }});
  }

  private _ddInputLabel: string = '';
  get ddInputLabel(): string {
    return this._ddInputLabel;
  }
  set ddInputLabel(value: string) {
    this._ddInputLabel = value;
    const container = this.querySelector('[ac-dd-input-label-container]');
    if (container) {
      if (this.ddInput) {
        if (this.ddInput.required) {
          value += `<span class="text-danger">*</span>`;
        }
      }
      acClearElement({element:container as HTMLElement});
      container.innerHTML = value;
    }
  }

  private _ddInputErrorMessage?: string = '';
  get ddInputErrorMessage(): string | undefined {
    return this._ddInputErrorMessage;
  }
  set ddInputErrorMessage(value: string) {
    this._ddInputErrorMessage = value;
    const container = this.querySelector('[ac-dd-input-error-container]') as HTMLElement | null;
    if (container) {
      acClearElement({element:container});
      container.innerHTML = value;
      if (value == '') {
        container.style.display = 'none';
      }
      else {
        container.style.display = '';
      }
    }
  }

  get validity() {
    if(this.ddInput){
      return this.ddInput.validity;
    }
    return {valid:true};
  }

  get validationMessage() {
    if(this.ddInput){
      return this.ddInput.validationMessage;
    }
    return '';
  }

  ddInputFieldElement!: AcDDInputFieldElement;

  constructor() {
    super();
    this.innerHTML = `<div class="form-group mb-3">
    <ac-form-field>
      <label ac-dd-input-label-container></label>
      <div ac-dd-input-container></div>
      <ac-form-field-error-message></ac-form-field-error-message>
      </ac-form-field>
    </div>`;
  }

  setDDInputStyle() {
    const ddInput: any = this.ddInput;
    if (ddInput && ddInput.inputElement) {
      ddInput.inputElement.classList.add('form-control');
      setTimeout(() => {
          ddInput.inputElement.classList.add('form-control');
      }, 1);
    }
  }
}

acRegisterCustomElement({ tag: 'app-input-field', type: AppInputFieldElement });
