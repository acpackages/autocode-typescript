/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcBuilderApi } from "./ac-builder-api";
import { AcEnumBuilderHook } from "../enums/ac-enum-builder-hook.enum";
import { AC_BUILDER_ELEMENT_ATTRIBUTE } from "../consts/ac-builder-element-attribute.const";
import { AcEnumBuilderEvent } from "../enums/ac-enum-builder-event.enum";
import { IAcBuilderElementEventArgs } from "../interfaces/event-args/ac-builder-element-event-args.interface";
import { AcBuilderElementsManager } from "./ac-builder-elements-manager";
import { IAcComponentElement } from "../interfaces/ac-component-element.interface";
import { IAcBuilderElement } from "../interfaces/ac-builder-element.interface";
import { AcDelayedCallback } from "@autocode-ts/autocode";

export class AcBuilderEventsHandler {
  builderApi: AcBuilderApi;
  private delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  constructor({ builderApi }: { builderApi: AcBuilderApi }) {
    this.builderApi = builderApi;
  }

  getFunctionUseCount({ functionName }: { functionName: string }): number {
    let count: number = 0;
    if (this.builderApi.component.elements) {
      for (const builderElement of Object.values(this.builderApi.component.elements)) {
        for (const fun of Object.values(builderElement.events)) {
          if (fun.functionName == functionName) {
            count++;
          }
        }
      }
    }
    return count;
  }

  handleElementAdd({ element }: { element: HTMLElement }) {
    if (element.nodeType === Node.ELEMENT_NODE) {
      if (element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)) {
        const elementId: string = element.getAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)!;
        const componentElement = this.builderApi.component.elements![elementId];
        const builderElement = AcBuilderElementsManager.getElement({ name: componentElement.name });
        if (builderElement) {
          this.initBuilderElementInstance({ componentElement, builderElement });
          const instance = new builderElement.instanceClass();
          componentElement.instance = instance;
          instance.element = element;
          if (componentElement) {
            const eventArgs: IAcBuilderElementEventArgs = {
              componentElement: componentElement
            };
            this.builderApi.hooks.execute({ hook: AcEnumBuilderHook.ElementAdd, args: eventArgs });
            this.builderApi.events.execute({ event: AcEnumBuilderEvent.ElementAdd, args: eventArgs });
          }
          if(element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementAdded)){
            instance.initBuilder({ args: { element: element } });
          }
          instance.init({ args: { element: element } });
          if (this.builderApi.runtime) {
            this.builderApi.runtime.runtimeComponent?.setElementInstance({ element: componentElement });
          }
        }
      }
    }
  }

  async handleElementRemove({ element }: { element: HTMLElement }) {
    if (element.nodeType === Node.ELEMENT_NODE) {
      if (element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)) {
        if (!this.builderApi.refreshingEditorHtml) {
          const elementId: string = element.getAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)!;
          const builderElement = this.builderApi.component.elements![elementId];
          if (builderElement) {
            const className = this.builderApi.component.className!;
            await this.builderApi.scriptEditor.helper.removePropertyInClass({ className: className, propertyName: builderElement.instanceName });
            for (const fun of Object.values(builderElement.events)) {
              const useCount = this.getFunctionUseCount({ functionName: fun.functionName! });
              if (useCount <= 1) {
                await this.builderApi.scriptEditor.helper.removeFunctionInClass({ className: className, functionName: fun.functionName! });
              }
            }
            delete this.builderApi.component.elements![elementId];
          }
        }
      }
    }
  }

  handleElementSelect({ element }: { element: HTMLElement }) {
    if (element.nodeType === Node.ELEMENT_NODE) {
      if (element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)) {
        const elementId: string = element.getAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)!;
        if (this.builderApi.component.elements && this.builderApi.component.elements[elementId]) {
          const componentElement = this.builderApi.component.elements[elementId];
          this.builderApi.selectedElement = componentElement;
          if (componentElement) {
            const eventArgs: IAcBuilderElementEventArgs = {
              componentElement: componentElement
            };
            this.builderApi.hooks.execute({ hook: AcEnumBuilderHook.ElementSelect, args: eventArgs });
            this.builderApi.events.execute({ event: AcEnumBuilderEvent.ElementSelect, args: eventArgs });
          }
        }
      }
    }
  }

  initBuilderElementInstance({ componentElement, builderElement }: { componentElement: IAcComponentElement, builderElement: IAcBuilderElement }) {
    if (componentElement.instance && componentElement.instance.element) {
      const htmlElement: HTMLElement = componentElement.instance.element;
      if (!htmlElement.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml)) {
        if (builderElement.keepHtml != false) {
          htmlElement.setAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml, 'true');
        }
        else {
          htmlElement.setAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml, 'false');
        }
      }
    }
    else {
      this.delayedCallback.add({callback:() => {
        this.initBuilderElementInstance({ componentElement, builderElement });
      }, duration:5});
    }
  }

}
