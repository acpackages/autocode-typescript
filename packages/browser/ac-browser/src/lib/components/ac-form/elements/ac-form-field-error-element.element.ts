import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";

export class AcFormFieldErrorMessage extends AcElementBase {
  private originalMessageHtml = "";

  override init(): void {
    super.init();
    this.style.display = "none";
    this.originalMessageHtml = this.innerHTML;
  }

  setError({message,show = true}:{message?:string,show?:boolean}){
    if(show){
      this.style.display = "block";
      acClearElement({element:this});
      if(this.originalMessageHtml){
        this.innerHTML = this.originalMessageHtml;
      }
      else{
        this.innerHTML = message ?? "";
      }
    }
    else{
      this.style.display = "none";
    }

  }

}

acRegisterCustomElement({ tag: "ac-form-field-error-message", type: AcFormFieldErrorMessage });
