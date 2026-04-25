/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acClearElement, AcElementBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDInputElement } from "./ac-dd-input-element.element";
import { AcDDInputFieldElement } from "./ac-dd-input-field-element.element";

export class AcDDInputFieldBaseElement extends AcElementBase {

  inputElement = document.createElement('div');
  private _ddInput?: AcDDInputElement;
  get ddInput():AcDDInputElement|undefined{
    return this._ddInput;
  }
  set ddInput(value:AcDDInputElement){
    this._ddInput = value;
    const container = this.querySelector('[ac-dd-input-container]');
    if (container) {
      acClearElement({element:container as HTMLElement});
      container.append(value);
    }
  }

  private _ddInputLabel:string = '';
  get ddInputLabel():string{
    return this._ddInputLabel;
  }
  set ddInputLabel(value:string){
    this._ddInputLabel = value;
    const container = this.querySelector('[ac-dd-input-label-conatiner]');
    if (container) {
      acClearElement({element:container as HTMLElement});
      if(this.ddInput && this.ddInput.required){
        value += `<span style="color:red;">*</span>`;
      }
      container.innerHTML = value;
    }
  }

  private _ddInputErrorMessage?:string = '';
  get ddInputErrorMessage():string|undefined{
    return this._ddInputErrorMessage;
  }
  set ddInputErrorMessage(value:string){
    this._ddInputErrorMessage = value;
    const container = this.querySelector('[ac-dd-input-error-conatiner]') as HTMLElement|null;
    if (container) {
      acClearElement({element:container});
      container.innerHTML = value;
      if(value == ''){
        container.style.display = 'none';
      }
      else{
        container.style.display = '';
      }
    }
  }

  override autoDestroyOnDisconnect: boolean = false;

  ddInputFieldElement!:AcDDInputFieldElement;

  override init() {
    super.init();
    this.style.display = 'contents';
    this.innerHTML = `Label : <label ac-dd-input-label-conatiner></label><div ac-dd-input-container></div>`;
  }

}

acRegisterCustomElement({tag:'ac-dd-input-field-base',type:AcDDInputFieldBaseElement});
