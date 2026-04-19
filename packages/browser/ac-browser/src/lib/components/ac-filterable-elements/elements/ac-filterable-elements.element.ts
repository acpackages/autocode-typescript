/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcFilterableElementsAttributeName } from "../consts/ac-filterable-elements-attribute-name.const";
import { acHideElement, acRegisterCustomElement, acShowElement } from "../../../utils/ac-element-functions";
import { AC_FLITERABLE_TAG } from "../_ac-filterable-elements.export";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcFilterableElements extends AcElementBase{
  private filterTimeout:any;

  override init() {
    super.init();
    const filterInput = this.querySelector(`[${AcFilterableElementsAttributeName.acFilterInput}]`);
    if(filterInput){
      this.registerInputElement({element:filterInput as HTMLInputElement});
    }
  }

  filter({query}:{query:string}){
    query = query.toLowerCase().trim();
    const regex = new RegExp(query, "i");
    const elements = Array.from(this.querySelectorAll(`[${AcFilterableElementsAttributeName.acFilterValue}]`)) as HTMLElement[];
    for(const element of elements){
      const filterValue = element.getAttribute(AcFilterableElementsAttributeName.acFilterValue)!.toLowerCase().trim();
      if(filterValue == "" || regex.test(filterValue)){
        if(element.hasAttribute(AcFilterableElementsAttributeName.acFilterElementHidden)){
          element.removeAttribute(AcFilterableElementsAttributeName.acFilterElementHidden);
          acShowElement({element:element,duration:150});
        }
      }
      else{
        if(!element.hasAttribute(AcFilterableElementsAttributeName.acFilterElementHidden)){
          element.setAttribute(AcFilterableElementsAttributeName.acFilterElementHidden,"true");
          acHideElement({element:element,animateHeight:true,duration:150});
        }
      }
    }
    this.filterGroups();
  }

  private filterGroups(){
    const elementGroups = Array.from(this.querySelectorAll(`[${AcFilterableElementsAttributeName.acFilterElementGroup}]`)) as HTMLElement[];
    for(const group of elementGroups){
      const visibleElements = group.querySelectorAll(`[${AcFilterableElementsAttributeName.acFilterValue}]:not([${AcFilterableElementsAttributeName.acFilterElementHidden}])`);
      if(visibleElements.length > 0){
        if(group.hasAttribute(AcFilterableElementsAttributeName.acFilterElementGroupHidden)){
          group.removeAttribute(AcFilterableElementsAttributeName.acFilterElementGroupHidden);
          acShowElement({element:group,duration:200});
        }
      }
      else{
        if(!group.hasAttribute(AcFilterableElementsAttributeName.acFilterElementGroupHidden)){
          group.setAttribute(AcFilterableElementsAttributeName.acFilterElementGroupHidden,"true");
          acHideElement({element:group,animateHeight:true,duration:200});
        }
      }
    }
  }

  registerInputElement({element}:{element:HTMLInputElement}){
    element.addEventListener('input',(event)=>{
      this.filter({query:element.value});
    });
  }
}

acRegisterCustomElement({tag:AC_FLITERABLE_TAG.filterableElements,type:AcFilterableElements});
