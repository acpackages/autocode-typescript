import { AcInputBase, acRegisterCustomElement, AcSelectInputElement } from "@autocode-ts/ac-browser";
import { AcBuilderApi } from "../../core/ac-builder-api";
import { AcEnumBuilderHook } from "../../enums/ac-enum-builder-hook.enum";

export class AcEventSelectInput extends AcInputBase{
  builderApi:AcBuilderApi;
  override inputElement:AcSelectInputElement = new AcSelectInputElement();

  override get value(): any {
    return this.inputElement.value;
  }
  override set value(value: any) {
    this.inputElement.value = value;
    this.setValue(value);
  }

  constructor({builderApi}:{builderApi:AcBuilderApi}){
    super();
    this.builderApi = builderApi;
    this.builderApi.hooks.subscribe({hook:AcEnumBuilderHook.ScriptFunctionChange,callback:()=>{
      this.setOptions();
    }});
    this.setOptions();
  }

  async setOptions(){
    if(this.builderApi.scriptEditor && this.builderApi.component.className){
      const functions = await this.builderApi.scriptEditor.helper.getFunctionsInClass({className:this.builderApi.component.className});
      this.inputElement.options = functions;
    }
  }

}

acRegisterCustomElement({tag:'ac-builder-event-select-input',type:AcEventSelectInput});
