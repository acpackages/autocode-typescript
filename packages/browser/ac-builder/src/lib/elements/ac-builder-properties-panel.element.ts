/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acAddClassToElement, AcCollapse, AcCollapseAttributeName, AcEnumCollapseEvent, AcFilterableElements, AcFilterableElementsAttributeName } from "@autocode-ts/ac-browser";
import { AcBuilderCssClassName } from "../consts/ac-builder-css-class-name.const";
import { AcBuilderApi } from "../core/ac-builder-api";
import { AcEnumBuilderHook } from "../enums/ac-enum-builder-hook.enum";
import { IAcBuilderElementProperty } from "../interfaces/ac-builder-element-property.interface";
import { AcElementPropertyInput } from "./inputs/ac-element-property-input.element";
import { AcBuilderElementsManager } from "../core/ac-builder-elements-manager";
import { AC_BUILDER_SVGS } from "../consts/ac-builder-svgs.consts";

export class AcBuilderPropertiesPanel {
  builderApi: AcBuilderApi;
  element: HTMLElement = document.createElement('div');
  elementProperties: IAcBuilderElementProperty[] = [];
  inputsContainer: HTMLElement;
  constructor({ builderApi }: { builderApi: AcBuilderApi }) {
    this.builderApi = builderApi;
    acAddClassToElement({element:this.element,class_:"ac-builder-properties-tab-container"});
    this.element.innerHTML = `
      <div class="p-2">
        <input type="text" class="${AcBuilderCssClassName.acBuilderSidebarInput} ac-properties-filter-input" placeholder="Search..." ac-filter-input>
      </div>
      <div class="ac-builder-properties-panel ac-builder-scrollable-element" >
      </div>
    `;
    this.inputsContainer = this.element.querySelector('.ac-builder-properties-panel') as HTMLElement;
    this.builderApi.hooks.subscribe({
      hook: AcEnumBuilderHook.ElementSelect, callback: (args: any) => {
        this.setElementProperties();
      }
    });
    new AcFilterableElements({ element: this.element });
  }

  private getCategoryElement({ categoryName }: { categoryName: string }) {
    const categoryAttributeValue = categoryName.replaceAll(' ',"_").replaceAll('-',"_").replaceAll('&',"_").toLowerCase();
    let categoryContainer = this.inputsContainer.querySelector(`[ac-data-category=${categoryAttributeValue}]`);
    if (categoryContainer == undefined) {
      categoryContainer = document.createElement('div');
      categoryContainer.setAttribute(AcFilterableElementsAttributeName.acFilterElementGroup, 'true');
      categoryContainer.setAttribute('ac-data-category', categoryAttributeValue);
      acAddClassToElement({ element: categoryContainer, class_: 'gjs-block-category gjs-open' });
      categoryContainer.innerHTML = `<ac-collapse ${AcCollapseAttributeName.acCollapseOpen}>
      <div class="gjs-title" ${AcCollapseAttributeName.acCollapseToggle}>
        <span class="gjs-caret-icon"><ac-svg-icon class="ac-category-collapse-icon-svg">${AC_BUILDER_SVGS.caretDown}</ac-svg-icon></span> ${categoryName}
      </div>
      <div class="gjs-blocks-c category-inputs-container gjs-sm-properties p-1" ${AcCollapseAttributeName.acCollapseContent} ${AcCollapseAttributeName.acCollapseOpen}></div>
      </ac-collapse>
      `;
      this.inputsContainer.append(categoryContainer);
      const collapse = categoryContainer.querySelector('ac-collapse') as AcCollapse;
      collapse.on({event:AcEnumCollapseEvent.Open,callback:()=>{
        const iconElement = categoryContainer?.querySelector('.ac-category-collapse-icon-svg');
        if(iconElement) iconElement.innerHTML = AC_BUILDER_SVGS.caretDown;
      }});
      collapse.on({event:AcEnumCollapseEvent.Close,callback:()=>{
        const iconElement = categoryContainer?.querySelector('.ac-category-collapse-icon-svg');
        if(iconElement) iconElement.innerHTML = AC_BUILDER_SVGS.caretRight;
      }});
    }
    return categoryContainer;
  }

  renderInputs() {
    for (const property of this.elementProperties) {
      const propertyInput = new AcElementPropertyInput({ builderApi: this.builderApi, property: property, componentElement: this.builderApi.selectedElement! });
      const categoryElement = this.getCategoryElement({ categoryName: property.category });
      (categoryElement.querySelector('.category-inputs-container') as HTMLElement).append(propertyInput.element);
    }
  }

  setElementProperties() {
    this.inputsContainer.innerHTML = "";
    this.elementProperties = [];
    if (this.builderApi.selectedElement) {
      const elementName = this.builderApi.selectedElement.name;
      const element = AcBuilderElementsManager.getElement({name:elementName});
      if (element && element.properties) {
        this.elementProperties = element.properties;
      }
    }
    this.renderInputs();
  }
}
