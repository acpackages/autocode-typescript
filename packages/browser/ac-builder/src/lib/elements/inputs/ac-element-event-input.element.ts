/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acAddClassToElement, AcEnumInputEvent, AcFilterableElementsAttributeName } from "@autocode-ts/ac-browser";
import { stringToCamelCase } from "@autocode-ts/ac-extensions";
import { AcBuilderApi } from "../../core/ac-builder-api";
import { IAcBuilderElementEvent } from "../../interfaces/ac-builder-element-event.interface";
import { IAcComponentElement } from "../../interfaces/ac-component-element.interface";
import { AcEventSelectInput } from "./ac-event-select-input.element";
import { AC_BUILDER_SVGS } from "../../consts/ac-builder-svgs.consts";

export class AcElementEventInput {
  builderApi: AcBuilderApi;
  element: HTMLElement = document.createElement('div');
  event: IAcBuilderElementEvent;
  componentElement: IAcComponentElement;
  input!: AcEventSelectInput;
  constructor({ builderApi, event, componentElement }: { builderApi: AcBuilderApi, componentElement: IAcComponentElement, event: IAcBuilderElementEvent }) {
    this.builderApi = builderApi;
    this.event = event;
    this.componentElement = componentElement;
    this.element.setAttribute(AcFilterableElementsAttributeName.acFilterValue, this.event.title);
    acAddClassToElement({ element: this.element, class_: 'gjs-sm-property gjs-sm-color gjs-sm-property__color gjs-sm-property--full' })
    this.element.innerHTML = `
        <div class="gjs-sm-label">
        <span class="gjs-sm-icon ">
          ${event.title}
        </span>
      </div>
        <div class="gjs-fields" data-sm-fields="">
          <div class="gjs-field">
            <span class="gjs-input-holder">
            </span>
            <span class="gjs-field-arrows px-0" style="min-width:max-content;padding-top:0px">
            <button type="button" class="btn p-0 text-secondary btn-add-event" style="width:30px;margin-top:-3px">
            <span class="ac-builder-icon-svg"><ac-svg-icon>${AC_BUILDER_SVGS.plus}</ac-svg-icon></span>
            </button>
            </span>
          </div>
      </div>`;
    this.setInput();
  }

  private setInput() {
    this.input = new AcEventSelectInput({ builderApi: this.builderApi });
    (this.element.querySelector('.gjs-input-holder') as HTMLInputElement).append(this.input);
    if (this.componentElement && this.componentElement.events) {
      if (this.componentElement.events[this.event.name]) {
        this.input.value = this.componentElement.events[this.event.name].functionName;
      }
    }
    this.input.on({event: AcEnumInputEvent.ValueChange, callback: () => {
        this.componentElement.events[this.event.name] = {
          name: this.event.name,
          functionName:this.input.value
        };
      }
    });
    (this.element.querySelector('.btn-add-event') as HTMLInputElement).addEventListener('click', async () => {
      const functionName = stringToCamelCase(`handle_${this.componentElement.instanceName}_${this.event.name}`);
      await this.builderApi.scriptEditor?.addCodeInsideClass({ className: this.builderApi.component.className!, code: `${functionName}() {\n\t}\n` });
      await this.builderApi.scriptEditor.gotoFunction({className:this.builderApi.component.className!,functionName:functionName});
      this.input.value = functionName;
      this.builderApi.toggleScriptEditor();
    });
    this.input.on({event:AcEnumInputEvent.DoubleClick,callback:async ()=>{
      this.input.inputElement.closeDropdown();
      this.builderApi.toggleScriptEditor();
      if (this.componentElement && this.componentElement.events && this.componentElement.events[this.event.name] && this.componentElement.events[this.event.name].functionName){
        await this.builderApi.scriptEditor.gotoFunction({className:this.builderApi.component.className!,functionName:this.componentElement.events[this.event.name].functionName!});
      }
    }});
  }
}
